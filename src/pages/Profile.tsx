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
  pen_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  area_code: string | null;
  zip_code: string | null;
  city: string | null;
  county: string | null;
  state: string | null;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { subscription, openCustomerPortal } = useSubscription();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else if (!authLoading) {
      // Auth finished loading but no user - stop showing skeletons
      setLoading(false);
    }
  }, [user, authLoading]);

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
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          username: profile?.username || null,
          display_name: profile?.display_name || null,
          pen_name: profile?.pen_name || null,
          bio: profile?.bio || null,
          avatar_url: profile?.avatar_url || null,
          area_code: profile?.area_code || null,
          zip_code: profile?.zip_code || null,
          city: profile?.city || null,
          county: profile?.county || null,
          state: profile?.state || null,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Profile update error:', error);
        throw new Error(`Profile update failed: ${error.message}`);
      }

      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully.",
      });

      // Refresh profile data to ensure consistency
      await fetchProfile();
    } catch (error: any) {
      console.error('Full profile update error:', error);
      toast({
        title: "Error updating profile",
        description: error.message || "An unexpected error occurred. Please try again.",
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
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file (JPG, PNG, GIF, or WebP).",
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
      console.log('Starting file upload for user:', user.id);
      
      // Create a simple filename (no folder structure to avoid RLS issues)
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      
      console.log('Uploading file:', fileName);
      
      // Upload file to Supabase Storage with simple approach
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting if file exists
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}. Please ensure you're logged in and try again.`);
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('Generated public URL:', publicUrl);

      // Ensure we have a profile record first
      let currentProfile = profile;
      if (!currentProfile) {
        console.log('No profile found, creating one...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            username: null,
            display_name: null,
            bio: null,
            avatar_url: publicUrl,
          })
          .select()
          .single();

        if (createError) {
          console.error('Profile creation error:', createError);
          throw new Error(`Profile creation failed: ${createError.message}`);
        }
        
        currentProfile = newProfile;
        setProfile(newProfile);
      } else {
        // Update existing profile
        console.log('Updating existing profile...');
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({
            avatar_url: publicUrl,
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) {
          console.error('Profile update error:', updateError);
          
          // Try upsert as fallback
          console.log('Trying upsert as fallback...');
          const { data: upsertProfile, error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              user_id: user.id,
              username: profile?.username || null,
              display_name: profile?.display_name || null,
              pen_name: profile?.pen_name || null,
              bio: profile?.bio || null,
              avatar_url: publicUrl,
              area_code: profile?.area_code || null,
              zip_code: profile?.zip_code || null,
              city: profile?.city || null,
              county: profile?.county || null,
              state: profile?.state || null,
            }, {
              onConflict: 'user_id'
            })
            .select()
            .single();

          if (upsertError) {
            console.error('Profile upsert error:', upsertError);
            throw new Error(`Profile update failed: ${upsertError.message}`);
          }
          
          currentProfile = upsertProfile;
        } else {
          currentProfile = updatedProfile;
        }
        
        setProfile(currentProfile);
      }

      console.log('Profile updated successfully');

      toast({
        title: "Avatar uploaded!",
        description: "Your profile picture has been updated successfully.",
      });

      // Clean up old avatars (non-critical operation)
      try {
        const { data: existingFiles } = await supabase.storage
          .from('avatars')
          .list('', {
            search: `avatar-${user.id}`
          });

        if (existingFiles && existingFiles.length > 1) {
          // Keep only the most recent file, delete others
          const sortedFiles = existingFiles
            .filter(f => f.name !== fileName)
            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
            .slice(1); // Keep the most recent, get the rest for deletion

          if (sortedFiles.length > 0) {
            await supabase.storage
              .from('avatars')
              .remove(sortedFiles.map(f => f.name));
          }
        }
      } catch (cleanupError) {
        console.log('Cleanup error (non-critical):', cleanupError);
      }

    } catch (error: any) {
      console.error('Full upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An unexpected error occurred. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

                  {/* Location Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Location Information</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="area-code">Area Code</Label>
                        <Input
                          id="area-code"
                          type="text"
                          placeholder="e.g., 212"
                          value={profile?.area_code || ''}
                          onChange={(e) => setProfile(prev => prev ? {...prev, area_code: e.target.value} : null)}
                          maxLength={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="zip-code">Zip Code</Label>
                        <Input
                          id="zip-code"
                          type="text"
                          placeholder="e.g., 10001"
                          value={profile?.zip_code || ''}
                          onChange={(e) => setProfile(prev => prev ? {...prev, zip_code: e.target.value} : null)}
                          maxLength={5}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City or Hamlet</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="Enter your city or hamlet"
                        value={profile?.city || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, city: e.target.value} : null)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="county">County</Label>
                        <Input
                          id="county"
                          type="text"
                          placeholder="Enter your county"
                          value={profile?.county || ''}
                          onChange={(e) => setProfile(prev => prev ? {...prev, county: e.target.value} : null)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          type="text"
                          placeholder="e.g., NY"
                          value={profile?.state || ''}
                          onChange={(e) => setProfile(prev => prev ? {...prev, state: e.target.value} : null)}
                          maxLength={2}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Your zip code will be displayed alongside your Username and Pen Name to provide readers additional context around your point of view. 
                      While we strive to maintain user anonymity where desired, it is 2025 and organizations much larger than ours have failed at this task, 
                      so you should behave here as you would in public. And if you're disrespectful in public, you'll be asked to leave here too.
                    </p>
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
                    <p className="text-xs text-muted-foreground">
                      This will be used to provide public credit where it is desired and a typical format would be John S.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pen-name">Pen Name</Label>
                    <Input
                      id="pen-name"
                      type="text"
                      placeholder="Enter your pen name"
                      value={profile?.pen_name || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, pen_name: e.target.value} : null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be used when you want to advance a public policy proposal, but wish to do so with anonymity.
                    </p>
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