import React, { createContext, useContext, useState } from "react";

export type ModelProvider = "openai" | "anthropic" | "perplexity";
export type ModelType = "gpt-4o-mini" | "gpt-4o" | "gpt-4-turbo" | "claude-sonnet-4-5-20250929" | "claude-haiku-4-5-20251001" | "claude-opus-4-5-20251101";

interface ModelContextType {
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedModel, setSelectedModel] = useState<ModelType>("gpt-4o");

  return (
    <ModelContext.Provider value={{ selectedModel, setSelectedModel }}>
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = (): ModelContextType => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
};