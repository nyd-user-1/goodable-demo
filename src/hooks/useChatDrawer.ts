/**
 * useChatDrawer — Unified chat hook
 *
 * Replaces ~250 lines of duplicated chat logic in each dashboard drawer.
 * Handles: streaming, state, model routing, abort, persistence, feedback.
 *
 * Usage:
 *   const chat = useChatDrawer({
 *     entityType: 'contract',
 *     entityName: 'Acme Corp',
 *     dataContext: '...CSV rows...',
 *     scope: 'vendor',
 *   });
 *
 * Note: Consumers should memoize object props (sessionContext, metadata)
 * to avoid unnecessary system prompt recomputations.
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useModel, type ModelType } from '@/contexts/ModelContext';
import { useChatPersistence } from '@/hooks/useChatPersistence';
import {
  composeSystemPrompt,
  type EntityType,
  type SystemPromptConfig,
} from '@/lib/prompts/systemPromptComposer';
import {
  parseSSEStream,
  extractNonStreamingContent,
} from '@/utils/sseStreamParser';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  streamedContent?: string;
  feedback?: 'good' | 'bad' | null;
}

export interface UseChatDrawerConfig {
  /** The domain / entity type this chat is about */
  entityType: EntityType;
  /** Human-readable name of the entity (vendor, lobbyist, member, etc.) */
  entityName?: string;
  /** Pre-loaded data to ground the model (CSV, formatted text, etc.) */
  dataContext?: string;
  /** Additional structured context (note content, school funding breakdown, etc.) */
  sessionContext?: Record<string, unknown>;
  /** Scope within the entity type (e.g., 'department', 'vendor', 'member', 'bill') */
  scope?: string;
  /** Optional metadata filters */
  metadata?: SystemPromptConfig['metadata'];
  /** Persist messages to DB for fine-tuning (default: true) */
  persist?: boolean;
  /** Let edge function query additional data sources (default: false) */
  enhanceWithNYSData?: boolean;
  /** Use fast mode in edge function (default: true) */
  fastMode?: boolean;
  /** Approximate word count limit appended to prompt (default: 250) */
  wordCountLimit?: number;
  /** Called after each assistant message finishes streaming */
  onMessageComplete?: (message: ChatMessage) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEdgeFunctionName(model: ModelType): string {
  if (model.startsWith('claude-')) return 'generate-with-claude';
  if (model.includes('sonar')) return 'generate-with-perplexity';
  return 'generate-with-openai';
}

/** Convert a ChatMessage (Date timestamp) to a persistable shape (ISO string). */
function toPersistedMessage(msg: ChatMessage) {
  return {
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp.toISOString(),
    feedback: msg.feedback,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useChatDrawer(config: UseChatDrawerConfig) {
  const {
    entityType,
    entityName,
    dataContext,
    sessionContext,
    scope,
    metadata,
    persist = true,
    enhanceWithNYSData = false,
    fastMode = true,
    wordCountLimit = 250,
    onMessageComplete,
  } = config;

  // ---- State ----
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedModel, setSelectedModel } = useModel();

  // Always call hook (Rules of Hooks) — conditionally use its methods
  const persistence = useChatPersistence();

  // ---- Refs (keep sendMessage callback stable) ----
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;
  const isLoadingRef = useRef(false);
  const onMessageCompleteRef = useRef(onMessageComplete);
  onMessageCompleteRef.current = onMessageComplete;

  // ---- System prompt (memoized) ----
  // Stringify object props for stable memo deps
  const sessionContextKey = useMemo(
    () => (sessionContext ? JSON.stringify(sessionContext) : ''),
    [sessionContext],
  );
  const metadataKey = useMemo(
    () => (metadata ? JSON.stringify(metadata) : ''),
    [metadata],
  );

  const systemPrompt = useMemo(
    () =>
      composeSystemPrompt({
        entityType,
        entityName,
        dataContext,
        sessionContext: sessionContext as Record<string, any>,
        scope,
        metadata,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entityType, entityName, dataContext, sessionContextKey, scope, metadataKey],
  );

  // ------------------------------------------------------------------
  // sendMessage
  // ------------------------------------------------------------------
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoadingRef.current) return;

      const trimmedText = text.trim();

      // Create messages
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmedText,
        timestamp: new Date(),
      };

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now() + 1}`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        streamedContent: '',
      };

      // Snapshot current messages (before state update) for context + persistence
      const previousMsgs = messagesRef.current;

      setMessages(prev => [...prev, userMsg, assistantMsg]);
      isLoadingRef.current = true;
      setIsLoading(true);

      // Create session on first message (if persisting)
      if (persist && !sessionIdRef.current) {
        const title = trimmedText.substring(0, 100);
        const initialPersisted = [
          ...previousMsgs.filter(m => !m.isStreaming).map(toPersistedMessage),
          toPersistedMessage(userMsg),
        ];
        const id = await persistence.createSession(title, initialPersisted);
        sessionIdRef.current = id;
      }

      try {
        // Cancel any in-flight request
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        // Previous messages context (last 10)
        const previousMessages = previousMsgs
          .slice(-10)
          .map(m => ({ role: m.role, content: m.content }));

        // Auth + endpoint
        const edgeFunction = getEdgeFunctionName(selectedModel);
        const supabaseUrl = (supabase as any).supabaseUrl;
        const supabaseKey = (supabase as any).supabaseKey;
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const useStreaming = !selectedModel.includes('sonar');

        const response = await fetch(
          `${supabaseUrl}/functions/v1/${edgeFunction}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token || supabaseKey}`,
              apikey: supabaseKey,
            },
            body: JSON.stringify({
              prompt: `${trimmedText} (limit response to approximately ${wordCountLimit} words)`,
              type: 'chat',
              stream: useStreaming,
              model: selectedModel,
              context: {
                systemContext: systemPrompt,
                previousMessages,
              },
              enhanceWithNYSData,
              fastMode,
            }),
            signal: abortControllerRef.current.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }

        let aiResponse = '';

        if (useStreaming && response.body) {
          const reader = response.body.getReader();
          readerRef.current = reader;

          aiResponse = await parseSSEStream(reader, (_chunk, accumulated) => {
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMsg.id
                  ? { ...m, content: accumulated, streamedContent: accumulated }
                  : m,
              ),
            );
          });

          readerRef.current = null;
        } else {
          // Non-streaming (Perplexity or missing body)
          const data = await response.json();
          aiResponse = extractNonStreamingContent(data);
        }

        // Finalize assistant message
        const finalizedAssistant: ChatMessage = {
          ...assistantMsg,
          content: aiResponse,
          isStreaming: false,
          streamedContent: undefined,
        };

        setMessages(prev =>
          prev.map(m => (m.id === assistantMsg.id ? finalizedAssistant : m)),
        );

        // Persist completed conversation
        if (persist && sessionIdRef.current) {
          const allPersisted = [
            ...previousMsgs.filter(m => !m.isStreaming).map(toPersistedMessage),
            toPersistedMessage(userMsg),
            toPersistedMessage(finalizedAssistant),
          ];
          persistence.updateMessages(sessionIdRef.current, allPersisted);
        }

        onMessageCompleteRef.current?.(finalizedAssistant);
      } catch (error: any) {
        if (error.name === 'AbortError') return;

        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsg.id
              ? {
                  ...m,
                  content: `Sorry, something went wrong. ${error.message || 'Please try again.'}`,
                  isStreaming: false,
                  streamedContent: undefined,
                }
              : m,
          ),
        );
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [selectedModel, systemPrompt, persist, persistence, wordCountLimit, enhanceWithNYSData, fastMode],
  );

  // ------------------------------------------------------------------
  // stopStream
  // ------------------------------------------------------------------
  const stopStream = useCallback(() => {
    abortControllerRef.current?.abort();
    readerRef.current?.cancel();
    readerRef.current = null;
    isLoadingRef.current = false;
    setIsLoading(false);

    // Finalize any in-flight streaming messages with whatever content arrived
    setMessages(prev =>
      prev.map(m =>
        m.isStreaming
          ? { ...m, isStreaming: false, content: m.streamedContent || m.content }
          : m,
      ),
    );
  }, []);

  // ------------------------------------------------------------------
  // clearMessages
  // ------------------------------------------------------------------
  const clearMessages = useCallback(() => {
    setMessages([]);
    sessionIdRef.current = null;
    persistence.clearSession();
  }, [persistence]);

  // ------------------------------------------------------------------
  // handleFeedback
  // ------------------------------------------------------------------
  const handleFeedback = useCallback(
    (messageId: string, feedback: 'good' | 'bad' | null) => {
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, feedback } : m)),
      );

      // Persist the feedback update
      if (persist && sessionIdRef.current) {
        const updated = messagesRef.current.map(m =>
          m.id === messageId ? { ...m, feedback } : m,
        );
        const persisted = updated
          .filter(m => !m.isStreaming)
          .map(toPersistedMessage);
        persistence.updateMessages(sessionIdRef.current, persisted);
      }
    },
    [persist, persistence],
  );

  // ------------------------------------------------------------------
  // Return
  // ------------------------------------------------------------------
  return {
    messages,
    setMessages,
    isLoading,
    selectedModel,
    setSelectedModel,
    sendMessage,
    stopStream,
    clearMessages,
    handleFeedback,
    systemPrompt, // exposed for debugging
    sessionId: sessionIdRef.current,
  };
}
