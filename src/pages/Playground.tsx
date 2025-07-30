import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RotateCcw, Code, Share, Info, Copy, MoreHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PlaygroundChat from '@/components/PlaygroundChat';
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
  const [sampleProblems, setSampleProblems] = useState<{id: number, "Sample Problems": string}[]>([]);
  const [problemsLoading, setProblemsLoading] = useState(false);
  const [selectedProblemStatement, setSelectedProblemStatement] = useState("");
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

  const fetchSampleProblems = async () => {
    try {
      setProblemsLoading(true);
      const { data: problemsData, error } = await supabase
        .from("SampleProblems")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      setSampleProblems(problemsData || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sample problems",
        variant: "destructive",
      });
    } finally {
      setProblemsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserChats();
    fetchPersonas();
    fetchSampleProblems();
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
    setSelectedProblemStatement('');
    setSelectedChat('');
    setMode('textEditor');
    toast({
      title: "Playground Cleared",
      description: "All content has been reset",
    });
  };

  const SettingsContent = () => (
    <div className="space-y-6">
      {/* Chat */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Chat</Label>
        <Select value={selectedChat} onValueChange={handleChatSelection}>
          <SelectTrigger className="w-full">
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

      {/* Problem */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Problem</Label>
        <Select value={selectedProblemStatement} onValueChange={setSelectedProblemStatement}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a problem..." />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {problemsLoading ? (
              <SelectItem value="loading" disabled>Loading problems...</SelectItem>
            ) : sampleProblems.length === 0 ? (
              <SelectItem value="empty" disabled>No problems found</SelectItem>
            ) : (
              sampleProblems.map((problem) => (
                <SelectItem key={problem.id} value={problem["Sample Problems"]}>
                  {problem["Sample Problems"]}
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
    <div className="flex h-full bg-white p-8">
      <div className="flex-1 border rounded-lg bg-white overflow-hidden">
        {/* Header */}
        <div className="bg-background border-b border-border px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">Playground</h1>
            <div className="flex items-center gap-3">
              {/* Load Persona Dropdown */}
              <Select value={selectedPersona} onValueChange={handlePersonaSelection}>
                <SelectTrigger className="flex-1 max-w-[250px]">
                  <SelectValue placeholder="Load a persona..." />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="Democratic Lawmaker" className="truncate">Democratic Lawmaker</SelectItem>
                  <SelectItem value="Conservative Lawmaker" className="truncate">Conservative Lawmaker</SelectItem>
                  <SelectItem value="Republican Lawmaker" className="truncate">Republican Lawmaker</SelectItem>
                  <SelectItem value="Progressive Lawmaker" className="truncate">Progressive Lawmaker</SelectItem>
                  <SelectItem value="Rookie Lawmaker" className="truncate">Rookie Lawmaker</SelectItem>
                  <SelectItem value="Veteran Lawmaker" className="truncate">Veteran Lawmaker</SelectItem>
                </SelectContent>
              </Select>

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
              
              {/* Content Area - Using PlaygroundChat component */}
              <div className="flex justify-center w-full">
                <PlaygroundChat />
              </div>
            </div>
          </div>

            {/* Right Panel - Settings (Desktop Only) */}
            {!isMobile && (
              <div className="w-80 bg-white p-6">
                <SettingsContent />
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Playground;