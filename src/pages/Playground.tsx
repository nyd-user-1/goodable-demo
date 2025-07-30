import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RotateCcw, Code, Share, Settings, Eye, Edit, Info, Copy, MoreHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';


interface ChatOption {
  id: string;
  label: string;
  content: string;
  type: 'bill' | 'member' | 'committee' | 'problem' | 'solution' | 'mediaKit';
}

interface Persona {
  id: string;
  act: string;
  prompt: string | null;
  Label: string | null;
}

const formatChatConversation = (messages: any[]): string => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "";
  }

  return messages
    .map((msg: any, index: number) => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      const content = msg.content || '';
      return `${role}: ${content}`;
    })
    .join('\n\n');
};

const Playground = () => {
  const [prompt, setPrompt] = useState("No complaints.");
  const [selectedChat, setSelectedChat] = useState("");
  const [selectedPersona, setSelectedPersona] = useState("");
  const [selectedPersonaAct, setSelectedPersonaAct] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState([0.56]);
  const [maxLength, setMaxLength] = useState([256]);
  const [topP, setTopP] = useState([0.9]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOptions, setChatOptions] = useState<ChatOption[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(false);
  const [personasLoading, setPersonasLoading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [mode, setMode] = useState<'textEditor' | 'chat'>('textEditor');
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [viewCodeDialogOpen, setViewCodeDialogOpen] = useState(false);
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const fetchUserChats = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First, get all chat sessions for the user
      const { data: chatSessions, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const options: ChatOption[] = [];

      // Process chat sessions and create options
      chatSessions?.forEach((session: any) => {
        const messages = Array.isArray(session.messages) ? session.messages : JSON.parse(session.messages || '[]');
        const formattedConversation = formatChatConversation(messages);
        const firstUserMessage = messages.find((msg: any) => msg.role === 'user')?.content || '';

        if (session.title.toLowerCase().includes('problem:')) {
          const problemNumber = session.title.split(':')[1]?.trim() || 'Unknown';
          options.push({
            id: session.id,
            label: `Problem ${problemNumber}: ${firstUserMessage.substring(0, 50)}...`,
            content: formattedConversation,
            type: 'problem'
          });
        } else if (session.title.toLowerCase().includes('solution:')) {
          const solutionNumber = session.title.split(':')[1]?.trim() || 'Unknown';
          options.push({
            id: session.id,
            label: `Solution ${solutionNumber}: ${firstUserMessage.substring(0, 50)}...`,
            content: formattedConversation,
            type: 'solution'
          });
        } else if (session.title.toLowerCase().includes('media kit:')) {
          const mediaKitNumber = session.title.split(':')[1]?.trim() || 'Unknown';
          options.push({
            id: session.id,
            label: `Media Kit ${mediaKitNumber}: ${firstUserMessage.substring(0, 50)}...`,
            content: formattedConversation,
            type: 'mediaKit'
          });
        } else if (session.bill_id) {
          // For bill-related chats, use the session title which contains the bill number
          options.push({
            id: session.id,
            label: session.title.startsWith('Bill:') ? `Bill Chat: ${session.title.replace('Bill: ', '')}` : session.title,
            content: formattedConversation,
            type: 'bill'
          });
        } else if (session.member_id) {
          // For member-related chats - need to fetch member name for better labeling
          options.push({
            id: session.id,
            label: `Member Chat: ${firstUserMessage.substring(0, 30)}...`,
            content: formattedConversation,
            type: 'member'
          });
        } else if (session.committee_id) {
          // For committee-related chats - need to fetch committee name for better labeling
          options.push({
            id: session.id,
            label: `Committee Chat: ${firstUserMessage.substring(0, 30)}...`,
            content: formattedConversation,
            type: 'committee'
          });
        } else {
          // Generic chat session
          options.push({
            id: session.id,
            label: `Chat: ${firstUserMessage.substring(0, 50)}...`,
            content: formattedConversation,
            type: 'problem' // Default type
          });
        }
      });

      setChatOptions(options);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonas = async () => {
    try {
      setPersonasLoading(true);
      const { data: personasData, error } = await supabase
        .from("Persona")
        .select("*")
        .order("act", { ascending: true });

      if (error) {
        throw error;
      }

      setPersonas(personasData || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load personas",
        variant: "destructive",
      });
    } finally {
      setPersonasLoading(false);
    }
  };

  useEffect(() => {
    fetchUserChats();
    fetchPersonas();
  }, []);

  const handleChatSelection = (chatId: string) => {
    const selectedOption = chatOptions.find(option => option.id === chatId);
    if (selectedOption) {
      setPrompt(selectedOption.content);
      setSelectedChat(chatId);
    }
  };

  const handlePersonaSelection = (personaAct: string) => {
    const selectedPersonaData = personas.find(persona => persona.act === personaAct);
    if (selectedPersonaData) {
      setSelectedPersona(personaAct);
      setSelectedPersonaAct(personaAct);
      setSystemPrompt(selectedPersonaData.prompt || "");
      // Auto-switch to chat mode when persona is selected
      if (personaAct) {
        setMode('chat');
      }
    } else {
      setSelectedPersona("");
      setSelectedPersonaAct("");
      setSystemPrompt("");
      // Switch back to text editor if no persona
      setMode('textEditor');
    }
  };

  const handleChatSubmit = async () => {
    if (!selectedPersona || !prompt.trim()) {
      toast({
        title: "Error",
        description: "Please select a persona and enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsChatting(true);
    
    try {
      // Initialize chat with user message
      const initialMessages = [{ role: 'user' as const, content: prompt }];
      setChatMessages(initialMessages);

      // Call the edge function
      const response = await supabase.functions.invoke('chat-with-persona', {
        body: {
          messages: initialMessages,
          systemPrompt: systemPrompt
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Add AI response to chat
      const aiMessage = { role: 'assistant' as const, content: response.data.message };
      setChatMessages(prev => [...prev, aiMessage]);

      toast({
        title: "Chat Started",
        description: `Chat with ${selectedPersona} initiated successfully`,
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start chat session",
        variant: "destructive",
      });
    } finally {
      setIsChatting(false);
    }
  };

  const handleSubmit = () => {
    if (mode === 'chat') {
      handleChatSubmit();
    } else {
      // Handle text editor submit (existing functionality)
      toast({
        title: "Text Submitted",
        description: "Content processed in text editor mode",
      });
    }
  };

  const handleRefresh = () => {
    setPrompt('');
    setChatMessages([]);
    setSelectedPersona('');
    setSelectedPersonaAct('');
    setSystemPrompt('');
    setMode('textEditor');
    toast({
      title: "Playground Cleared",
      description: "All content has been reset",
    });
  };

  const SettingsContent = () => (
    <div className="space-y-6">
      {/* Load Chat */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Load</Label>
        <Select value={selectedChat} onValueChange={handleChatSelection}>
          <SelectTrigger>
            <SelectValue placeholder="Select a chat..." />
          </SelectTrigger>
          <SelectContent>
            {loading ? (
              <SelectItem value="loading" disabled>Loading chats...</SelectItem>
            ) : chatOptions.length === 0 ? (
              <SelectItem value="empty" disabled>No chats found</SelectItem>
            ) : (
              chatOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Persona */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Persona</Label>
        <Select value={selectedPersona} onValueChange={handlePersonaSelection}>
          <SelectTrigger>
            <SelectValue placeholder="Select a persona..." />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {personasLoading ? (
              <SelectItem value="loading" disabled>Loading personas...</SelectItem>
            ) : personas.length === 0 ? (
              <SelectItem value="empty" disabled>No personas found</SelectItem>
            ) : (
              personas.map((persona) => (
                <SelectItem key={persona.act} value={persona.act}>
                  {persona.act}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Temperature */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <Label className="text-sm font-medium text-gray-700">Temperature</Label>
          <span className="text-sm text-gray-500">{temperature[0]}</span>
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
          <Label className="text-sm font-medium text-gray-700">Maximum Length</Label>
          <span className="text-sm text-gray-500">{maxLength[0]}</span>
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
          <Label className="text-sm font-medium text-gray-700">Top P</Label>
          <span className="text-sm text-gray-500">{topP[0]}</span>
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

  // Dialog Components
  const SharePopover = () => (
    <Popover open={sharePopoverOpen} onOpenChange={setSharePopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
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
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Code className="h-4 w-4 mr-2" />
          View code
        </Button>
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
          <div className="text-blue-400 ml-4">model="text-davinci-003",</div>
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
        <Button variant="outline" size="sm" className="hidden sm:flex">
          Save
        </Button>
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
        <Button variant="outline" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Content filter preferences</DropdownMenuItem>
        <DropdownMenuItem>Delete preset</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex h-full bg-white">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-background border-b border-border px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">Playground</h1>
            <div className="flex items-center gap-3">
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

              {/* Desktop Settings Button */}
              {!isMobile && (
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              )}

              <SaveDialog />
              <ViewCodeDialog />
              <SharePopover />
              <PreferencesMenu />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Left Panel - Prompt Area */}
          <div className={`flex-1 p-4 sm:p-6 ${isMobile ? 'w-full' : ''}`}>
            <div className="h-full flex flex-col">
              {/* System Prompt Indicator */}
              {systemPrompt && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button 
                      className="w-full mb-4 p-3 bg-muted/50 rounded-md cursor-pointer hover:bg-muted transition-colors text-left"
                      aria-label={`View ${selectedPersonaAct} system prompt details`}
                      aria-describedby="system-prompt-status"
                    >
                      <p id="system-prompt-status" className="text-sm font-medium text-primary flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        {selectedPersonaAct} System Prompt Active
                      </p>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-primary">
                        {selectedPersonaAct} System Prompt Active
                      </AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div className="text-muted-foreground max-h-[60vh] overflow-y-auto prose prose-sm max-w-none">
                          <ReactMarkdown>
                            {systemPrompt}
                          </ReactMarkdown>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction className="bg-primary hover:bg-primary/90">
                        Close
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              
              {/* Preview/Edit Toggle */}
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
              {mode === 'chat' && chatMessages.length > 0 ? (
                <div className="flex-1 min-h-[300px] sm:min-h-[500px] border border-gray-300 rounded-lg p-4 overflow-y-auto bg-white">
                  <div className="space-y-4">
                    {chatMessages.map((message, index) => (
                      <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user' 
                            ? 'bg-gray-900 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="text-xs font-medium mb-1 opacity-70">
                            {message.role === 'user' ? 'You' : selectedPersona}
                          </div>
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                    {isChatting && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                          <div className="text-xs font-medium mb-1 opacity-70">{selectedPersona}</div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : isPreviewMode ? (
                <div className="flex-1 min-h-[300px] sm:min-h-[500px] border border-gray-300 rounded-lg p-4 overflow-y-auto bg-white prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-xl font-bold mb-4 text-gray-900">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-lg font-semibold mb-3 text-gray-900">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-md font-medium mb-2 text-gray-900">{children}</h3>,
                      p: ({ children }) => <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                      em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                      ul: ({ children }) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-gray-700">{children}</li>,
                      code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                      pre: ({ children }) => <pre className="bg-gray-100 p-3 rounded mb-3 overflow-x-auto">{children}</pre>,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-3">{children}</blockquote>,
                    }}
                  >
                    {prompt || "Enter content in Edit mode to see preview..."}
                  </ReactMarkdown>
                </div>
              ) : (
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt here..."
                  className="flex-1 min-h-[300px] sm:min-h-[500px] resize-none border border-gray-300 rounded-lg p-4 text-sm"
                />
              )}
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={mode === 'textEditor' ? "default" : "outline"}
                    onClick={() => setMode('textEditor')}
                    className="px-6"
                  >
                    Text Editor
                  </Button>
                  <Button
                    variant={mode === 'chat' ? "default" : "outline"}
                    onClick={() => setMode('chat')}
                    className="px-6"
                    disabled={!selectedPersona}
                  >
                    Chat
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    className="bg-black text-white hover:bg-gray-800 px-6"
                    onClick={handleSubmit}
                  >
                    {mode === 'chat' ? 'Start Chat' : 'Submit'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRefresh}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Settings (Desktop Only) */}
          {!isMobile && (
            <div className="w-80 bg-white border-l border-gray-200 p-6">
              <SettingsContent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playground;