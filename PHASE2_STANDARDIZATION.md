# Phase 2: AI Chat Standardization Plan

> Branch: `Fine-Tuning`
> Status: Planning
> Goal: Converge 12 AI trigger patterns into one shared architecture

---

## Principles

1. **One hook to rule them all** — `useChatDrawer` handles streaming, state, model routing, abort, and optional persistence
2. **Frontend owns context, edge functions own safety** — Frontend builds the context/data layer; edge functions prepend constitutional principles and handle LLM calls
3. **Pre-load data, don't double-query** — If the trigger already has the data, pass it as context and set `enhanceWithNYSData: false`
4. **Prompt logging for fine-tuning** — Every AI response should log what the model actually saw (system prompt + context + user message)
5. **All chats persist** — Every AI interaction saves to DB for fine-tuning data collection. Feedback buttons render on all chats.

---

## Architecture

### System Prompt Layering

```
EDGE FUNCTION SIDE (not visible to frontend):
┌──────────────────────────────────────────┐
│  Constitutional Principles               │
│  (_shared/constitution.ts — already done)│
└──────────────────────────────────────────┘

FRONTEND SIDE (passed via systemContext):
┌──────────────────────────────────────────┐
│  BASE: NY Legislative Domain Knowledge   │
│  (src/lib/prompts/nyLegislativeDomain.ts)│
│  Bill lifecycle, acronyms, agencies,     │
│  budget process, lobbying disclosure     │
├──────────────────────────────────────────┤
│  CONTEXT: Entity-Specific Prompt + Data  │
│  (src/lib/prompts/domainPrompts.ts)      │
│  Contracts / Budget / Lobbying / Votes / │
│  Note / SchoolFunding / Standalone       │
├──────────────────────────────────────────┤
│  METADATA: Filters & Retrieved Chunks    │
│  Session year, committee, agency, etc.   │
│  (Phase 3: RAG chunks go here)           │
└──────────────────────────────────────────┘
```

### Edge Function Protocol

All 3 edge functions (`generate-with-openai`, `generate-with-claude`, `generate-with-perplexity`) accept:

```typescript
interface EdgeFunctionPayload {
  prompt: string;               // User message
  type: string;                 // Entity type hint
  stream: boolean;              // SSE streaming
  model: string;                // Model variant
  fastMode: boolean;            // Skip enrichment
  enhanceWithNYSData: boolean;  // Let edge fn query DB/API
  context: {
    systemContext?: string;     // Pre-built prompt from frontend
    previousMessages?: Array<{ role: string; content: string }>;
  };
}
```

When `systemContext` is provided, the edge function prepends constitutional principles and uses it as-is (no additional prompt building). When absent, edge function falls back to its current internal prompt logic.

---

## Migration Steps

### Step 0: Delete dead code
- [ ] `git rm src/hooks/chat/useChatLogic.tsx`
- [ ] `git rm src/hooks/chat/useSessionInitializer.ts`
- [ ] `git rm src/hooks/chat/useMessageHandler.ts`
- [ ] `git rm src/hooks/chat/types.ts` (if only used by above)
- [ ] `git rm src/hooks/chat/utils.ts` (if only used by above)
- [ ] Run `npm run typecheck` to confirm nothing breaks

### Step 1: Create prompt files
- [ ] `src/lib/prompts/nyLegislativeDomain.ts` — NY-specific domain knowledge (bill lifecycle, acronyms, agencies, budget timeline, lobbying disclosure, contract approval, chambers)
- [ ] `src/lib/prompts/domainPrompts.ts` — Migrate existing inline prompts from drawers (contracts, budget, lobbying, votes, note). Shorter/tighter versions focused on behavior rules + data grounding instructions
- [ ] `src/lib/prompts/systemPromptComposer.ts` — `getSystemPrompt(config)` composes base + context + metadata layers. Returns a string to pass as `systemContext`

### Step 2: Create `useChatDrawer` hook
- [ ] `src/hooks/useChatDrawer.ts` — Single hook replacing 4 drawer implementations

**Hook API:**
```typescript
useChatDrawer({
  entityType: 'contract' | 'budget' | 'lobbying' | 'votes' | 'note' | 'bill' | 'member' | 'committee' | 'standalone' | 'schoolFunding';
  entityName?: string;
  dataContext?: string;
  sessionContext?: Record<string, any>;
  persist?: boolean;        // default: true
  enhanceWithNYSData?: boolean; // default: false
  fastMode?: boolean;       // default: true
  wordCountLimit?: number;  // default: 250
  onMessageComplete?: (msg) => void;
})
```

**Returns:**
```typescript
{
  messages, setMessages,
  isLoading,
  selectedModel, setSelectedModel,
  sendMessage: (text: string) => Promise<void>,
  stopStream: () => void,
  clearMessages: () => void,
  handleFeedback: (messageId: string, feedback: 'good' | 'bad' | null) => void,
  systemPrompt   // exposed for debugging
}
```

**Key implementation details:**
- Always call `useChatPersistence()` (Rules of Hooks) — conditionally skip save calls when `persist: false`
- Model routing: `claude-*` → `generate-with-claude`, `sonar` → `generate-with-perplexity`, else → `generate-with-openai`
- Unified SSE streaming parser handles both OpenAI (`choices[0].delta.content`) and Claude (`delta.text`) formats
- `handleFeedback` updates local state; only persists to DB when `persist: true`
- Feedback buttons only rendered in UI when `persist: true`

### Step 3: Migrate dashboard drawers
Each drawer loses ~250 lines of custom logic, keeps only UI rendering.

- [ ] `ContractsChatDrawer.tsx` — Replace with `useChatDrawer({ entityType: 'contract', ... })`
- [ ] `BudgetChatDrawer.tsx` — Replace with `useChatDrawer({ entityType: 'budget', ... })`
- [ ] `LobbyingChatDrawer.tsx` — Replace with `useChatDrawer({ entityType: 'lobbying', ... })`
- [ ] `VotesChatDrawer.tsx` — Replace with `useChatDrawer({ entityType: 'votes', ... })`

**Typecheck + smoke test after each drawer.**

### Step 4: Migrate NoteView chat
- [ ] `NoteView.tsx` — Replace inline streaming logic with `useChatDrawer({ entityType: 'note', ... })`

### Step 5: Simplify NewChat context paths
NewChat keeps its own `handleSubmit` (it's the only place with article fetch, "What is NYSgpt?", and multi-mode conversations). But:

- [ ] Extract contract context building into a helper: `buildContractContext(contractNumber)` → returns `systemContext` string
- [ ] Extract school funding context building into a helper: `buildSchoolFundingContext(data)` → returns `systemContext` string
- [ ] Use `systemPromptComposer` to build these instead of inline string concatenation
- [ ] Pass `systemContext` to the edge function, set `enhanceWithNYSData: false` for these paths
- [ ] Extract the SSE streaming parser into a shared util (`src/utils/sseStreamParser.ts`) that both `useChatDrawer` and NewChat use

### Step 6: Add prompt logging
- [ ] Add `promptLog?: string` field to `PersistedMessage` interface in `useChatPersistence.ts`
- [ ] When persisting assistant messages, include the full `systemContext` that was sent to the edge function
- [ ] This gives us: user query + system prompt + AI response + feedback rating — complete fine-tuning tuple

### Step 7: Update edge functions
- [ ] `generate-with-openai/index.ts` — When `context.systemContext` is present, use it (prepend constitutional prompt) instead of building internally. Keep internal prompt building as fallback for backwards compat.
- [ ] `generate-with-claude/index.ts` — Same pattern
- [ ] `generate-with-perplexity/index.ts` — Same pattern (Perplexity may keep its own web-search-focused prompt)

---

## What NOT to Change

- **NewChat's `handleSubmit` stays.** It orchestrates too many unique flows (article fetch, NYSgpt explainer, multi-mode conversations) to delegate entirely to `useChatDrawer`.
- **Constitutional principles stay server-side.** `_shared/constitution.ts` is already centralized in the edge functions. Don't duplicate to frontend.
- **PromptHub navigation pattern stays.** Pages that navigate to `/?prompt=...` are fine — they're just routing, not AI logic.
- **ExcerptView stays untouched.** No `onFeedback` passed, no changes needed.

---

## File Inventory (New & Modified)

### New Files
| File | Purpose |
|------|---------|
| `src/lib/prompts/nyLegislativeDomain.ts` | NY legislative domain knowledge constant |
| `src/lib/prompts/domainPrompts.ts` | Centralized domain-specific system prompts |
| `src/lib/prompts/systemPromptComposer.ts` | Composes base + context + metadata into system prompt |
| `src/hooks/useChatDrawer.ts` | Unified chat hook (streaming, state, persistence, model routing) |
| `src/utils/sseStreamParser.ts` | Shared SSE streaming parser |

### Modified Files
| File | Change |
|------|--------|
| `src/components/ContractsChatDrawer.tsx` | Replace ~250 lines with `useChatDrawer` |
| `src/components/BudgetChatDrawer.tsx` | Replace ~250 lines with `useChatDrawer` |
| `src/components/LobbyingChatDrawer.tsx` | Replace ~250 lines with `useChatDrawer` |
| `src/components/VotesChatDrawer.tsx` | Replace ~250 lines with `useChatDrawer` |
| `src/pages/NoteView.tsx` | Replace ~140 lines with `useChatDrawer` |
| `src/pages/NewChat.tsx` | Extract contract/school funding context builders, use shared SSE parser |
| `src/hooks/useChatPersistence.ts` | Add `promptLog` field to `PersistedMessage` |
| `src/components/ChatResponseFooter.tsx` | Only show feedback buttons when `onFeedback` provided AND messages are persisted |
| `supabase/functions/generate-with-openai/index.ts` | Accept `systemContext`, prepend constitutional prompt |
| `supabase/functions/generate-with-claude/index.ts` | Same |
| `supabase/functions/generate-with-perplexity/index.ts` | Same |

### Deleted Files
| File | Reason |
|------|--------|
| `src/hooks/chat/useChatLogic.tsx` | Dead code (never imported) |
| `src/hooks/chat/useSessionInitializer.ts` | Dead code (never imported) |
| `src/hooks/chat/useMessageHandler.ts` | Dead code (never imported) |

---

## Execution Order

```
Step 0: Delete dead code                          [30 min]
Step 1: Create prompt files                       [2-3 hrs]
Step 2: Create useChatDrawer hook + SSE parser     [3-4 hrs]
Step 3: Migrate 4 dashboard drawers               [3-4 hrs]
Step 4: Migrate NoteView chat                     [1 hr]
Step 5: Simplify NewChat context paths            [2-3 hrs]
Step 6: Add prompt logging                        [1 hr]
Step 7: Update edge functions                     [2-3 hrs]
                                          TOTAL: ~15-20 hrs
```

---

## Success Criteria

- [ ] `npm run typecheck` passes
- [ ] All 4 dashboard drawer chats work (contracts, budget, lobbying, votes)
- [ ] NewChat works in all modes (general, contract, school funding, article, NYSgpt explainer)
- [ ] NoteView chat works
- [ ] Model selector in drawers actually routes to the selected model's edge function
- [ ] Feedback persists for NewChat, doesn't render for ephemeral drawer chats
- [ ] `promptLog` captured on persisted assistant messages
- [ ] Net line count reduction of ~800+ lines

---

## What This Unlocks (Phase 3: RAG)

Once standardized, adding retrieval-augmented generation means:
1. Add a `retrieveContext(query, entityType)` function
2. Call it in `useChatDrawer` before building the system prompt
3. Inject retrieved chunks into the metadata layer of `systemPromptComposer`
4. Done — applies to all 12 trigger points automatically
