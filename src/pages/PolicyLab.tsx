import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RotateCcw, MoreHorizontal, AlignJustify, ArrowDown, Edit, Copy } from "lucide-react";

const PolicyLab = () => {
  const [prompt, setPrompt] = useState("Write a tagline for an ice cream shop");
  const [insertInput, setInsertInput] = useState("We're writing to [insert]. Congrats from OpenAI!");
  const [editInput, setEditInput] = useState("We is going to the market.");
  const [editInstructions, setEditInstructions] = useState("Fix the grammar.");
  const [temperature, setTemperature] = useState([0.56]);
  const [maxLength, setMaxLength] = useState([256]);
  const [topP, setTopP] = useState([0.9]);
  const [selectedModel, setSelectedModel] = useState("text-davinci-003");
  const [currentMode, setCurrentMode] = useState("complete");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [viewCodeDialogOpen, setViewCodeDialogOpen] = useState(false);
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false);

  const handleSubmit = () => {
    // Handle submit logic here
  };

  const handleModeChange = (mode: string) => {
    setCurrentMode(mode);
  };

  const SharePopover = () => (
    <Popover open={sharePopoverOpen} onOpenChange={setSharePopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">Share</Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[400px]">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Share preset</h3>
            <p className="text-sm text-muted-foreground">
              Anyone who has this link and an OpenAI account will be able to view this.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              readOnly
              value="https://platform.openai.com/playground/p/7bbKYQvsht40J6mtQErn6z6R"
              className="text-sm"
            />
            <Button size="sm" variant="outline">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  const ViewCodeDialog = () => (
    <Dialog open={viewCodeDialogOpen} onOpenChange={setViewCodeDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">View code</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>View code</DialogTitle>
          <DialogDescription>
            You can use the following code to start integrating your current prompt and settings into your application.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-black rounded-lg p-4 text-sm font-mono">
          <div className="text-green-400">import</div>{" "}
          <div className="text-white inline">os</div>
          <br />
          <div className="text-green-400">import</div>{" "}
          <div className="text-white inline">openai</div>
          <br /><br />
          <div className="text-white">openai.api_key = os.getenv("OPENAI_API_KEY")</div>
          <br /><br />
          <div className="text-white">response = openai.Completion.create(</div>
          <br />
          <div className="text-blue-400 ml-4">model="{selectedModel}",</div>
          <br />
          <div className="text-blue-400 ml-4">prompt="{prompt}",</div>
          <br />
          <div className="text-blue-400 ml-4">temperature={temperature[0]},</div>
          <br />
          <div className="text-blue-400 ml-4">max_tokens={maxLength[0]},</div>
          <br />
          <div className="text-blue-400 ml-4">top_p={topP[0]},</div>
          <br />
          <div className="text-blue-400 ml-4">frequency_penalty=0,</div>
          <br />
          <div className="text-blue-400 ml-4">presence_penalty=0,</div>
          <br />
          <div className="text-white">)</div>
        </div>
        <div className="text-sm text-muted-foreground">
          Your API Key can be found here. You should use environment variables or a secret management tool to expose your key to your applications.
        </div>
      </DialogContent>
    </Dialog>
  );

  const SaveDialog = () => (
    <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Save</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save preset</DialogTitle>
          <DialogDescription>
            This will save the current playground state as a preset which you can access later or share with others.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" className="mt-2" />
          </div>
        </div>
        <DialogFooter>
          <Button className="bg-black text-white hover:bg-gray-800">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const PreferencesMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Content filter preferences</DropdownMenuItem>
        <DropdownMenuItem>Delete preset</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderMainContent = () => {
    if (currentMode === "edit") {
      return (
        <div className="grid grid-cols-2 gap-6 h-full">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Input</Label>
              <Textarea
                value={editInput}
                onChange={(e) => setEditInput(e.target.value)}
                className="mt-2 min-h-[200px] resize-none"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Instructions</Label>
              <Textarea
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
                className="mt-2 min-h-[100px] resize-none"
                placeholder="Fix the grammar."
              />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Output</Label>
            <div className="mt-2 h-full min-h-[300px] border rounded-lg bg-gray-50 p-4">
              <div className="text-sm text-gray-500">Output will appear here...</div>
            </div>
          </div>
        </div>
      );
    }

    if (currentMode === "insert") {
      return (
        <div className="grid grid-cols-2 gap-6 h-full">
          <div>
            <Label className="text-sm font-medium">Input</Label>
            <Textarea
              value={insertInput}
              onChange={(e) => setInsertInput(e.target.value)}
              className="mt-2 h-full min-h-[400px] resize-none"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Output</Label>
            <div className="mt-2 h-full min-h-[400px] border rounded-lg bg-gray-50 p-4">
              <div className="text-sm text-gray-500">Output will appear here...</div>
            </div>
          </div>
        </div>
      );
    }

    // Complete mode (default)
    return (
      <div className="h-full flex flex-col">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 resize-none text-base"
          placeholder="Write a tagline for an ice cream shop"
        />
        <div className="flex items-center justify-between mt-4">
          <Button 
            onClick={handleSubmit}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Submit
          </Button>
          <Button variant="ghost" size="icon">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-8 py-4">
        <h1 className="text-2xl font-semibold">Playground</h1>
        <div className="flex items-center space-x-2">
          <Select>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Load a preset..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="creative">Creative Writing</SelectItem>
              <SelectItem value="code">Code Generation</SelectItem>
            </SelectContent>
          </Select>
          <SaveDialog />
          <ViewCodeDialog />
          <SharePopover />
          <PreferencesMenu />
        </div>
      </div>

      {/* Main Content - NO BORDER LINE */}
      <div className="flex h-[calc(100vh-73px)] max-w-[1200px] mx-auto">
        {/* Left Panel - Text Area */}
        <div className="flex-1 p-8">
          {renderMainContent()}
        </div>

        {/* Right Sidebar - NO BORDER */}
        <div className="w-80 bg-white p-6 space-y-6">
          {/* Mode */}
          <div>
            <Label className="text-sm font-medium">Mode</Label>
            <div className="mt-2 flex rounded-md border">
              <Button 
                variant={currentMode === "complete" ? "default" : "ghost"} 
                size="sm" 
                className="flex-1 h-8 justify-center"
                onClick={() => handleModeChange("complete")}
              >
                <AlignJustify className="h-4 w-4" />
              </Button>
              <Button 
                variant={currentMode === "insert" ? "default" : "ghost"} 
                size="sm" 
                className="flex-1 h-8 justify-center"
                onClick={() => handleModeChange("insert")}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button 
                variant={currentMode === "edit" ? "default" : "ghost"} 
                size="sm" 
                className="flex-1 h-8 justify-center"
                onClick={() => handleModeChange("edit")}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Model */}
          <div>
            <Label className="text-sm font-medium">Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text-davinci-003">text-davinci-003</SelectItem>
                <SelectItem value="text-davinci-002">text-davinci-002</SelectItem>
                <SelectItem value="text-curie-001">text-curie-001</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Temperature */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Temperature</Label>
              <span className="text-sm text-gray-500">{temperature[0]}</span>
            </div>
            <Slider
              value={temperature}
              onValueChange={setTemperature}
              max={1}
              min={0}
              step={0.01}
              className="mt-2"
            />
          </div>

          {/* Maximum Length */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Maximum Length</Label>
              <span className="text-sm text-gray-500">{maxLength[0]}</span>
            </div>
            <Slider
              value={maxLength}
              onValueChange={setMaxLength}
              max={4000}
              min={1}
              step={1}
              className="mt-2"
            />
          </div>

          {/* Top P */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Top P</Label>
              <span className="text-sm text-gray-500">{topP[0]}</span>
            </div>
            <Slider
              value={topP}
              onValueChange={setTopP}
              max={1}
              min={0}
              step={0.01}
              className="mt-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyLab;