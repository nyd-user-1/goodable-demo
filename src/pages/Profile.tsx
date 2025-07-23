import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Settings, Upload } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { ProfileSubscriptionPlans } from '@/components/ProfileSubscriptionPlans';

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { subscription, openCustomerPortal } = useSubscription();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
      } else if (data) {
        setProfile(data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          username: profile.username,
          display_name: profile.display_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
        });

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getTierDisplayName = (tier: string) => {
    const tierNames: Record<string, string> = {
      free: 'Free',
      student: 'Student',
      staffer: 'Staffer',
      researcher: 'Researcher',
      professional: 'Professional',
      enterprise: 'Enterprise',
      government: 'Government'
    };
    return tierNames[tier] || tier;
  };

  const getTierColor = (tier: string) => {
    const tierColors: Record<string, string> = {
      free: 'secondary',
      student: 'outline',
      staffer: 'default',
      researcher: 'secondary',
      professional: 'default',
      enterprise: 'destructive',
      government: 'outline'
    };
    return tierColors[tier] || 'secondary';
  };

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open subscription management portal",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      setProfile(prev => prev ? {...prev, avatar_url: publicUrl} : null);

      toast({
        title: "Avatar uploaded!",
        description: "Your profile picture has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-brand-50/30 p-4">
        <div className="container max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-brand-50/30 p-4">
      <div className="container max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={updateProfile} className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profile?.avatar_url || ''} alt="Profile picture" />
                        <AvatarFallback className="text-lg">
                          {user ? getInitials(user.email || '') : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        type="button"
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="avatar-url">Avatar URL (or upload an image)</Label>
                      <Input
                        id="avatar-url"
                        type="url"
                        placeholder="https://example.com/avatar.jpg"
                        value={profile?.avatar_url || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, avatar_url: e.target.value} : null)}
                      />
                      <p className="text-xs text-muted-foreground">
                        {uploading ? 'Uploading...' : 'You can either enter a URL or click the upload button to upload an image'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subscription_tier">Subscription Tier</Label>
                    <div className="flex items-center gap-3">
                      <Badge variant={getTierColor(subscription.subscription_tier) as any} className="flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        {getTierDisplayName(subscription.subscription_tier)}
                      </Badge>
                      {subscription.subscription_end && (
                        <span className="text-sm text-muted-foreground">
                          Expires: {new Date(subscription.subscription_end).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={profile?.username || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, username: e.target.value} : null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input
                      id="display-name"
                      type="text"
                      placeholder="Enter your display name"
                      value={profile?.display_name || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, display_name: e.target.value} : null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      value={profile?.bio || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={saving} className="flex-1">
                      {saving ? "Saving..." : "Save Profile"}
                    </Button>
                    {subscription.subscribed && (
                      <Button type="button" variant="outline" onClick={handleManageSubscription}>
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Subscription
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardContent className="pt-6">
                <ProfileSubscriptionPlans />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;