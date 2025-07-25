import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useCurrentUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Users, 
  Calendar, 
  Star,
  MessageSquare,
  Share2,
  Download,
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  AlignCenter,
  Quote,
  Link2,
  Image,
  Save
} from 'lucide-react';
import { Problem } from '@/data/problems';

interface Proposal {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  status: 'draft' | 'review' | 'approved' | 'implemented';
  lastModified: string;
  collaborators: number;
  comments: number;
  version: string;
}

interface ProblemProposalsProps {
  problem: Problem;
}

export const ProblemProposals = ({ problem }: ProblemProposalsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile: currentUserProfile } = useCurrentUserProfile();
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: '1',
      title: 'Comprehensive Housing Affordability Act',
      content: `# Legislative Proposal: Housing Affordability Initiative

## Executive Summary
This proposal outlines a comprehensive approach to addressing housing affordability through a multi-pronged strategy that includes zoning reform, tax incentives, and public-private partnerships.

## Key Provisions
1. **Zoning Reform**: Streamline approval processes for affordable housing developments
2. **Tax Incentives**: Provide tax credits for developers who include affordable units
3. **Public Investment**: Establish a $500M housing trust fund

## Implementation Timeline
- **Phase 1** (Months 1-6): Legislative drafting and stakeholder consultation
- **Phase 2** (Months 7-12): Committee review and public hearings
- **Phase 3** (Year 2): Implementation and monitoring

## Expected Outcomes
- Increase affordable housing supply by 25% over 5 years
- Reduce average housing costs by 15% in target markets
- Create 10,000 construction jobs`,
      author: {
        name: 'Rep. Maria Santos',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
        role: 'Legislator'
      },
      status: 'review',
      lastModified: '2 hours ago',
      collaborators: 8,
      comments: 23,
      version: '2.1'
    },
    {
      id: '2',
      title: 'Community Land Trust Expansion Program',
      content: `# Community Land Trust Expansion

## Background
Community land trusts have proven effective in maintaining long-term housing affordability while building community wealth.

## Proposal Details
This initiative would establish state funding and technical assistance for community land trusts, with particular focus on historically underinvested communities.

## Funding Request
$50M over 3 years for:
- Land acquisition grants
- Technical assistance
- Capacity building

## Measurable Goals
- Support 25 new community land trusts
- Preserve 2,000 affordable housing units
- Build local governance capacity`,
      author: {
        name: 'Dr. Jennifer Chen',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
        role: 'Policy Analyst'
      },
      status: 'draft',
      lastModified: '1 day ago',
      collaborators: 4,
      comments: 12,
      version: '1.3'
    }
  ]);

  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [newProposalTitle, setNewProposalTitle] = useState('');
  const [showNewProposal, setShowNewProposal] = useState(false);

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    review: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    implemented: 'bg-purple-100 text-purple-800'
  };

  const [textFormat, setTextFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
    align: 'left'
  });

  const formatText = (command: string) => {
    if (!editContent) return;
    
    const textarea = document.querySelector('textarea[value="' + editContent + '"]');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editContent.substring(start, end);
    
    let newText = editContent;
    
    switch (command) {
      case 'bold':
        if (selectedText) {
          const replacement = textFormat.bold ? selectedText.replace(/\*\*(.*?)\*\*/g, '$1') : `**${selectedText}**`;
          newText = editContent.substring(0, start) + replacement + editContent.substring(end);
          setTextFormat(prev => ({ ...prev, bold: !prev.bold }));
        }
        break;
      case 'italic':
        if (selectedText) {
          const replacement = textFormat.italic ? selectedText.replace(/\*(.*?)\*/g, '$1') : `*${selectedText}*`;
          newText = editContent.substring(0, start) + replacement + editContent.substring(end);
          setTextFormat(prev => ({ ...prev, italic: !prev.italic }));
        }
        break;
      case 'underline':
        if (selectedText) {
          const replacement = textFormat.underline ? selectedText.replace(/<u>(.*?)<\/u>/g, '$1') : `<u>${selectedText}</u>`;
          newText = editContent.substring(0, start) + replacement + editContent.substring(end);
          setTextFormat(prev => ({ ...prev, underline: !prev.underline }));
        }
        break;
      case 'justifyLeft':
        setTextFormat(prev => ({ ...prev, align: 'left' }));
        break;
      case 'justifyCenter':
        setTextFormat(prev => ({ ...prev, align: 'center' }));
        break;
      case 'insertUnorderedList':
        if (selectedText) {
          const lines = selectedText.split('\n');
          const listItems = lines.map(line => line.trim() ? `- ${line.trim()}` : line).join('\n');
          newText = editContent.substring(0, start) + listItems + editContent.substring(end);
        } else {
          newText = editContent.substring(0, start) + '\n- ' + editContent.substring(end);
        }
        break;
      case 'insertOrderedList':
        if (selectedText) {
          const lines = selectedText.split('\n');
          const listItems = lines.map((line, index) => line.trim() ? `${index + 1}. ${line.trim()}` : line).join('\n');
          newText = editContent.substring(0, start) + listItems + editContent.substring(end);
        } else {
          newText = editContent.substring(0, start) + '\n1. ' + editContent.substring(end);
        }
        break;
      case 'formatBlock':
        if (selectedText) {
          const replacement = selectedText.startsWith('> ') ? selectedText.replace(/^> /gm, '') : selectedText.replace(/^/gm, '> ');
          newText = editContent.substring(0, start) + replacement + editContent.substring(end);
        }
        break;
    }
    
    setEditContent(newText);
  };

  const handleStartEdit = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setEditContent(proposal.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (selectedProposal) {
      setProposals(proposals.map(p => 
        p.id === selectedProposal.id 
          ? { ...p, content: editContent, lastModified: 'Just now' }
          : p
      ));
      setIsEditing(false);
      setSelectedProposal(null);
    }
  };

  const handleCreateProposal = () => {
    if (!newProposalTitle.trim()) return;
    
    // Get user display name from profile or fallback to email
    const getUserDisplayName = () => {
      if (currentUserProfile?.display_name) return currentUserProfile.display_name;
      if (currentUserProfile?.username) return currentUserProfile.username;
      if (user?.email) return user.email.split('@')[0];
      return 'You';
    };
    
    const newProposal: Proposal = {
      id: Date.now().toString(),
      title: newProposalTitle,
      content: '# New Proposal\n\nStart writing your proposal here...',
      author: {
        name: getUserDisplayName(),
        avatar: currentUserProfile?.avatar_url || '',
        role: currentUserProfile?.role || 'Member'
      },
      status: 'draft',
      lastModified: 'Just now',
      collaborators: 1,
      comments: 0,
      version: '1.0'
    };
    
    setProposals([newProposal, ...proposals]);
    setNewProposalTitle('');
    setShowNewProposal(false);
    handleStartEdit(newProposal);
  };

  const handlePublishProposal = async (proposal: Proposal) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to publish proposals.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create blog proposal in Supabase
      const { data, error } = await (supabase as any)
        .from('blog_proposals')
        .insert({
          title: proposal.title,
          content: proposal.content,
          summary: proposal.content.substring(0, 200) + '...',
          author_id: user.id,
          status: 'published',
          category: 'Public Policy',
          tags: [problem.title, 'community-proposal'],
          published_at: new Date().toISOString(),
          is_featured: false,
          view_count: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Update proposal status locally
      setProposals(proposals.map(p => 
        p.id === proposal.id 
          ? { ...p, status: 'approved', lastModified: 'Just now' }
          : p
      ));
      
      toast({
        title: "Proposal Published!",
        description: "Your policy proposal has been published to the Public Policy blog.",
      });
      
      // Only navigate if publish was successful
      setTimeout(() => {
        navigate('/public-policy');
      }, 1500);
    } catch (error: any) {
      console.error('Error publishing proposal:', error);
      
      // More detailed error message
      let errorMessage = "There was an error publishing your proposal. Please try again.";
      if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast({
        title: "Publication Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  if (isEditing && selectedProposal) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              ← Back
            </Button>
            <h2 className="text-lg font-semibold">{selectedProposal.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSaveEdit} size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Rich Text Editor Toolbar */}
        <Card className="p-3">
          <div className="flex items-center gap-1 flex-wrap">
            <Button
              variant={textFormat.bold ? "default" : "ghost"}
              size="sm"
              onClick={() => formatText('bold')}
              className="p-2"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant={textFormat.italic ? "default" : "ghost"}
              size="sm"
              onClick={() => formatText('italic')}
              className="p-2"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant={textFormat.underline ? "default" : "ghost"}
              size="sm"
              onClick={() => formatText('underline')}
              className="p-2"
            >
              <Underline className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-6 bg-border mx-2" />
            
            <Button
              variant={textFormat.align === 'left' ? "default" : "ghost"}
              size="sm"
              onClick={() => formatText('justifyLeft')}
              className="p-2"
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant={textFormat.align === 'center' ? "default" : "ghost"}
              size="sm"
              onClick={() => formatText('justifyCenter')}
              className="p-2"
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-6 bg-border mx-2" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('insertUnorderedList')}
              className="p-2"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('insertOrderedList')}
              className="p-2"
              title="Numbered List"
            >
              <div className="w-4 h-4 text-xs font-bold flex items-center justify-center">1.</div>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('formatBlock')}
              className="p-2"
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-6 bg-border mx-2" />
            
            <Button variant="ghost" size="sm" className="p-2" title="Insert Link" disabled>
              <Link2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2" title="Insert Image" disabled>
              <Image className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Editor */}
        <Card className="p-6">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className={`min-h-[500px] border-0 focus:ring-0 focus-visible:ring-0 resize-none ${
              textFormat.align === 'center' ? 'text-center' : textFormat.align === 'right' ? 'text-right' : 'text-left'
            }`}
            placeholder="Write your proposal here..."
          />
        </Card>

        {/* Collaboration Panel */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Collaborators
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  {selectedProposal.author.avatar && <AvatarImage src={selectedProposal.author.avatar} />}
                  <AvatarFallback>{selectedProposal.author.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{selectedProposal.author.name}</span>
                <Badge variant="secondary" className="text-xs ml-auto">Owner</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold mb-3">Version History</h4>
            <div className="space-y-2">
              <div className="text-sm">
                <div className="font-medium">v{selectedProposal.version}</div>
                <div className="text-muted-foreground">{selectedProposal.lastModified}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold mb-3">Actions</h4>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">Policy Proposals</h2>
          <p className="text-sm text-muted-foreground">
            Collaborative documents for policy solutions
          </p>
        </div>
        <Button onClick={() => setShowNewProposal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Proposal
        </Button>
      </div>

      {/* New Proposal Form */}
      {showNewProposal && (
        <Card className="p-4">
          <div className="space-y-4">
            <Input
              placeholder="Proposal title..."
              value={newProposalTitle}
              onChange={(e) => setNewProposalTitle(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button onClick={handleCreateProposal} disabled={!newProposalTitle.trim()}>
                Create Proposal
              </Button>
              <Button variant="outline" onClick={() => setShowNewProposal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Proposals List */}
      <div className="grid gap-4">
        {proposals.map((proposal) => (
          <Card key={proposal.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-medium">{proposal.title}</h3>
                    <Badge className={statusColors[proposal.status]}>
                      {proposal.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Avatar className="w-4 h-4">
                        {proposal.author.avatar && <AvatarImage src={proposal.author.avatar} />}
                        <AvatarFallback>{proposal.author.name[0]}</AvatarFallback>
                      </Avatar>
                      {proposal.author.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {proposal.lastModified}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {proposal.collaborators} collaborators
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {proposal.comments} comments
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <p>{proposal.content.split('\n')[2]?.replace('## ', '') || 'No preview available'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    v{proposal.version}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartEdit(proposal)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Star className="w-4 h-4 mr-2" />
                    Star
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePublishProposal(proposal)}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Publish
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {proposals.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No proposals yet</h3>
          <p className="text-muted-foreground mb-4">
            Start collaborating on policy solutions by creating your first proposal.
          </p>
          <Button onClick={() => setShowNewProposal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Proposal
          </Button>
        </Card>
      )}
    </div>
  );
};