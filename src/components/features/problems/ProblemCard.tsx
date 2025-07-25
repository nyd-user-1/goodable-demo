import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Problem } from "@/data/problems";
import { ArrowUp, MessageSquare } from "lucide-react";
import { useState } from "react";

interface ProblemCardProps {
  problem: Problem;
  onClick: () => void;
}

export const ProblemCard = ({ problem, onClick }: ProblemCardProps) => {
  const [votes] = useState({
    up: Math.floor(Math.random() * 200) + 50
  });
  const [commentCount] = useState(Math.floor(Math.random() * 50) + 10);

  // Mock author data
  const author = {
    name: "Community Member",
    avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=32&h=32&fit=crop&crop=face`
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            {problem.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {problem.priority} Priority
          </Badge>
        </div>
        
        <h3 className="text-lg font-semibold mb-2 group-hover:text-[#3D63DD] transition-colors">
          {problem.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {problem.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar className="w-4 h-4">
              <AvatarImage src={author.avatar} />
              <AvatarFallback>{author.name[0]}</AvatarFallback>
            </Avatar>
            <span>{author.name}</span>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              {votes.up}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {commentCount}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};