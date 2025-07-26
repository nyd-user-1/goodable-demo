import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreHorizontal,
  Calendar,
  User,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  FileText,
  Star,
  RefreshCw,
  Download,
  Upload,
  X,
  Save,
  Loader2
} from 'lucide-react';

interface BlogProposal {
  id: string;
  title: string;
  content: string;
  summary: string;
  author_id: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  published_at: string | null;
  view_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string;
  up_votes?: number;
  down_votes?: number;
  comment_count?: number;
  total_score?: number;
}

const BlogCMS = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [proposals, setProposals] = useState<BlogProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<BlogProposal | null>(null);
  const [savingProposal, setSavingProposal] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: 'Public Policy',
    tags: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    is_featured: false
  });

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      // First try the view, if it doesn't exist, fall back to the table
      let { data, error } = await (supabase as any)
        .from('blog_proposal_stats')
        .select('*')
        .order('created_at', { ascending: false });

      // If the view doesn't exist, use the main table
      if (error && error.code === '42P01') {
        console.log('View not found, using blog_proposals table directly');
        const result = await (supabase as any)
          .from('blog_proposals')
          .select(`
            *,
            profiles!blog_proposals_author_id_fkey (
              display_name,
              username,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false });
        
        data = result.data;
        error = result.error;
        
        // Transform the data to match expected format
        if (data) {
          data = data.map((post: any) => ({
            ...post,
            author_name: post.profiles?.display_name || post.profiles?.username || 'Goodable',
            author_avatar: post.profiles?.avatar_url,
            up_votes: 0,
            down_votes: 0,
            comment_count: 0,
            total_score: 0
          }));
        }
      }

      if (error) throw error;

      setProposals(data || []);
    } catch (error) {
      console.error('Error loading proposals:', error);
      toast({
        title: "Error",
        description: "Failed to load blog proposals.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async () => {
    if (!user) return;

    setSavingProposal(true);
    try {
      const { error } = await (supabase as any)
        .from('blog_proposals')
        .insert({
          title: formData.title,
          content: formData.content,
          summary: formData.summary,
          author_id: user.id,
          status: formData.status,
          category: formData.category,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          published_at: formData.status === 'published' ? new Date().toISOString() : null,
          is_featured: formData.is_featured
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog post created successfully.",
      });

      setIsCreateDialogOpen(false);
      resetForm();
      loadProposals();
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast({
        title: "Error",
        description: "Failed to create blog post.",
        variant: "destructive"
      });
    } finally {
      setSavingProposal(false);
    }
  };

  const handleUpdateProposal = async () => {
    if (!selectedProposal) return;

    setSavingProposal(true);
    try {
      const updateData: any = {
        title: formData.title,
        content: formData.content,
        summary: formData.summary,
        status: formData.status,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        is_featured: formData.is_featured,
        updated_at: new Date().toISOString()
      };

      // Set published_at when changing to published status
      if (formData.status === 'published' && selectedProposal.status !== 'published') {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await (supabase as any)
        .from('blog_proposals')
        .update(updateData)
        .eq('id', selectedProposal.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog post updated successfully.",
      });

      setIsEditDialogOpen(false);
      resetForm();
      loadProposals();
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast({
        title: "Error",
        description: "Failed to update blog post.",
        variant: "destructive"
      });
    } finally {
      setSavingProposal(false);
    }
  };

  const handleDeleteProposal = async (proposalId: string) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('blog_proposals')
        .delete()
        .eq('id', proposalId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog post deleted successfully.",
      });

      loadProposals();
    } catch (error) {
      console.error('Error deleting proposal:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog post.",
        variant: "destructive"
      });
    }
  };

  const handleToggleFeatured = async (proposalId: string, currentFeatured: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('blog_proposals')
        .update({ is_featured: !currentFeatured })
        .eq('id', proposalId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Blog post ${!currentFeatured ? 'featured' : 'unfeatured'} successfully.`,
      });

      loadProposals();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast({
        title: "Error",
        description: "Failed to update featured status.",
        variant: "destructive"
      });
    }
  };

  const handleEditClick = (proposal: BlogProposal) => {
    setSelectedProposal(proposal);
    setFormData({
      title: proposal.title,
      content: proposal.content,
      summary: proposal.summary,
      category: proposal.category,
      tags: proposal.tags.join(', '),
      status: proposal.status,
      is_featured: proposal.is_featured
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      summary: '',
      category: 'Public Policy',
      tags: '',
      status: 'draft',
      is_featured: false
    });
    setSelectedProposal(null);
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = 
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.author_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || proposal.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not published';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Blog Content Management</h3>
          <p className="text-muted-foreground">Create, edit, and manage blog posts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadProposals}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Blog Post</DialogTitle>
                <DialogDescription>
                  Create a new blog post for the public policy section.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter blog post title..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Summary</label>
                  <Textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Brief summary of the post..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your blog post content here..."
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Public Policy">Public Policy</SelectItem>
                        <SelectItem value="Legislation">Legislation</SelectItem>
                        <SelectItem value="Analysis">Analysis</SelectItem>
                        <SelectItem value="Opinion">Opinion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags (comma-separated)</label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="housing, policy, reform"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <label className="text-sm font-medium">Feature this post</label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProposal} disabled={savingProposal || !formData.title || !formData.content}>
                  {savingProposal ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Post
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Public Policy">Public Policy</SelectItem>
            <SelectItem value="Legislation">Legislation</SelectItem>
            <SelectItem value="Analysis">Analysis</SelectItem>
            <SelectItem value="Opinion">Opinion</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proposals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {proposals.filter(p => p.status === 'published').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {proposals.filter(p => p.is_featured).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {proposals.reduce((sum, p) => sum + (p.comment_count || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Engagement</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProposals.map((proposal) => (
              <TableRow key={proposal.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{proposal.title}</p>
                      {proposal.is_featured && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {proposal.summary}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {proposal.category}
                      </Badge>
                      {proposal.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={proposal.author_avatar} />
                      <AvatarFallback>
                        {proposal.author_name === 'Goodable' ? '❤️' : (proposal.author_name?.[0] || 'G')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{proposal.author_name || 'Goodable'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(proposal.status)}>
                    {proposal.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      {proposal.up_votes || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowDown className="w-3 h-3" />
                      {proposal.down_votes || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {proposal.comment_count || 0}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(proposal.published_at)}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEditClick(proposal)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleFeatured(proposal.id, proposal.is_featured)}>
                        <Star className="w-4 h-4 mr-2" />
                        {proposal.is_featured ? 'Unfeature' : 'Feature'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => window.open(`/public-policy`, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteProposal(proposal.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredProposals.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No blog posts found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>
              Update the blog post details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter blog post title..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Summary</label>
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief summary of the post..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your blog post content here..."
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Public Policy">Public Policy</SelectItem>
                    <SelectItem value="Legislation">Legislation</SelectItem>
                    <SelectItem value="Analysis">Analysis</SelectItem>
                    <SelectItem value="Opinion">Opinion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="housing, policy, reform"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
              <label className="text-sm font-medium">Feature this post</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProposal} disabled={savingProposal || !formData.title || !formData.content}>
              {savingProposal ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Post
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogCMS;