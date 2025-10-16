/**
 * PageHeader Component
 * Top-right header with Model Selector
 */

import { useModel } from "@/contexts/ModelContext";
import { ModelSelector, type ModelType } from "@/components/ModelSelector";

export function PageHeader() {
  const { selectedModel, setSelectedModel } = useModel();

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
      <ModelSelector
        selectedModel={selectedModel as ModelType}
        onModelChange={(model) => setSelectedModel(model)}
      />
    </div>
  );
}
