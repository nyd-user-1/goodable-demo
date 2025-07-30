import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings, RotateCcw, Share, Code, Save, Edit, Eye, List, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const PolicyLab = () => {
  const [prompt, setPrompt] = useState("");
  const [temperature, setTemperature] = useState([0.7]);
  const [maxLength, setMaxLength] = useState([256]);
  const [topP, setTopP] = useState([0.9]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("text-davinci-003");
  const [mode, setMode] = useState("complete");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const isMobile = useIsMobile();

  const handleSubmit = () => {
    // Submit logic here
    console.log("Policy Lab submit:", { prompt, temperature, maxLength, topP });
  };

  const handleReset = () => {
    setPrompt("");
    setTemperature([0.7]);
    setMaxLength([256]);
    setTopP([0.9]);
  };

  const SettingsContent = () => (
    <div className="space-y-6">
      {/* Load */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Load</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select a chat..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chat1">Previous Chat 1</SelectItem>
            <SelectItem value="chat2">Previous Chat 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mode */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Mode</Label>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={mode === "complete" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("complete")}
            className="flex-1 h-8"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={mode === "insert" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("insert")}
            className="flex-1 h-8"
          >
            ↓
          </Button>
          <Button
            variant={mode === "edit" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("edit")}
            className="flex-1 h-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Model */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Model</Label>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text-davinci-003">text-davinci-003</SelectItem>
            <SelectItem value="text-davinci-002">text-davinci-002</SelectItem>
            <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Temperature */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <Label className="text-sm font-medium">Temperature</Label>
          <span className="text-sm text-muted-foreground">{temperature[0]}</span>
        </div>
        <Slider
          value={temperature}
          onValueChange={setTemperature}
          max={1}
          min={0}
          step={0.01}
          className="w-full"
        />
      </div>

      {/* Maximum Length */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <Label className="text-sm font-medium">Maximum Length</Label>
          <span className="text-sm text-muted-foreground">{maxLength[0]}</span>
        </div>
        <Slider
          value={maxLength}
          onValueChange={setMaxLength}
          max={4000}
          min={1}
          step={1}
          className="w-full"
        />
      </div>

      {/* Top P */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <Label className="text-sm font-medium">Top P</Label>
          <span className="text-sm text-muted-foreground">{topP[0]}</span>
        </div>
        <Slider
          value={topP}
          onValueChange={setTopP}
          max={1}
          min={0}
          step={0.01}
          className="w-full"
        />
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-background p-6">
      {/* Main Content Container with Border and Rounded Corners */}
      <div className="flex-1 flex flex-col border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-background border-b border-border px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">Policy Lab</h1>
            <div className="flex items-center gap-3">
              {/* Load a preset dropdown */}
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Load a preset..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preset1">Preset 1</SelectItem>
                  <SelectItem value="preset2">Preset 2</SelectItem>
                </SelectContent>
              </Select>
              {/* Mobile Settings Button */}
              {isMobile && (
                <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Settings</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <SettingsContent />
                    </div>
                  </SheetContent>
                </Sheet>
              )}

              {/* Desktop Buttons */}
              {!isMobile && (
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              )}

              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Code className="h-4 w-4 mr-2" />
                View code
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Left Panel - Main Content */}
          <div className={`flex-1 p-4 sm:p-6 ${isMobile ? 'w-full' : ''}`}>
            <div className="h-full flex flex-col">
              {/* Edit/Preview Toggle */}
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant={!isPreviewMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPreviewMode(false)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant={isPreviewMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPreviewMode(true)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </div>
              
              {/* Content Area */}
              {isPreviewMode ? (
                <div className="flex-1 min-h-[300px] sm:min-h-[500px] border border-border rounded-lg p-4 overflow-y-auto bg-background prose prose-sm max-w-none">
                  {prompt || "Enter content in Edit mode to see preview..."}
                </div>
              ) : (
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt here..."
                  className="flex-1 min-h-[300px] sm:min-h-[500px] resize-none"
                />
              )}
              
              {/* Bottom Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  {/* Space for mode toggles if needed */}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    className="bg-black text-white hover:bg-gray-800 px-6"
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Settings (Desktop Only) */}
          {!isMobile && (
            <div className="w-80 bg-background border-l border-border p-6">
              <SettingsContent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyLab;