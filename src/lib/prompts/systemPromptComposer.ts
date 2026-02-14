/**
 * System Prompt Composer
 *
 * Composes a complete system prompt from three layers:
 *   1. BASE:     NY legislative domain knowledge (always included)
 *   2. CONTEXT:  Entity-specific prompt + injected data
 *   3. METADATA: Filters and session info (when available)
 *
 * The output is passed as `systemContext` in the edge function payload.
 * The edge function then prepends constitutional principles (server-side)
 * and uses the result as the system message.
 *
 * Usage:
 *   const prompt = composeSystemPrompt({
 *     entityType: 'contract',
 *     entityName: 'Acme Corp',
 *     dataContext: '...CSV data...',
 *   });
 */

import { NY_LEGISLATIVE_DOMAIN } from './nyLegislativeDomain';
import {
  CONTRACTS_PROMPT,
  BUDGET_PROMPT,
  LOBBYING_PROMPT,
  VOTES_PROMPT,
  NOTE_PROMPT,
  SCHOOL_FUNDING_PROMPT,
  STANDALONE_PROMPT,
  DATA_GROUNDING_INSTRUCTION,
  INTERNAL_LINKING_INSTRUCTION,
} from './domainPrompts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EntityType =
  | 'contract'
  | 'budget'
  | 'lobbying'
  | 'votes'
  | 'note'
  | 'bill'
  | 'member'
  | 'committee'
  | 'standalone'
  | 'schoolFunding';

export interface SystemPromptConfig {
  /** The domain / entity type this chat is about */
  entityType: EntityType;

  /** Human-readable name of the entity (vendor, lobbyist, member, etc.) */
  entityName?: string;

  /** Pre-loaded data to ground the model (CSV, formatted text, etc.) */
  dataContext?: string;

  /** Additional structured context (note content, school funding breakdown, etc.) */
  sessionContext?: Record<string, any>;

  /** Optional metadata filters */
  metadata?: {
    sessionYear?: string;
    committee?: string;
    agency?: string;
    billNumber?: string;
  };

  /** Scope within the entity type (e.g., 'department', 'vendor', 'member', 'bill') */
  scope?: string;
}

// ---------------------------------------------------------------------------
// Prompt map
// ---------------------------------------------------------------------------

const ENTITY_PROMPTS: Record<EntityType, string> = {
  contract: CONTRACTS_PROMPT,
  budget: BUDGET_PROMPT,
  lobbying: LOBBYING_PROMPT,
  votes: VOTES_PROMPT,
  note: NOTE_PROMPT,
  bill: STANDALONE_PROMPT,
  member: STANDALONE_PROMPT,
  committee: STANDALONE_PROMPT,
  standalone: STANDALONE_PROMPT,
  schoolFunding: SCHOOL_FUNDING_PROMPT,
};

// ---------------------------------------------------------------------------
// Context layer builder
// ---------------------------------------------------------------------------

function buildContextLayer(config: SystemPromptConfig): string {
  const { entityType, entityName, dataContext, sessionContext, scope } = config;

  const parts: string[] = [];

  // 1. Domain prompt
  parts.push(ENTITY_PROMPTS[entityType] || STANDALONE_PROMPT);

  // 2. Entity/scope scoping
  switch (entityType) {
    case 'contract':
      if (scope === 'drill' && entityName) {
        parts.push(`\nThe user is asking about a specific contract: "${entityName}". Use the actual contract data provided below to answer questions with specific dollar amounts, dates, and parent category context.`);
      } else if (scope === 'department' && entityName) {
        parts.push(`\nThe user is asking about contracts in the "${entityName}" department. Use the actual contract data provided below to answer questions with specific dollar amounts, vendor names, and contract details.`);
      } else if (scope === 'contractType' && entityName) {
        parts.push(`\nThe user is asking about "${entityName}" type contracts. Use the actual contract data provided below to answer questions with specific dollar amounts, vendor names, and contract details.`);
      } else if (scope === 'vendor' && entityName) {
        parts.push(`\nThe user is asking about the vendor "${entityName}". Use the actual contract data provided below to answer questions with specific dollar amounts, contract names, and dates.`);
      }
      break;

    case 'budget':
      if (entityName) {
        parts.push(`\nThe user is currently viewing the "${entityName}" budget category.`);
      }
      break;

    case 'lobbying':
      if (scope === 'drill' && entityName) {
        parts.push(`\nThe user is asking about "${entityName}". Use the actual data provided below to answer questions with specific dollar amounts and details.`);
      } else if (scope === 'lobbyist' && entityName) {
        parts.push(`\nThe user is asking about the lobbyist "${entityName}". Use the actual data provided below to answer questions with specific dollar amounts, client names, and details.`);
      } else if (scope === 'client' && entityName) {
        parts.push(`\nThe user is asking about the client "${entityName}". Use the actual data provided below to answer questions with specific dollar amounts and details.`);
      }
      break;

    case 'votes':
      if (scope === 'member' && entityName) {
        const party = sessionContext?.memberParty ? ` (${sessionContext.memberParty})` : '';
        parts.push(`\nThe user is asking about ${entityName}${party}'s voting record. Provide specific information about their voting patterns, party alignment, and notable votes. ONLY reference bills and figures from the data below.`);
      } else if (scope === 'bill' && entityName) {
        const result = sessionContext?.billResult ? `, which ${sessionContext.billResult}` : '';
        parts.push(`\nThe user is asking about ${sessionContext?.billNumber || ''}: ${entityName}${result}. Provide specific information about how members voted. ONLY reference members and votes from the data below.`);
      }
      break;

    case 'note':
      if (sessionContext?.noteTitle) {
        parts.push(`\nNote title: "${sessionContext.noteTitle}"`);
      }
      if (sessionContext?.noteContent) {
        parts.push(`\nNote content:\n---\n${String(sessionContext.noteContent).slice(0, 8000)}\n---`);
      }
      break;

    case 'schoolFunding':
      if (sessionContext?.district) {
        parts.push(`\nDistrict: ${sessionContext.district}`);
      }
      if (sessionContext?.county) {
        parts.push(`County: ${sessionContext.county}`);
      }
      if (sessionContext?.budgetYear) {
        parts.push(`Budget Year: ${sessionContext.budgetYear}`);
      }
      if (sessionContext?.totalChange) {
        parts.push(`Total Change: ${sessionContext.totalChange}`);
      }
      break;

    case 'bill':
      if (entityName) parts.push(`\nAnalyzing bill: ${entityName}`);
      break;
    case 'member':
      if (entityName) parts.push(`\nAnalyzing legislator: ${entityName}`);
      break;
    case 'committee':
      if (entityName) parts.push(`\nAnalyzing committee: ${entityName}`);
      break;
  }

  // 3. Data grounding (when real data is provided)
  if (dataContext) {
    parts.push(DATA_GROUNDING_INSTRUCTION);
    parts.push(`\n${dataContext}`);
  }

  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Metadata layer builder
// ---------------------------------------------------------------------------

function buildMetadataLayer(metadata?: SystemPromptConfig['metadata']): string {
  if (!metadata) return '';

  const parts: string[] = [];
  if (metadata.sessionYear) parts.push(`Session: ${metadata.sessionYear}`);
  if (metadata.committee) parts.push(`Committee: ${metadata.committee}`);
  if (metadata.agency) parts.push(`Agency: ${metadata.agency}`);
  if (metadata.billNumber) parts.push(`Bill: ${metadata.billNumber}`);

  if (parts.length === 0) return '';
  return `\nContext metadata:\n${parts.join('\n')}`;
}

// ---------------------------------------------------------------------------
// Main composer
// ---------------------------------------------------------------------------

/**
 * Composes a complete system prompt from base + context + metadata layers.
 *
 * The returned string is passed as `context.systemContext` to the edge function.
 * The edge function prepends constitutional principles before sending to the LLM.
 */
export function composeSystemPrompt(config: SystemPromptConfig): string {
  const baseLayer = NY_LEGISLATIVE_DOMAIN;
  const contextLayer = buildContextLayer(config);
  const metadataLayer = buildMetadataLayer(config.metadata);

  return [baseLayer, INTERNAL_LINKING_INSTRUCTION, contextLayer, metadataLayer]
    .filter(Boolean)
    .join('\n\n---\n\n');
}
