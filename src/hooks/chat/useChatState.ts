import { useState } from 'react';
import { Message, Citation } from './types';

export const useChatState = () => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  return {
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
  };
};