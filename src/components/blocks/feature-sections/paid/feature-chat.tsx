"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  Code2,
  Command,
  LucideIcon,
  MessageSquare,
  Paperclip,
  Search,
  Send,
  Shield,
  Sparkles,
  ThumbsUp,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  feature?: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  triggerWords: string[];
}

const features: Feature[] = [
  {
    id: "performance",
    name: "Lightning Performance",
    description:
      "Our platform delivers exceptional performance with optimized algorithms and efficient resource management.",
    icon: Zap,
    color: "text-amber-500",
    triggerWords: ["fast", "performance", "speed", "quick", "efficient"],
  },
  {
    id: "ai",
    name: "AI-Powered Tools",
    description:
      "Leverage artificial intelligence to automate tasks, gain insights, and enhance productivity.",
    icon: Sparkles,
    color: "text-purple-500",
    triggerWords: ["ai", "intelligence", "smart", "automation", "learn"],
  },
  {
    id: "security",
    name: "Enterprise Security",
    description:
      "End-to-end encryption and advanced security protocols keep your data safe.",
    icon: Shield,
    color: "text-blue-500",
    triggerWords: ["secure", "security", "protection", "safe", "encrypt"],
  },
  {
    id: "api",
    name: "Developer API",
    description:
      "Integrate with your existing tools and workflows using our comprehensive API.",
    icon: Code2,
    color: "text-emerald-500",
    triggerWords: ["api", "integration", "code", "developer", "connect"],
  },
  {
    id: "cli",
    name: "Command Line Interface",
    description:
      "Powerful CLI tools for developers who prefer terminal-based workflows.",
    icon: Command,
    color: "text-gray-500",
    triggerWords: ["cli", "command", "terminal", "console", "shell"],
  },
];

const initialMessages: Message[] = [
  {
    id: "1",
    content:
      "Hello! I'm your product assistant. I can help you discover our key features. What would you like to know about?",
    sender: "assistant",
    timestamp: new Date(),
  },
];

const suggestedQuestions = [
  "How fast is your platform?",
  "Tell me about your security features",
  "Do you have AI capabilities?",
  "Is there an API for developers?",
  "Can I use the CLI to manage tasks?",
];

export default function FeatureChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const findRelevantFeature = (text: string): Feature | undefined => {
    const lowerText = text.toLowerCase();
    return features.find((feature) =>
      feature.triggerWords.some((word) => lowerText.includes(word)),
    );
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsAssistantTyping(true);

    // Determine which feature the user is asking about
    const relevantFeature = findRelevantFeature(inputValue);

    // Simulate assistant typing delay
    setTimeout(() => {
      let assistantResponse: Message;

      if (relevantFeature) {
        assistantResponse = {
          id: `assistant-${Date.now()}`,
          content: `${relevantFeature.description} Would you like to learn more about ${relevantFeature.name}?`,
          sender: "assistant",
          feature: relevantFeature.id,
          timestamp: new Date(),
        };
      } else {
        assistantResponse = {
          id: `assistant-${Date.now()}`,
          content:
            "I'm not sure I understand. Could you tell me which specific feature you're interested in? We have performance optimizations, AI capabilities, security features, developer APIs, and CLI tools.",
          sender: "assistant",
          timestamp: new Date(),
        };
      }

      setMessages((prev) => [...prev, assistantResponse]);
      setIsAssistantTyping(false);
    }, 1500);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    // Optional: Automatically send the message
    // setTimeout(handleSendMessage, 100);
  };

  return (
    <section className="container mx-auto space-y-12 px-4 py-24 md:px-6 2xl:max-w-[1400px]">
      <div className="space-y-4 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Chat with our product assistant
        </h2>
        <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Discover our powerful features through an interactive conversation
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
        <div className="space-y-6 lg:col-span-1">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Key features</h3>

            <div className="space-y-3">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="hover:border-primary hover:bg-primary/5 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all"
                  onClick={() =>
                    handleSuggestedQuestion(
                      `Tell me about your ${feature.name.toLowerCase()}`,
                    )
                  }
                >
                  <div className={cn("bg-muted rounded-md p-2", feature.color)}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{feature.name}</h4>
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Suggested questions</h3>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="hover:bg-primary/10 cursor-pointer py-1.5"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  <MessageSquare className="mr-1 h-3.5 w-3.5" />
                  {question}
                </Badge>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <Link
              to="#"
              className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm"
            >
              <Search className="h-4 w-4" />
              Browse feature documentation
            </Link>
          </div>
        </div>

        <div className="flex h-[600px] flex-col rounded-xl border shadow-sm lg:col-span-2">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b p-4">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src="/images/bot-avatar.png"
                alt="Product Assistant"
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                PA
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">Product Assistant</h3>
              <p className="text-muted-foreground text-xs">
                Ask me about our features
              </p>
            </div>
            <Badge variant="outline" className="ml-auto">
              <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
              Online
            </Badge>
          </div>

          {/* Chat messages */}
          <div className="flex-grow space-y-4 overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.sender === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted rounded-bl-none",
                  )}
                >
                  {message.feature ? (
                    <div className="space-y-2">
                      <p>{message.content}</p>
                      <div className="flex items-center gap-2 text-sm">
                        {(() => {
                          const feature = features.find(
                            (f) => f.id === message.feature,
                          );
                          if (!feature) return null;
                          return (
                            <>
                              <feature.icon
                                className={cn("h-4 w-4", feature.color)}
                              />
                              <span className="font-medium">
                                {feature.name}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                  <div
                    className={cn(
                      "mt-1 flex items-center gap-2 text-xs",
                      message.sender === "user"
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {message.sender === "user" && (
                      <ThumbsUp className="h-3 w-3" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isAssistantTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg rounded-bl-none p-3">
                  <div className="flex space-x-2">
                    <div className="bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full"></div>
                    <div className="bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full delay-75"></div>
                    <div className="bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full delay-150"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <div className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="rounded-full"
              >
                <Paperclip className="text-muted-foreground h-5 w-5" />
              </Button>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about our features..."
                className="flex-grow"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim()}
                className="rounded-full"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border p-8 text-center">
        <h3 className="text-xl font-bold">
          Ready to explore all our features?
        </h3>
        <p className="text-muted-foreground mx-auto max-w-[600px]">
          Get a personalized demo from our product experts and see how our
          platform can help your business.
        </p>
        <Button asChild size="lg" className="mt-2">
          <Link to="#">
            Schedule a demo <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
