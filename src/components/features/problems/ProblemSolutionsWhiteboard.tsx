import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Pen, 
  Eraser, 
  Square, 
  Circle, 
  Type, 
  MousePointer, 
  Download, 
  Users,
  Palette,
  Undo,
  Redo,
  Trash2,
  Plus
} from 'lucide-react';
import { Problem } from '@/data/problems';

interface DrawingElement {
  id: string;
  type: 'line' | 'rectangle' | 'circle' | 'text';
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  author: string;
}

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  cursor?: { x: number; y: number };
  isActive: boolean;
}

interface ProblemSolutionsWhiteboardProps {
  problem: Problem;
}

export const ProblemSolutionsWhiteboard = ({ problem }: ProblemSolutionsWhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'text' | 'select'>('pen');
  const [currentColor, setCurrentColor] = useState('#3D63DD');
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [collaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
      isActive: true
    },
    {
      id: '2', 
      name: 'Michael Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      isActive: true
    },
    {
      id: '3',
      name: 'Emily Watson', 
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      isActive: false
    }
  ]);

  const colors = ['#3D63DD', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' }
  ];

  const solutionTemplates = [
    {
      title: 'Policy Framework',
      description: 'Structured approach to policy development',
      elements: 4
    },
    {
      title: 'Stakeholder Map',
      description: 'Identify key players and relationships',
      elements: 6
    },
    {
      title: 'Impact Analysis',
      description: 'Analyze potential outcomes and consequences',
      elements: 5
    }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 0.5;
    const gridSize = 20;
    
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw elements
    elements.forEach(element => {
      ctx.strokeStyle = element.color;
      ctx.fillStyle = element.color;
      
      switch (element.type) {
        case 'line':
          if (element.points && element.points.length > 2) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.moveTo(element.points[0], element.points[1]);
            for (let i = 2; i < element.points.length; i += 2) {
              ctx.lineTo(element.points[i], element.points[i + 1]);
            }
            ctx.stroke();
          }
          break;
        case 'rectangle':
          if (element.x && element.y && element.width && element.height) {
            ctx.strokeRect(element.x, element.y, element.width, element.height);
          }
          break;
        case 'circle':
          if (element.x && element.y && element.width) {
            ctx.beginPath();
            ctx.arc(element.x, element.y, element.width / 2, 0, 2 * Math.PI);
            ctx.stroke();
          }
          break;
        case 'text':
          if (element.x && element.y && element.text) {
            ctx.font = '14px Inter';
            ctx.fillText(element.text, element.x, element.y);
          }
          break;
      }
    });
  }, [elements]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    
    if (currentTool === 'pen') {
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: 'line',
        points: [x, y],
        color: currentColor,
        author: 'You'
      };
      setElements(prev => [...prev, newElement]);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || currentTool !== 'pen') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setElements(prev => {
      const newElements = [...prev];
      const lastElement = newElements[newElements.length - 1];
      if (lastElement && lastElement.points) {
        lastElement.points.push(x, y);
      }
      return newElements;
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    setElements([]);
  };

  const addTemplate = (template: typeof solutionTemplates[0]) => {
    // Add predefined elements based on template
    const templateElements: DrawingElement[] = [];
    
    if (template.title === 'Policy Framework') {
      templateElements.push(
        {
          id: Date.now().toString(),
          type: 'rectangle',
          x: 50,
          y: 50,
          width: 200,
          height: 100,
          color: currentColor,
          author: 'Template'
        },
        {
          id: (Date.now() + 1).toString(),
          type: 'text',
          x: 60,
          y: 70,
          text: 'Problem Analysis',
          color: currentColor,
          author: 'Template'
        }
      );
    }
    
    setElements(prev => [...prev, ...templateElements]);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            {tools.map((tool) => (
              <Button
                key={tool.id}
                variant={currentTool === tool.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentTool(tool.id as any)}
                className="flex items-center gap-2"
              >
                <tool.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tool.label}</span>
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  className={`w-6 h-6 rounded-full border-2 ${
                    currentColor === color ? 'border-gray-400' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            <div className="h-6 w-px bg-border mx-2" />
            
            <Button variant="outline" size="sm">
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Redo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={clearCanvas}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Solution Templates */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Solution Templates
            </h3>
            <div className="space-y-2">
              {solutionTemplates.map((template, index) => (
                <div 
                  key={index}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => addTemplate(template)}
                >
                  <h4 className="text-sm font-medium mb-1">{template.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    {template.elements} elements
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Active Collaborators */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Collaborators
            </h3>
            <div className="space-y-2">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={collaborator.avatar} />
                    <AvatarFallback>{collaborator.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{collaborator.name}</span>
                  <div className={`w-2 h-2 rounded-full ml-auto ${
                    collaborator.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Whiteboard Canvas */}
        <div className="lg:col-span-3">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Collaborative Whiteboard</h3>
              <Badge variant="secondary" className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Live
              </Badge>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full h-[600px] cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Solution Cards from Original */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Structured Solutions</h3>
          <Badge variant="secondary" className="text-xs">
            {problem.solutionsList.length} solutions
          </Badge>
        </div>
        <div className="grid gap-4">
          {problem.solutionsList.map((solution) => (
            <div key={solution.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-2">{solution.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {solution.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs ml-4">
                    {solution.id}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Feasibility</span>
                      <span className="text-sm text-muted-foreground">{solution.feasibility}/10</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-[#3D63DD] h-2 rounded-full" 
                        style={{ width: `${solution.feasibility * 10}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Impact</span>
                      <span className="text-sm text-muted-foreground">{solution.impact}/10</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${solution.impact * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};