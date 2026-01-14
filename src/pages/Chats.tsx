import { ChatsLoadingSkeleton } from "./chats/components/ChatsLoadingSkeleton";
import { ChatsEmptyState } from "./chats/components/ChatsEmptyState";
import { ChatSessionCard } from "./chats/components/ChatSessionCard";
import { useChatSessions } from "./chats/hooks/useChatSessions";
import { useChatActions } from "./chats/hooks/useChatActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const Chats = () => {
  const { chatSessions, loading, deleteSession } = useChatSessions();
  const { copyToClipboard, handleFeedback } = useChatActions();

  if (loading) {
    return <ChatsLoadingSkeleton />;
  }

  // Categorize chat sessions based on their entity associations (bill_id, member_id, committee_id)
  // Only use ID-based categorization to avoid false positives from keyword matching
  const billChats = chatSessions.filter(session =>
    session.bill_id ||
    session.title.toLowerCase().startsWith('analysis:')
  );

  const memberChats = chatSessions.filter(session =>
    session.member_id ||
    session.title.toLowerCase().startsWith('member:')
  );

  const committeeChats = chatSessions.filter(session =>
    session.committee_id ||
    session.title.toLowerCase().startsWith('committee:')
  );

  // Get remaining chats that don't fit into the above categories
  const otherChats = chatSessions.filter(session =>
    !billChats.includes(session) &&
    !memberChats.includes(session) &&
    !committeeChats.includes(session)
  );

  const totalChats = chatSessions.length;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Chat History</h1>
          <p className="text-muted-foreground">
            {totalChats === 0
              ? "No saved chats yet"
              : `${otherChats.length} chats, ${billChats.length} bill chats, ${memberChats.length} member chats, ${committeeChats.length} committee chats`
            }
          </p>
        </div>

        {totalChats === 0 ? (
          <ChatsEmptyState />
        ) : (
          <Tabs defaultValue="chats" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chats">Chats</TabsTrigger>
              <TabsTrigger value="bills">Bills</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="committees">Committees</TabsTrigger>
            </TabsList>
            
            
            <TabsContent value="chats" className="space-y-4">
              {otherChats.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No chats yet. Start a conversation from the New Chat page.</p>
                  </CardContent>
                </Card>
              ) : (
                otherChats.map((session) => (
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

      </div>
    </div>
  );
};

export default Chats;