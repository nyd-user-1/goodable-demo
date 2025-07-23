import { Message } from "../types";

export const parseMessages = (messagesJson: any): Message[] => {
  try {
    // If it's already an array, return it
    if (Array.isArray(messagesJson)) {
      return messagesJson.map((msg: any) => ({
        id: msg.id || `msg-${Date.now()}-${Math.random()}`,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString()
      }));
    }
    
    // If it's a string, try to parse it
    if (typeof messagesJson === 'string') {
      const parsed = JSON.parse(messagesJson);
      if (Array.isArray(parsed)) {
        return parsed.map((msg: any) => ({
          id: msg.id || `msg-${Date.now()}-${Math.random()}`,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || new Date().toISOString()
        }));
      }
    }
    
    // Fallback to empty array
    return [];
  } catch (error) {
    return [];
  }
};