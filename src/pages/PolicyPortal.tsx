import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw, Download, Code, Share, List, SlidersHorizontal, Settings, Info, X, HelpCircle, Trash2, Copy, MessageSquare, Check, MessageCircle, ArrowRight } from "lucide-react";
import { MorphingHeartLoader } from "@/components/ui/MorphingHeartLoader";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePolicyDrafts, PolicyDraft } from "@/hooks/usePolicyDrafts";
import { PolicyDraftDialog } from "@/components/PolicyDraftDialog";
import { format } from "date-fns";
import ReactMarkdown from 'react-markdown';

interface ChatSession {
  id: string;
  title: string;
  messages: any[];
  bill_id?: number;
  member_id?: number;
  committee_id?: number;
  created_at: string;
}

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

const PipelineStatus = ({ stage }: { stage: 'input' | 'processing' | 'draft' | 'review' }) => {
  const stages = ['Input', 'Processing', 'Draft', 'Review'];
  const stageKeys = ['input', 'processing', 'draft', 'review'];
  
  return (
    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-blue-900">Pipeline Stage:</span>
        <div className="flex gap-2">
          {stages.map((s, i) => (
            <div key={s} className={`px-2 py-1 rounded text-xs ${
              i <= stageKeys.indexOf(stage) 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PolicyPortal = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedChat, setSelectedChat] = useState("");
  const [selectedPersona, setSelectedPersona] = useState("");
  const [selectedPersonaAct, setSelectedPersonaAct] = useState("");
  const [selectedProblemStatement, setSelectedProblemStatement] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState([0.56]);
  const [maxWords, setMaxWords] = useState(250); // Changed from maxLength to maxWords
  const [topP, setTopP] = useState([0.9]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOptions, setChatOptions] = useState<ChatOption[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [sampleProblems, setSampleProblems] = useState<{id: number, "Sample Problems": string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [personasLoading, setPersonasLoading] = useState(false);
  const [problemsLoading, setProblemsLoading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [mode, setMode] = useState<'textEditor' | 'chat'>('textEditor');
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [pipelineStage, setPipelineStage] = useState<'input' | 'processing' | 'draft' | 'review'>('input');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [hasDrafts, setHasDrafts] = useState(false);
  const [loadedChatSession, setLoadedChatSession] = useState<ChatSession | null>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const { drafts, loading: draftsLoading, saveDraft, deleteDraft } = usePolicyDrafts();
  const [selectedDraft, setSelectedDraft] = useState<PolicyDraft | null>(null);
  const [draftDialogOpen, setDraftDialogOpen] = useState(false);

  // Debug logging for drafts
  useEffect(() => {
  }, [drafts, draftsLoading]);

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

      // Fetch member and committee data for better labeling
      const memberIds = [...new Set(chatSessions?.filter(s => s.member_id).map(s => s.member_id))];
      const committeeIds = [...new Set(chatSessions?.filter(s => s.committee_id).map(s => s.committee_id))];

      let membersData: any[] = [];
      let committeesData: any[] = [];

      if (memberIds.length > 0) {
        const { data: members } = await supabase
          .from("People")
          .select("people_id, name, first_name, last_name")
          .in("people_id", memberIds);
        membersData = members || [];
      }

      if (committeeIds.length > 0) {
        const { data: committees } = await supabase
          .from("Committees")
          .select("committee_id, committee_name")
          .in("committee_id", committeeIds);
        committeesData = committees || [];
      }

      // Process chat sessions and create options
      chatSessions?.forEach((session: any) => {
        const messages = Array.isArray(session.messages) ? session.messages : JSON.parse(session.messages || '[]');
        const formattedConversation = formatChatConversation(messages);
        const firstUserMessage = messages.find((msg: any) => msg.role === 'user')?.content || '';

        if (session.title.toLowerCase().includes('problem:')) {
          const problemNumber = session.title.split(':')[1]?.trim() || 'Unknown';
          options.push({
            id: session.id,
            label: `Problem ${problemNumber}`,
            content: formattedConversation,
            type: 'problem'
          });
        } else if (session.title.toLowerCase().includes('solution:')) {
          const solutionNumber = session.title.split(':')[1]?.trim() || 'Unknown';
          options.push({
            id: session.id,
            label: `Solution ${solutionNumber}`,
            content: formattedConversation,
            type: 'solution'
          });
        } else if (session.title.toLowerCase().includes('media kit:')) {
          const mediaKitNumber = session.title.split(':')[1]?.trim() || 'Unknown';
          options.push({
            id: session.id,
            label: `Media Kit ${mediaKitNumber}`,
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
          // For member-related chats, find member name
          const member = membersData.find(m => m.people_id === session.member_id);
          const memberName = member ? (member.name || `${member.first_name} ${member.last_name}`.trim()) : 'Unknown Member';
          options.push({
            id: session.id,
            label: `Member Chat: ${memberName}`,
            content: formattedConversation,
            type: 'member'
          });
        } else if (session.committee_id) {
          // For committee-related chats, find committee name
          const committee = committeesData.find(c => c.committee_id === session.committee_id);
          const committeeName = committee ? committee.committee_name : 'Unknown Committee';
          options.push({
            id: session.id,
            label: `Committee Chat: ${committeeName}`,
            content: formattedConversation,
            type: 'committee'
          });
        } else {
          // Generic chat session
          const shortPrompt = firstUserMessage.length > 30 ? `${firstUserMessage.substring(0, 30)}...` : firstUserMessage;
          options.push({
            id: session.id,
            label: `Chat: ${shortPrompt}`,
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
        .from("Sample Problems")
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

  const loadChatSession = async (sessionId: string) => {
    try {
      const { data: session, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) throw error;

      if (session) {
        // Parse messages from JSON if needed
        const parsedMessages = Array.isArray(session.messages) 
          ? session.messages 
          : typeof session.messages === 'string' 
            ? JSON.parse(session.messages || '[]')
            : [];
        
        // Create properly typed chat session
        const typedSession: ChatSession = {
          id: session.id,
          title: session.title,
          messages: parsedMessages,
          bill_id: session.bill_id || undefined,
          member_id: session.member_id || undefined,
          committee_id: session.committee_id || undefined,
          created_at: session.created_at
        };
        
        setLoadedChatSession(typedSession);
        setSelectedChat(session.id);
        
        // Convert messages to the format expected by the chat component
        const formattedMessages = parsedMessages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }));
        
        setChatMessages(formattedMessages);
        setMode('chat');
        
        // Set the first user message as the prompt for context
        const firstUserMessage = parsedMessages.find((msg: any) => msg.role === 'user')?.content || '';
        setPrompt(firstUserMessage);
        
              toast({
                title: "Chat Loaded",
                description: `Notification: ${session.title}`,
              });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat session",
        variant: "destructive",
      });
    }
  };

  const handleChatSelection = (chatId: string) => {
    if (chatId === selectedChat) return;
    
    setSelectedChat(chatId);
    loadChatSession(chatId);
  };

  const handleSampleProblemSelection = (problemId: string) => {
    const selectedProblem = sampleProblems.find(problem => problem.id.toString() === problemId);
    if (selectedProblem) {
      setSelectedProblemStatement(selectedProblem["Sample Problems"]);
      setPrompt(`Policy Playground:\nProblem Statement: ${selectedProblem["Sample Problems"]}\n\nInstructions: Transform the identified problem into a policy memo.`);
      setPipelineStage('processing');
      setSelectedChat(problemId);
      // Clear any loaded chat session when selecting a sample problem
      setLoadedChatSession(null);
      setChatMessages([]);
      setMode('textEditor');
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

  const generateDraftTitle = (input: string): string => {
    // Extract a meaningful title from the input
    const lines = input.split('\n').filter(line => line.trim());
    const firstLine = lines[0]?.trim() || '';
    
    if (firstLine.toLowerCase().includes('problem statement:')) {
      const titlePart = firstLine.replace(/problem statement:/i, '').trim();
      return titlePart.length > 50 ? titlePart.substring(0, 47) + '...' : titlePart;
    }
    
    const words = firstLine.split(' ').slice(0, 8).join(' ');
    return words.length > 50 ? words.substring(0, 47) + '...' : words;
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

    // Create abort controller for this request
    const controller = new AbortController();
    setAbortController(controller);
    setIsChatting(true);
    setStreamingContent("");
    setPipelineStage('processing');
    
    try {
      // Initialize chat with user message
      const newUserMessage = { role: 'user' as const, content: prompt };
      const updatedMessages = [...chatMessages, newUserMessage];
      setChatMessages(updatedMessages);

      // Call the edge function with streaming
      const response = await supabase.functions.invoke('chat-with-persona', {
        body: {
          messages: updatedMessages,
          systemPrompt: systemPrompt,
          temperature: temperature[0],
          maxWords: maxWords,
          topP: topP[0]
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Check if request was aborted
      if (controller.signal.aborted) {
        throw new Error('Generation stopped by user');
      }

      // Simulate streaming for now - in production, you'd handle actual streaming
      const fullContent = response.data.message;
      let currentContent = "";
      
      for (let i = 0; i < fullContent.length; i++) {
        // Check if request was aborted during streaming
        if (controller.signal.aborted) {
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 20)); // Simulate typing speed
        currentContent += fullContent[i];
        setStreamingContent(currentContent);
        
        // Scroll to bottom during streaming
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }

      // Only complete if not aborted
      if (!controller.signal.aborted) {
        // Add final AI response to chat
        const aiMessage = { role: 'assistant' as const, content: fullContent };
        const finalMessages = [...updatedMessages, aiMessage];
        setChatMessages(finalMessages);
        setStreamingContent("");
        setPipelineStage('draft');
        
        // Save the draft
        const draftId = saveDraft({
          title: generateDraftTitle(prompt),
          persona: selectedPersona,
          userInput: prompt,
          aiOutput: fullContent
        });

        toast({
          title: "Policy Draft Generated",
          description: (
            <div className="flex flex-col gap-2">
              <span>Legislative draft created with {selectedPersona}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Scroll to My Policy Drafts section
                  const draftsSection = document.getElementById('my-policy-drafts');
                  if (draftsSection) {
                    draftsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-fit"
              >
                View in My Policy Drafts
              </Button>
            </div>
          ),
          duration: 6000,
        });
      }
      
    } catch (error) {
      if (error.message === 'Generation stopped by user') {
        toast({
          title: "Generation Stopped",
          description: "AI generation was stopped by user",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to generate policy draft",
          variant: "destructive",
        });
      }
    } finally {
      setIsChatting(false);
      setAbortController(null);
      setStreamingContent("");
      setPrompt(""); // Clear the prompt after submission
    }
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      toast({
        title: "Stopping Generation",
        description: "Cancelling AI generation...",
      });
    }
  };

  const handleSubmit = async () => {
    if (mode === 'chat') {
      handleChatSubmit();
    } else {
      // Policy Pipeline Processing
      const isProblemInput = prompt.includes('Problem Statement:') || 
                            prompt.includes('problem') || 
                            prompt.includes('issue');
      
      if (isProblemInput && !selectedPersona) {
        // Auto-select appropriate persona
        setSelectedPersona('Legislative Drafter - Citizen Bridge');
        setSelectedPersonaAct('Legislative Drafter - Citizen Bridge');
        const drafterPersona = personas.find(p => p.act === 'Legislative Drafter - Citizen Bridge');
        if (drafterPersona) {
          setSystemPrompt(drafterPersona.prompt || "");
        }
        setMode('chat');
        toast({
          title: "Auto-selected Legislative Drafter",
          description: "Problem detected - using specialized drafter persona",
        });
        return;
      }
      
      // Process with selected persona
      await handleChatSubmit();
    }
  };

  const handleRefresh = () => {
    setPrompt('');
    setChatMessages([]);
    setStreamingContent('');
    setSelectedPersona('');
    setSelectedPersonaAct('');
    setSystemPrompt('');
    setSelectedChat('');
    setLoadedChatSession(null);
    setMode('textEditor');
    setPipelineStage('input');
    toast({
      title: "Policy Portal Cleared",
      description: "All content has been reset",
    });
  };

  const exportAsPDF = () => {
    toast({
      title: "PDF Export",
      description: "PDF export functionality coming soon",
    });
  };

  const shareToNYSLRS = () => {
    toast({
      title: "Professional Sharing",
      description: "NYS professional sharing coming soon",
    });
  };

  const handleDraftClick = (draft: PolicyDraft) => {
    setSelectedDraft(draft);
    setDraftDialogOpen(true);
  };

  const SettingsContent = () => (
    <div className="space-y-6 bg-card p-4 rounded-lg">
      {/* Chat */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Chat</Label>
        <Select value={selectedChat} onValueChange={handleChatSelection}>
          <SelectTrigger>
            <SelectValue placeholder="Select chat" />
          </SelectTrigger>
          <SelectContent>
            {loading ? (
              <SelectItem value="loading" disabled>
                <div className="flex items-center gap-2">
                  <MorphingHeartLoader size={16} className="text-red-500" />
                  <span>Loading chats...</span>
                </div>
              </SelectItem>
            ) : chatOptions.length === 0 ? (
              <SelectItem value="empty" disabled>No chats found</SelectItem>
            ) : (
              chatOptions.map((chat) => (
                <SelectItem key={chat.id} value={chat.id}>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>{chat.label}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Persona Selection */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Persona</Label>
        <Select value={selectedPersona} onValueChange={handlePersonaSelection}>
          <SelectTrigger>
            <SelectValue placeholder="Select persona" />
          </SelectTrigger>
          <SelectContent>
            {personasLoading ? (
              <SelectItem value="loading" disabled>Loading personas...</SelectItem>
            ) : personas.length === 0 ? (
              <SelectItem value="empty" disabled>No personas found</SelectItem>
            ) : (
              personas.map((persona) => (
                <SelectItem key={persona.id} value={persona.act}>
                  {persona.act}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Load Sample Problems */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Problem</Label>
        <Select value={selectedChat} onValueChange={handleSampleProblemSelection}>
          <SelectTrigger>
            <SelectValue placeholder="Select problem" />
          </SelectTrigger>
          <SelectContent>
            {problemsLoading ? (
              <SelectItem value="loading" disabled>Loading problems...</SelectItem>
            ) : sampleProblems.length === 0 ? (
              <SelectItem value="empty" disabled>No problems found</SelectItem>
            ) : (
              sampleProblems.map((problem) => (
                <SelectItem key={problem.id} value={problem.id.toString()}>
                  {problem["Sample Problems"]}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Maximum Length */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-700">Maximum Length</Label>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Maximum Length</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-700 leading-relaxed">
                    Maximum Length determines how long the model's response can be. It's a way to guide the AI on how much detail to include based on your needs.
                    <br /><br />
                    A 250-word response is about half a page, single spaced. It works well for a short summary or a quick explanation.
                    <br /><br />
                    A 500-word response is roughly one full page. It's ideal for a focused proposal, policy outline, or structured argument.
                    <br /><br />
                    A 750-word response comes out to about a page and a half. This length allows for a more detailed breakdown or multi-part response while staying concise.
                    <br /><br />
                    A 1000-word response is approximately two single-spaced pages. This is the upper limit for most memos, offering enough space for thorough analysis or complete legislative recommendations without being overwhelming.
                    <br /><br />
                    In most cases, a one-page memo is enough to communicate a strong and actionable idea. Maximum Length simply helps you shape the depth and scope of your message.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>Close</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <span className="text-sm text-gray-500">{maxWords} words</span>
        </div>
        <Slider
          value={[maxWords]}
          onValueChange={(value) => {
            const newValue = value[0];
            // Snap to nearest valid value
            const validValues = [250, 500, 750, 1000];
            const closest = validValues.reduce((prev, curr) => 
              Math.abs(curr - newValue) < Math.abs(prev - newValue) ? curr : prev
            );
            setMaxWords(closest);
          }}
          max={1000}
          min={0}
          step={1}
          className="w-full"
        />
      </div>

      {/* Temperature */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-700">Temperature</Label>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Temperature</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-700 leading-relaxed">
                    Temperature controls how bold or cautious the model is when generating a response.
                    <br /><br />
                    Lower temperatures (closer to 0) make the model more focused and predictable. It will choose the safest and most likely words, which is helpful for formal writing, legal language, or structured analysis.
                    <br /><br />
                    Higher temperatures (closer to 1) make the model more creative and exploratory. It may take more risks with phrasing, tone, or ideas. This is useful for brainstorming, ideation, or more expressive writing.
                    <br /><br />
                    Most thoughtful work happens between the extremes. Use temperature to dial in whether you want the model to stay on-script or think outside the box.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>Close</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
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

      {/* Top P */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-700">Top P</Label>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Top P</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-700 leading-relaxed">
                    Top P controls how creatively or narrowly the model responds by limiting which words it's allowed to consider next.
                    <br /><br />
                    A lower Top P (like 0.1 to 0.3) restricts the model to a smaller set of highly likely words. This tends to produce more predictable, focused, or formal responses.
                    <br /><br />
                    A higher Top P (like 0.8 to 1.0) gives the model access to a broader range of words. This results in more open-ended, diverse, or creative answers.
                    <br /><br />
                    In practical terms, lower values are useful when precision or clarity matters most. Higher values are better for brainstorming, storytelling, or exploring new perspectives. Use Top P to tune how safe or surprising you want the output to be.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>Close</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
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

      {/* My Policy Drafts Panel */}
      <div id="my-policy-drafts">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">My Policy Drafts</Label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {draftsLoading ? (
            <div className="p-3 bg-white border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-500">Loading drafts...</div>
            </div>
          ) : drafts.length === 0 ? (
            <div className="p-4 bg-white border border-gray-200 rounded-lg text-center">
              <div className="text-sm text-gray-500">No policy drafts yet</div>
              <div className="text-xs text-gray-400 mt-1">Generate your first draft to see it here</div>
            </div>
          ) : (
            drafts.map((draft) => (
              <div 
                key={draft.id}
                className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer group"
                onClick={() => handleDraftClick(draft)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{draft.title}</div>
                    <div className="text-xs text-gray-500 mt-1">Created with {draft.persona}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {format(new Date(draft.createdAt), "MMM d, h:mm a")}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDraft(draft.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="bg-background border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              {loadedChatSession && (
                <p className="text-sm text-gray-600">
                  Loading: {loadedChatSession.title}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Keep space for future header content if needed */}
            </div>
          </div>
        </div>

        {/* Content - Scrollable Container */}
        <ScrollArea className="flex-1">
          <div className="flex min-h-full">
            {/* Left Panel - Bill Chat */}
            <div className={`flex-1 p-4 sm:p-6 ${isMobile ? 'w-full' : ''} flex flex-col max-h-[90vh]`}>
              

              {/* Chat Container with proper height and scroll */}
              <div className="flex-1 flex flex-col bg-background rounded-lg border border-gray-200 min-h-0 max-h-[calc(90vh-200px)]">
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {chatMessages.length === 0 && !streamingContent ? (
                      <div className="text-center text-gray-500 py-8">
                        <p>Start a conversation about this bill</p>
                        {/* Suggested prompts */}
                        <div className="mt-4 space-y-2">
                          <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {[
                              "What does this bill do?",
                              "Who are the sponsors?",
                              "What's the current status?",
                              "What are the key provisions?"
                            ].map((promptText, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setPrompt(promptText);
                                  handleSubmit();
                                }}
                                className="text-xs"
                              >
                                {promptText}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {chatMessages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${
                              message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`${
                                message.role === 'user'
                                  ? 'p-3 rounded-lg max-w-[85%] bg-primary text-primary-foreground'
                                  : 'max-w-none text-gray-800 relative'
                              }`}
                            >
                              {/* Copy and Move to Policy Portal buttons for AI messages */}
                              {message.role === 'assistant' && (
                                <div className="flex gap-1 mb-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      navigator.clipboard.writeText(message.content);
                                      toast({
                                        description: "Response copied to clipboard",
                                      });
                                    }}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copy
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      // Move to Policy Portal functionality
                                      toast({
                                        description: "Moved to Policy Portal",
                                      });
                                    }}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <ArrowRight className="w-3 h-3 mr-1" />
                                    Move to Policy Portal
                                  </Button>
                                </div>
                              )}
                              
                              <div className={`text-xs mb-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                {message.role === 'user' ? 'You' : 'AI Assistant'}
                              </div>
                              <div className={`${message.role === 'assistant' ? 'prose prose-sm max-w-none' : ''}`}>
                                {message.role === 'assistant' ? (
                                  <ReactMarkdown>{message.content}</ReactMarkdown>
                                ) : (
                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {streamingContent && (
                          <div className="flex justify-start">
                            <div className="text-gray-800 max-w-none relative">
                              <div className="text-xs text-gray-500 mb-1">AI Assistant</div>
                              <div className="prose prose-sm max-w-none">
                                <ReactMarkdown>{streamingContent}</ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {/* Input Area - Fixed at bottom, full width */}
                <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg flex-shrink-0">
                  <div className="flex gap-2 w-full">
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ask about this legislation..."
                      className="min-h-[60px] resize-none border border-gray-300 rounded-lg p-3 text-sm flex-1 bg-white text-gray-900"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (prompt.trim() && !isChatting) {
                            handleSubmit();
                          }
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSubmit}
                      disabled={!prompt.trim() || isChatting}
                      className="px-4 self-end"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="flex items-center gap-2 mt-4">
                {!isChatting ? (
                  <Button 
                    variant="outline"
                    onClick={handleSubmit}
                    disabled={!prompt.trim()}
                    className="px-6 bg-white"
                  >
                    {mode === 'chat' ? 'Send Message' : 'Generate Legislation'}
                  </Button>
                ) : (
                  <Button 
                    variant="destructive"
                    onClick={handleStopGeneration}
                    className="px-6"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Stop Generation
                  </Button>
                )}
                
                {chatMessages.length > 0 && (
                  <>
                    <Button variant="outline" onClick={exportAsPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button variant="outline" onClick={shareToNYSLRS}>
                      <Share className="h-4 w-4 mr-2" />
                      Share to Professionals
                    </Button>
                  </>
                )}
                
                <Button variant="ghost" size="sm" onClick={handleRefresh}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Right Panel - Settings (Desktop Only) */}
            {!isMobile && (
              <div className="w-80 bg-background border-l border-gray-200 p-6">
                <SettingsContent />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Policy Draft Dialog */}
      <PolicyDraftDialog
        draft={selectedDraft}
        open={draftDialogOpen}
        onOpenChange={setDraftDialogOpen}
      />
    </div>
  );
};

export default PolicyPortal;
