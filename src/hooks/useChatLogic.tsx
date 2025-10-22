import { useCallback } from 'react';
import { EntityType } from './chat/types';
import { useSessionManager } from './chat/useSessionManager';
import { useMessageHandler } from './chat/useMessageHandler';
import { useSessionInitializer } from './chat/useSessionInitializer';
import { useChatState } from './chat/useChatState';
import { useChatActions } from './chat/useChatActions';

export const useChatLogic = (entity: any, entityType: EntityType) => {
  const {
    inputValue,
    setInputValue,
    isLoading,
    setIsLoading,
    messages,
    setMessages,
    citations,
    setCitations,
    sessionId,
    setSessionId
  } = useChatState();

  const { handleShareChat, getTitle } = useChatActions(entity, entityType);

  const { saveChatSession } = useSessionManager(entity, entityType);
  const { sendMessage: handleSendMessage, stopStream } = useMessageHandler(entity, entityType);
  const { initializeSession: handleInitialization } = useSessionInitializer(entity, entityType);

  const wrappedSaveChatSession = useCallback(async (messages: any[], title?: string) => {
    await saveChatSession(messages, sessionId, setSessionId);
  }, [saveChatSession, sessionId]);

  const sendMessage = useCallback(async (message: string) => {
    await handleSendMessage(
      message,
      messages,
      setMessages,
      setIsLoading,
      wrappedSaveChatSession,
      setCitations
    );
  }, [handleSendMessage, messages, wrappedSaveChatSession, setMessages, setIsLoading, setCitations]);

  const initializeSession = useCallback(async (withInitialMessage = false) => {
    await handleInitialization(
      withInitialMessage,
      setMessages,
      setIsLoading,
      wrappedSaveChatSession
    );
  }, [handleInitialization, wrappedSaveChatSession, setMessages, setIsLoading]);

  return {
    inputValue,
    setInputValue,
    isLoading,
    messages,
    citations,
    sendMessage,
    handleShareChat,
    getTitle,
    initializeSession,
    stopStream
  };
};