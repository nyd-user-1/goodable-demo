import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import BlogCMS from '@/components/features/admin/BlogCMS';
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
  BarChart3,
  Users,
  FileText,
  Shield,
  Settings,
  AlertTriangle,
  Activity,
  Database,
  Mail,
  Flag,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  AlertCircle,
  Server,
  HardDrive,
  Cpu,
  Wifi,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  MessageSquare,
  Heart,
  Share2,
  Calendar,
  Globe,
  Lock,
  Unlock,
  Bell,
  BellOff,
  Archive
} from 'lucide-react';

const Admin = () => {
  const { user, isAdmin: hasAdminAccess } = useAuth();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  
  // Redirect if not admin
  useEffect(() => {
    if (!hasAdminAccess && user) {
      navigate('/');
    }
  }, [hasAdminAccess, user, navigate]);

  // Mock data for demonstration
  const systemStats = {
    totalUsers: 2847,
    activeUsers: 1293,
    totalPosts: 5674,
    pendingModeration: 23,
    systemHealth: 98.5,
    uptime: '99.9%',
    avgResponseTime: '120ms',
    dailyActiveUsers: 892
  };

  const recentUsers = [
    { id: 1, name: 'John Smith', email: 'john@example.com', role: 'Member', status: 'active', joined: '2024-01-15', lastActive: '2 hours ago' },
    { id: 2, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Moderator', status: 'active', joined: '2024-01-10', lastActive: '1 day ago' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Member', status: 'suspended', joined: '2024-01-08', lastActive: '3 days ago' },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', role: 'Admin', status: 'active', joined: '2024-01-05', lastActive: '30 minutes ago' }
  ];

  const moderationQueue = [
    { id: 1, type: 'Post', title: 'Housing Policy Proposal', author: 'Alex Chen', reported: 3, reason: 'Spam', priority: 'high' },
    { id: 2, type: 'Comment', title: 'Response to Education Reform', author: 'Maria Lopez', reported: 1, reason: 'Inappropriate', priority: 'medium' },
    { id: 3, type: 'Post', title: 'Healthcare Discussion', author: 'David Kim', reported: 2, reason: 'Misinformation', priority: 'high' },
    { id: 4, type: 'Comment', title: 'Budget Analysis Feedback', author: 'Lisa Brown', reported: 1, reason: 'Off-topic', priority: 'low' }
  ];

  const auditLogs = [
    { id: 1, action: 'User Login', user: 'admin@goodable.com', timestamp: '2024-01-20 14:30:22', details: 'Successful login from 192.168.1.1' },
    { id: 2, action: 'Post Moderated', user: 'moderator@goodable.com', timestamp: '2024-01-20 14:25:15', details: 'Approved post ID: 1234' },
    { id: 3, action: 'User Suspended', user: 'admin@goodable.com', timestamp: '2024-01-20 14:20:08', details: 'Suspended user: mike@example.com' },
    { id: 4, action: 'Settings Changed', user: 'admin@goodable.com', timestamp: '2024-01-20 14:15:33', details: 'Updated email notifications' }
  ];

  const featureFlags = [
    { name: 'New Dashboard', key: 'new_dashboard', enabled: true, description: 'Enable the redesigned dashboard interface' },
    { name: 'AI Moderation', key: 'ai_moderation', enabled: false, description: 'Use AI to pre-moderate content' },
    { name: 'Advanced Analytics', key: 'advanced_analytics', enabled: true, description: 'Show advanced analytics to users' },
    { name: 'Beta Features', key: 'beta_features', enabled: false, description: 'Enable experimental features for testing' }
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Administration</h1>
              <p className="text-muted-foreground text-lg">
                System management and configuration
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={systemStats.systemHealth > 95 ? "default" : "destructive"} className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {systemStats.systemHealth}% Health
              </Badge>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Blog CMS
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Management
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab - Overview + Analytics */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12% from last month
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.activeUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +8% from yesterday
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.totalPosts.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-orange-600 flex items-center">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      -2% from last week
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Moderation</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.pendingModeration}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Requires attention
                    </span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Real-time system performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">CPU Usage</span>
                      <span className="text-sm font-medium">23%</span>
                    </div>
                    <Progress value={23} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Memory Usage</span>
                      <span className="text-sm font-medium">67%</span>
                    </div>
                    <Progress value={67} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Storage Usage</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <Progress value={45} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Network Usage</span>
                      <span className="text-sm font-medium">12%</span>
                    </div>
                    <Progress value={12} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system events and user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {auditLogs.slice(0, 4).map((log) => (
                      <div key={log.id} className="flex items-start space-x-4">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-muted-foreground">{log.details}</p>
                          <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">User Management</h3>
                <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search users..." className="w-64" />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button>
                  <Users className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'Admin' ? 'default' : user.role === 'Moderator' ? 'secondary' : 'outline'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.joined}</TableCell>
                      <TableCell>{user.lastActive}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Ban className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">5,674</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Published</span>
                      <span>5,651</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Draft</span>
                      <span>23</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Archived</span>
                      <span>312</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Comments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">12,438</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Approved</span>
                      <span>12,401</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending</span>
                      <span>37</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spam</span>
                      <span>156</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">87,293</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Likes</span>
                      <span>45,672</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shares</span>
                      <span>23,891</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bookmarks</span>
                      <span>17,730</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Management Actions */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Actions</CardTitle>
                  <CardDescription>Perform actions on multiple content items</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Pending Posts
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Flagged Content
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Old Posts
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Spam Comments
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Policies</CardTitle>
                  <CardDescription>Configure content moderation rules</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto-moderate spam</div>
                      <div className="text-sm text-muted-foreground">Automatically flag suspected spam</div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Require approval</div>
                      <div className="text-sm text-muted-foreground">New posts need approval</div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Word filter</div>
                      <div className="text-sm text-muted-foreground">Filter inappropriate language</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Blog CMS Tab */}
          <TabsContent value="blog" className="space-y-6">
            <BlogCMS />
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Moderation Queue</h3>
                <p className="text-muted-foreground">Review reported content and user violations</p>
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Queue
                </Button>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moderationQueue.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{item.author}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.reported}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.reason === 'Spam' ? 'destructive' : 'secondary'}>
                          {item.reason}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'secondary' : 'outline'}>
                          {item.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="text-green-600">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <XCircle className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.uptime}</div>
                  <p className="text-xs text-muted-foreground">
                    Last restart: 15 days ago
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.avgResponseTime}</div>
                  <p className="text-xs text-muted-foreground">
                    Average over 24h
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45%</div>
                  <p className="text-xs text-muted-foreground">
                    2.3TB of 5TB used
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Database</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.1GB</div>
                  <p className="text-xs text-muted-foreground">
                    34K active connections
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* System Controls */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>System Maintenance</CardTitle>
                  <CardDescription>Perform system maintenance tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="w-4 h-4 mr-2" />
                    Optimize Database
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Download Backup
                  </Button>
                  <Button variant="destructive" className="w-full justify-start">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Restart System
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Flags</CardTitle>
                  <CardDescription>Enable or disable platform features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {featureFlags.map((flag) => (
                    <div key={flag.key} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{flag.name}</div>
                        <div className="text-sm text-muted-foreground">{flag.description}</div>
                      </div>
                      <Switch defaultChecked={flag.enabled} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                  <CardDescription>Platform usage over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Analytics chart would go here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>User locations worldwide</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">World map would go here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Content */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
                <CardDescription>Most popular posts and discussions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Sample Policy Discussion #{i}</div>
                        <div className="text-sm text-muted-foreground">Published 2 days ago</div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {Math.floor(Math.random() * 1000 + 500)}
                        </div>
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {Math.floor(Math.random() * 100 + 50)}
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {Math.floor(Math.random() * 50 + 10)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Basic platform configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Site Name</label>
                    <Input defaultValue="Goodable" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Site Description</label>
                    <Textarea defaultValue="Legislative policy analysis and bill tracking platform" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Admin Email</label>
                    <Input defaultValue="admin@goodable.com" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Authentication and security options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-muted-foreground">Require 2FA for admin accounts</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Login Rate Limiting</div>
                      <div className="text-sm text-muted-foreground">Limit failed login attempts</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Session Timeout</div>
                      <div className="text-sm text-muted-foreground">Auto-logout inactive users</div>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Settings</CardTitle>
                  <CardDescription>Configure email notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SMTP Server</label>
                    <Input defaultValue="smtp.goodable.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">From Address</label>
                    <Input defaultValue="noreply@goodable.com" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">Send system notifications</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integration Settings</CardTitle>
                  <CardDescription>Third-party service configurations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <div className="flex space-x-2">
                      <Input type="password" defaultValue="••••••••••••••••" />
                      <Button variant="outline">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">External API Access</div>
                      <div className="text-sm text-muted-foreground">Allow third-party integrations</div>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Audit Logs</h3>
                <p className="text-muted-foreground">System activity and user actions</p>
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="admin">Admin Actions</SelectItem>
                    <SelectItem value="system">System Events</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                      <TableCell>
                        <Badge variant="default">Success</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;