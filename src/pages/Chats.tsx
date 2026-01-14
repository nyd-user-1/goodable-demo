import { ChatsLoadingSkeleton } from "./chats/components/ChatsLoadingSkeleton";
import { ChatsEmptyState } from "./chats/components/ChatsEmptyState";
import { ChatSessionCard } from "./chats/components/ChatSessionCard";
import { useChatSessions } from "./chats/hooks/useChatSessions";
import { useChatActions } from "./chats/hooks/useChatActions";
import { useProblemChats } from "@/hooks/useProblemChats";
import { ProblemChatCard } from "@/components/ProblemChatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const Chats = () => {
  const { chatSessions, loading, deleteSession } = useChatSessions();
  const { problemChats, loading: problemLoading, deleteProblemChat } = useProblemChats();
  const { copyToClipboard, handleFeedback } = useChatActions();

  if (loading || problemLoading) {
    return <ChatsLoadingSkeleton />;
  }

  // Categorize chat sessions based on their titles and content
  const billChats = chatSessions.filter(session => 
    session.bill_id || 
    session.title.toLowerCase().includes('analysis:') ||
    session.title.toLowerCase().includes('bill')
  );

  const memberChats = chatSessions.filter(session => 
    session.member_id || 
    session.title.toLowerCase().includes('member:') ||
    session.title.toLowerCase().includes('member ')
  );

  const committeeChats = chatSessions.filter(session => 
    session.committee_id || 
    session.title.toLowerCase().includes('committee:') ||
    session.title.toLowerCase().includes('committee ')
  );

  // Get remaining chats that don't fit into the above categories
  const otherChats = chatSessions.filter(session => 
    !billChats.includes(session) && 
    !memberChats.includes(session) && 
    !committeeChats.includes(session)
  );

  const totalChats = chatSessions.length + problemChats.length;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Chat History</h1>
          <p className="text-muted-foreground">
            {totalChats === 0 
              ? "No saved chats yet" 
              : `${problemChats.length} problem chats, ${billChats.length} bill chats, ${memberChats.length} member chats, ${committeeChats.length} committee chats`
            }
          </p>
        </div>

        {totalChats === 0 ? (
          <ChatsEmptyState />
        ) : (
          <Tabs defaultValue="problems" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="problems">Problems</TabsTrigger>
              <TabsTrigger value="bills">Bills</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="committees">Committees</TabsTrigger>
            </TabsList>
            
            
            <TabsContent value="problems" className="space-y-4">
              {problemChats.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No problem chats yet</p>
                  </CardContent>
                </Card>
              ) : (
                problemChats.map((problemChat) => (
                <ProblemChatCard
                  key={problemChat.id}
                  problemChat={problemChat}
                  onDelete={deleteProblemChat}
                  onCopy={copyToClipboard}
                  onFeedback={handleFeedback}
                />
                ))
              )}
            </TabsContent>

            <TabsContent value="bills" className="space-y-4">
              {billChats.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No bill chats yet</p>
                  </CardContent>
                </Card>
              ) : (
                billChats.map((session) => (
                  <ChatSessionCard
                    key={session.id}
                    session={session}
                    onDelete={deleteSession}
                    onCopy={copyToClipboard}
                    onFeedback={handleFeedback}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              {memberChats.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No member chats yet</p>
                  </CardContent>
                </Card>
              ) : (
                memberChats.map((session) => (
                  <ChatSessionCard
                    key={session.id}
                    session={session}
                    onDelete={deleteSession}
                    onCopy={copyToClipboard}
                    onFeedback={handleFeedback}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="committees" className="space-y-4">
              {committeeChats.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No committee chats yet</p>
                  </CardContent>
                </Card>
              ) : (
                committeeChats.map((session) => (
                  <ChatSessionCard
                    key={session.id}
                    session={session}
                    onDelete={deleteSession}
                    onCopy={copyToClipboard}
                    onFeedback={handleFeedback}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Show other/uncategorized chats if any exist */}
        {otherChats.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Other Chats</h2>
            {otherChats.map((session) => (
              <ChatSessionCard
                key={session.id}
                session={session}
                onDelete={deleteSession}
                onCopy={copyToClipboard}
                onFeedback={handleFeedback}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;