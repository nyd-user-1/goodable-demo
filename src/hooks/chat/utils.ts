// Generate sequential problem number
export const generateProblemNumber = (count: number): string => {
  return `P${String(count + 1).padStart(5, '0')}`;
};

// Generate sequential media kit number
export const generateMediaKitNumber = (count: number): string => {
  return `MK${String(count + 1).padStart(5, '0')}`;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getTitle = (entity: any, entityType: 'bill' | 'member' | 'committee' | 'problem' | 'solution' | 'mediaKit' | null) => {
  if (entityType === 'bill' && entity?.bill_number) {
    return `Analysis: ${entity.bill_number}`;
  }
  if (entityType === 'member' && entity?.name) {
    return `Member: ${entity.name}`;
  }
  if (entityType === 'committee' && entity?.name) {
    return `Committee: ${entity.name}`;
  }
  if (entityType === 'problem' && entity?.problemNumber) {
    return `Problem: ${entity.problemNumber}`;
  }
  if (entityType === 'solution' && entity?.problemNumber) {
    return `Solution: ${entity.problemNumber}`;
  }
  if (entityType === 'mediaKit' && entity?.mediaKitNumber) {
    return `Media Kit: ${entity.mediaKitNumber}`;
  }
  return 'AI Assistant';
};

export const getBillChamber = (billNumber: string): string => {
  if (!billNumber) return '';
  const upperBillNumber = billNumber.toUpperCase();
  if (upperBillNumber.startsWith('S')) return 'Senate';
  if (upperBillNumber.startsWith('A')) return 'Assembly';
  return '';
};

// Parse problem chat current_state to extract messages
export const parseProblemChatState = (currentState: string, problemStatement: string, createdAt: string, updatedAt: string): Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: string}> => {
  try {
    // If current_state is a JSON string (array of messages), parse it
    if (typeof currentState === 'string' && currentState.startsWith('[')) {
      const parsedMessages = JSON.parse(currentState);
      if (Array.isArray(parsedMessages)) {
        return parsedMessages.map((msg: any) => ({
          id: msg.id || `msg-${Date.now()}-${Math.random()}`,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || new Date().toISOString()
        }));
      }
    }
    
    // If current_state is just the AI response string, create the conversation
    const messages: Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: string}> = [
      {
        id: 'user-problem',
        role: 'user',
        content: problemStatement,
        timestamp: createdAt
      }
    ];

    // Add AI response if it exists and is not a draft state
    if (currentState && 
        currentState !== 'draft' && 
        currentState !== 'generating' &&
        !currentState.startsWith('[')) {
      messages.push({
        id: 'ai-analysis',
        role: 'assistant',
        content: currentState,
        timestamp: updatedAt
      });
    }

    return messages;
  } catch (error) {
    // Fallback to just the problem statement
    return [
      {
        id: 'user-problem',
        role: 'user',
        content: problemStatement,
        timestamp: createdAt
      }
    ];
  }
};