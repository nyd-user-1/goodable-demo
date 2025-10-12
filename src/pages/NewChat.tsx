import { useState } from "react";
import { FileText, Paperclip, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const samplePrompts = [
  {
    title: "Are reduced-form regression models acceptable evidence of class-wide impact at the class certification stage?",
    category: "Legal Research"
  },
  {
    title: "What legislative frameworks support equitable funding for school districts in underserved communities?",
    category: "Education Policy"
  },
  {
    title: "How do recent NYSLRS amendments affect pension obligations for municipal employees?",
    category: "Public Finance"
  },
  {
    title: "What are the constitutional requirements for due process in administrative hearings for benefit determinations?",
    category: "Administrative Law"
  },
  {
    title: "Which states have successfully implemented universal Pre-K programs and what were the key legislative provisions?",
    category: "Education Policy"
  },
  {
    title: "What is the legislative history behind New York's tenant protection laws and recent amendments?",
    category: "Housing Policy"
  }
];

const NewChat = () => {
  const [query, setQuery] = useState("");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const navigate = useNavigate();

  const handlePromptClick = (prompt: string) => {
    setQuery(prompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to playground or chat with the query
      navigate(`/playground?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
        {/* Heading */}
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-16 tracking-tight">
          What are you researching?
        </h1>

        {/* Sample Prompt Cards */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {samplePrompts.map((prompt, index) => (
            <Card
              key={index}
              className={cn(
                "p-6 cursor-pointer transition-all duration-200 border-2",
                "hover:border-primary hover:shadow-lg",
                hoveredCard === index && "border-primary shadow-lg"
              )}
              onClick={() => handlePromptClick(prompt.title)}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <p className="text-sm text-muted-foreground mb-3 font-medium">
                {prompt.category}
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {prompt.title}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Input Area - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-input bg-background focus-within:border-primary transition-colors">
              {/* File Attachment Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-10 w-10 rounded-full"
              >
                <Paperclip className="h-5 w-5" />
              </Button>

              {/* Input Field */}
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base px-0"
              />

              {/* Deep Research Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-shrink-0 rounded-full px-4 py-2 h-10 border-2"
              >
                <FileText className="h-4 w-4 mr-2" />
                Deep research
              </Button>

              {/* Submit Button */}
              <Button
                type="submit"
                size="icon"
                className="flex-shrink-0 h-10 w-10 rounded-full"
                disabled={!query.trim()}
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
            </div>
          </form>

          {/* Disclaimer */}
          <p className="text-xs text-center text-muted-foreground mt-4">
            AI-generated responses must be verified and are not legal advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewChat;
