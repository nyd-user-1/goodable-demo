import React, { createContext, useContext, useState } from "react";
import { ModelType } from "@/components/ModelSelector";

interface ModelContextType {
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedModel, setSelectedModel] = useState<ModelType>("gpt-4o-mini");

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