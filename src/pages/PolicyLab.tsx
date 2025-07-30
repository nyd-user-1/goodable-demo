import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RotateCcw, MoreHorizontal, AlignJustify, ArrowDown, Edit } from "lucide-react";

const PolicyLab = () => {
  const [prompt, setPrompt] = useState("");
  const [temperature, setTemperature] = useState([0.56]);
  const [maxLength, setMaxLength] = useState([256]);
  const [topP, setTopP] = useState([0.9]);
  const [selectedModel, setSelectedModel] = useState("text-davinci-003");

  const handleSubmit = () => {
    // Handle submit logic here
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
          <Button variant="outline" size="sm">Save</Button>
          <Button variant="outline" size="sm">View code</Button>
          <Button variant="outline" size="sm">Share</Button>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Text Area */}
        <div className="flex-1 p-8">
          <div className="h-full flex flex-col">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 resize-none border-gray-300 text-base"
              placeholder="Write a tagline for an ice cream shop"
            />
            <div className="flex items-center justify-between mt-4">
              <Button 
                onClick={handleSubmit}
                className="bg-black text-white hover:bg-gray-800"
              >
                Submit
              </Button>
              <Button variant="ghost" size="icon">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l bg-white p-6 space-y-6">
          {/* Mode */}
          <div>
            <Label className="text-sm font-medium">Mode</Label>
            <div className="mt-2 flex rounded-md border p-1">
              <Button variant="ghost" size="sm" className="flex-1 h-8 justify-center">
                <AlignJustify className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 h-8 justify-center">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 h-8 justify-center">
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