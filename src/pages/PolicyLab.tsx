import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings, RotateCcw, Share, Code, Save, MoreHorizontal, Copy, List, ArrowDown, Edit } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const PolicyLab = () => {
  const [prompt, setPrompt] = useState("");
  const [insertInput, setInsertInput] = useState("We're writing to [insert]. Congrats from OpenAI!");
  const [editInput, setEditInput] = useState("We is going to the market.");
  const [editInstructions, setEditInstructions] = useState("Fix the grammar");
  const [temperature, setTemperature] = useState([0.7]);
  const [maxLength, setMaxLength] = useState([256]);
  const [topP, setTopP] = useState([0.9]);
  const [selectedModel, setSelectedModel] = useState("text-davinci-003");
  const [currentMode, setCurrentMode] = useState("complete");
  const isMobile = useIsMobile();

  const handleSubmit = () => {
    console.log("Policy Lab submit:", { prompt, temperature, maxLength, topP });
  };

  const handleReset = () => {
    setPrompt("");
    setInsertInput("We're writing to [insert]. Congrats from OpenAI!");
    setEditInput("We is going to the market.");
    setEditInstructions("Fix the grammar");
  };

  // Save Dialog Component
  const SaveDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Save preset</DialogTitle>
          <DialogDescription>
            This will save the current playground state as a preset which you can access later or share with others.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" autoFocus />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // View Code Dialog Component
  const ViewCodeDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Code className="h-4 w-4 mr-2" />
          View code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Use this code</DialogTitle>
          <DialogDescription>
            You can use this code to start integrating your current prompt and settings into your application.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="rounded-md bg-black p-6">
            <pre>
              <code className="grid gap-1 text-sm text-muted-foreground">
                <div className="text-slate-500"># pip install openai</div>
                <div className="text-white">import openai</div>
                <div className="text-white">openai.api_key = "YOUR_API_KEY"</div>
                <div></div>
                <div className="text-white">response = openai.Completion.create(</div>
                <div className="text-blue-400">  model="{selectedModel}",</div>
                <div className="text-blue-400">  prompt="{prompt || 'Your prompt here'}",</div>
                <div className="text-blue-400">  temperature={temperature[0]},</div>
                <div className="text-blue-400">  max_tokens={maxLength[0]},</div>
                <div className="text-blue-400">  top_p={topP[0]}</div>
                <div className="text-white">)</div>
              </code>
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Share Popover Component
  const SharePopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[520px]">
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-semibold">Share preset</h3>
          <p className="text-sm text-muted-foreground">
            Anyone with this link and an OpenAI account will be able to view this.
          </p>
        </div>
        <div className="flex items-center space-x-2 pt-4">
          <div className="grid flex-1 gap-2">
            <Input
              defaultValue="https://platform.openai.com/playground/p/7bbKYQvsht40J6mtQErn6z6R"
              readOnly
              className="h-9"
            />
          </div>
          <Button type="submit" size="sm" className="px-3">
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );

  // Actions Menu Component  
  const ActionsMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">More</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          Content filter preferences
        </DropdownMenuItem>
        <DropdownMenuItem>
          Delete preset
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Panel */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between space-y-2 p-8 pb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Policy Lab</h2>
              <p className="text-muted-foreground">
                Configure your AI settings and parameters
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Select>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Load a preset..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preset1">Default</SelectItem>
                  <SelectItem value="preset2">Creative Writing</SelectItem>
                  <SelectItem value="preset3">Code Generation</SelectItem>
                </SelectContent>
              </Select>
              <SaveDialog />
              <ViewCodeDialog />
              <SharePopover />
              <ActionsMenu />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 px-8 pb-8">
            <div className="mx-auto h-full max-w-6xl">
              <div className="flex h-full space-x-8">
                {/* Left Panel - Main Content */}
                <div className="flex-1">
                  <Tabs value={currentMode} onValueChange={setCurrentMode} className="h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="complete">Complete</TabsTrigger>
                      <TabsTrigger value="insert">Insert</TabsTrigger>
                      <TabsTrigger value="edit">Edit</TabsTrigger>
                    </TabsList>
                    
                    {/* Complete Mode */}
                    <TabsContent value="complete" className="flex-1 mt-6">
                      <div className="h-full flex flex-col space-y-4">
                        <Textarea
                          placeholder="Write a tagline for an ice cream shop"
                          className="flex-1 min-h-[400px] resize-none"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                        />
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            0 characters, 0 tokens
                          </div>
                          <div className="flex space-x-2">
                            <Button onClick={handleSubmit}>Submit</Button>
                            <Button variant="ghost" size="sm" onClick={handleReset}>
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Insert Mode */}
                    <TabsContent value="insert" className="flex-1 mt-6">
                      <div className="grid h-full grid-cols-2 gap-6">
                        <div className="flex flex-col space-y-4">
                          <div className="text-sm font-medium">Input</div>
                          <Textarea
                            className="flex-1 resize-none"
                            value={insertInput}
                            onChange={(e) => setInsertInput(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col space-y-4">
                          <div className="text-sm font-medium">Output</div>
                          <div className="flex-1 rounded-md border bg-muted/50 p-4">
                            <div className="text-sm text-muted-foreground">Output will appear here...</div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Edit Mode */}
                    <TabsContent value="edit" className="flex-1 mt-6">
                      <div className="grid h-full grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-medium mb-2">Input</div>
                            <Textarea
                              className="min-h-[200px] resize-none"
                              value={editInput}
                              onChange={(e) => setEditInput(e.target.value)}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-2">Instruction</div>
                            <Textarea
                              className="min-h-[100px] resize-none"
                              value={editInstructions}
                              onChange={(e) => setEditInstructions(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col space-y-4">
                          <div className="text-sm font-medium">Output</div>
                          <div className="flex-1 rounded-md border bg-muted/50 p-4">
                            <div className="text-sm text-muted-foreground">Output will appear here...</div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Right Sidebar */}
                <div className="w-80 space-y-6">
                  {/* Mode */}
                  <div>
                    <Label className="text-sm font-medium">Mode</Label>
                    <div className="mt-2 flex space-x-1 rounded-lg bg-muted p-1">
                      <Button
                        variant={currentMode === "complete" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentMode("complete")}
                        className="flex-1 h-8"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={currentMode === "insert" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentMode("insert")}
                        className="flex-1 h-8"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={currentMode === "edit" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentMode("edit")}
                        className="flex-1 h-8"
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
                        <SelectItem value="text-babbage-001">text-babbage-001</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Temperature */}
                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Temperature</Label>
                      <span className="text-sm text-muted-foreground">{temperature[0]}</span>
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
                      <Label className="text-sm font-medium">Maximum length</Label>
                      <span className="text-sm text-muted-foreground">{maxLength[0]}</span>
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
                      <span className="text-sm text-muted-foreground">{topP[0]}</span>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyLab;