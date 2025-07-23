import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { DraftEditor } from "./DraftEditor";
import { AnalysisPanel } from "./AnalysisPanel";
import { ExportPanel } from "./ExportPanel";
import { DraftSidebar } from "./DraftSidebar";
import { PublicGallery } from "./PublicGallery";
import { UserMenu } from "./UserMenu";
import { LegislativeDraft, DraftProgress } from "@/types/legislation";

const LegislationGenerator = () => {
  const [currentDraft, setCurrentDraft] = useState<LegislativeDraft | null>(null);
  const [activeTab, setActiveTab] = useState("draft");
  const [saveTrigger, setSaveTrigger] = useState(0);

  const handleSaveDraft = () => {
    setSaveTrigger(prev => prev + 1);
  };

  return (
    <div className="page-container min-h-screen bg-gray-50 p-6">
      <div className="content-wrapper max-w-6xl mx-auto">

        {/* Collapsible Sidebar */}
        <DraftSidebar 
          currentDraft={currentDraft}
          onDraftSelect={setCurrentDraft}
          onSaveDraft={handleSaveDraft}
        />
        
        {/* Main Content */}
        <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="gallery">Public Gallery</TabsTrigger>
          </TabsList>
          
          <TabsContent value="draft" className="mt-6">
            <DraftEditor 
              draft={currentDraft}
              onDraftChange={setCurrentDraft}
              saveTrigger={saveTrigger}
            />
          </TabsContent>
          
          <TabsContent value="analysis" className="mt-6">
            <AnalysisPanel draft={currentDraft} />
          </TabsContent>
          
          <TabsContent value="export" className="mt-6">
            <ExportPanel draft={currentDraft} />
          </TabsContent>
          
          <TabsContent value="gallery" className="mt-6">
            <PublicGallery onDraftSelect={setCurrentDraft} />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LegislationGenerator;