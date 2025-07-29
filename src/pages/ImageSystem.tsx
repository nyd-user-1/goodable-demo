import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ImageUploadArea } from '@/components/features/image-system/ImageUploadArea';
import { ImagePreviewDialog } from '@/components/features/image-system/ImagePreviewDialog';
import { ImageCard } from '@/components/features/image-system/ImageCard';
import { ImageFilters, type SortOption } from '@/components/features/image-system/ImageFilters';
import { 
  Image,
  Heart,
  Download,
  Copy,
  Check,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Filter,
  X,
  Upload,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
// Site-wide Placeholder Image Component (moved from StyleGuide)
const PlaceholderImage: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'rounded' | 'circle';
}> = ({ className = '', size = 'md', variant = 'default' }) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };
  
  const variantClasses = {
    default: 'rounded-lg',
    rounded: 'rounded-2xl',
    circle: 'rounded-full'
  };
  
  return (
    <div className={cn(
      sizeClasses[size],
      variantClasses[variant],
      'border border-border overflow-hidden flex items-center justify-center',
      'transition-all duration-300 hover:scale-105 hover:shadow-lg',
      className
    )}>
      <img 
        src="/goodable%2015.avif" 
        alt="Goodable site placeholder" 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

interface ImageAsset {
  id: string;
  unique_id: string;
  name: string;
  original_name: string;
  url: string;
  type: string;
  mime_type?: string;
  size_bytes?: number;
  width?: number;
  height?: number;
  tags: string[];
  uploaded_by?: string;
  uploaded_at: string;
  updated_at: string;
  metadata?: any;
}

const ImageSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [assets, setAssets] = useState<ImageAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<ImageAsset | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [animationStates, setAnimationStates] = useState({
    fadeIn: false,
    slideIn: false,
    bounce: false,
    rotate: false,
    pulse: false,
    scale: false
  });

  // Fetch assets from database
  const fetchAssets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('type', 'image')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      setAssets(data || []);
      
      // Extract unique tags
      const tags = new Set<string>();
      data?.forEach(asset => {
        asset.tags?.forEach(tag => tags.add(tag));
      });
      setAvailableTags(Array.from(tags));
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: "Error loading assets",
        description: "Failed to load images from database.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Sort and filter assets
  const sortedAndFilteredAssets = React.useMemo(() => {
    let filtered = selectedTags.length === 0 
      ? assets 
      : assets.filter(asset => 
          selectedTags.some(tag => asset.tags?.includes(tag))
        );

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
        case 'oldest':
          return new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
        case 'name-asc':
          return a.original_name.localeCompare(b.original_name);
        case 'name-desc':
          return b.original_name.localeCompare(a.original_name);
        default:
          return 0;
      }
    });
  }, [assets, selectedTags, sortBy]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleImageClick = (asset: ImageAsset) => {
    setPreviewImage(asset);
    setShowPreview(true);
  };

  const handleUploadComplete = () => {
    fetchAssets(); // Refresh the assets list
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      toast({
        title: "Asset deleted",
        description: "The asset has been successfully deleted.",
      });

      fetchAssets(); // Refresh the assets list
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast({
        title: "Error deleting asset",
        description: "Failed to delete the asset. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleAnimation = (animationType: keyof typeof animationStates) => {
    setAnimationStates(prev => ({
      ...prev,
      [animationType]: !prev[animationType]
    }));
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Goodable Image System</h1>
              <p className="text-muted-foreground">Visual assets, components, and animations for Goodable platform</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Image className="w-3 h-3" />
                v2.0
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Assets
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Assets: {loading ? 'Loading...' : assets.length}
            </div>
            <div>Last Updated: Today</div>
            <div>Components: 4</div>
          </div>
        </div>

        <Tabs defaultValue="assets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Display
            </TabsTrigger>
            <TabsTrigger value="animation" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Animation
            </TabsTrigger>
          </TabsList>

          {/* Display Tab */}
          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Placeholder Image Component</CardTitle>
                <CardDescription>
                  Reusable image component with multiple size and variant options for Goodable content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Size Variants</h4>
                  <div className="flex flex-wrap items-end gap-6">
                    <div className="text-center space-y-2">
                      <PlaceholderImage size="sm" />
                      <code className="text-xs bg-muted px-2 py-1 rounded">sm</code>
                    </div>
                    <div className="text-center space-y-2">
                      <PlaceholderImage size="md" />
                      <code className="text-xs bg-muted px-2 py-1 rounded">md</code>
                    </div>
                    <div className="text-center space-y-2">
                      <PlaceholderImage size="lg" />
                      <code className="text-xs bg-muted px-2 py-1 rounded">lg</code>
                    </div>
                    <div className="text-center space-y-2">
                      <PlaceholderImage size="xl" />
                      <code className="text-xs bg-muted px-2 py-1 rounded">xl</code>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Blog Image Examples</h4>
                  <p className="text-sm text-muted-foreground">Sample blog images for Goodable policy content</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center space-y-2">
                      <div className="aspect-video rounded-lg overflow-hidden border">
                        <img 
                          src="/goodable-heart.avif" 
                          alt="Goodable heart" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">goodable-heart.avif</code>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="aspect-video rounded-lg overflow-hidden border">
                        <img 
                          src="/goodable-night.avif" 
                          alt="Goodable night" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">goodable-night.avif</code>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="aspect-video rounded-lg overflow-hidden border">
                        <img 
                          src="/goodable-botanical.avif" 
                          alt="Goodable botanical" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">goodable-botanical.avif</code>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="aspect-video rounded-lg overflow-hidden border">
                        <img 
                          src="/goodable%2015.avif" 
                          alt="Goodable 15" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">goodable 15.avif</code>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Shape Variants</h4>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="text-center space-y-2">
                      <PlaceholderImage variant="default" />
                      <code className="text-xs bg-muted px-2 py-1 rounded">default</code>
                    </div>
                    <div className="text-center space-y-2">
                      <PlaceholderImage variant="rounded" />
                      <code className="text-xs bg-muted px-2 py-1 rounded">rounded</code>
                    </div>
                    <div className="text-center space-y-2">
                      <PlaceholderImage variant="circle" />
                      <code className="text-xs bg-muted px-2 py-1 rounded">circle</code>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Usage</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm">
{`<PlaceholderImage 
  size="md" 
  variant="default" 
  className="custom-class" 
/>`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Goodable Asset Library</CardTitle>
                <CardDescription>
                  All visual assets for the Goodable platform ({loading ? 'Loading...' : assets.length} items)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Area */}
                {user && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Upload Images</span>
                    </div>
                    <ImageUploadArea onUploadComplete={handleUploadComplete} />
                  </div>
                )}

                {/* Filter Controls */}
                {!loading && (
                  <ImageFilters
                    selectedTags={selectedTags}
                    onTagToggle={toggleTag}
                    onClearFilters={clearFilters}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    availableTags={availableTags}
                    totalAssets={assets.length}
                    filteredCount={sortedAndFilteredAssets.length}
                  />
                )}

                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading assets...</span>
                  </div>
                )}

                {/* Assets Grid */}
                {!loading && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {sortedAndFilteredAssets.map((asset) => (
                      <div key={asset.id} className="flex">
                        <ImageCard
                          asset={asset}
                          onClick={() => handleImageClick(asset)}
                          onCopyUrl={copyToClipboard}
                          onDelete={handleDeleteAsset}
                          copiedItem={copiedItem}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {!loading && sortedAndFilteredAssets.length === 0 && selectedTags.length > 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No assets found</h3>
                    <p>No assets match the selected filters. Try clearing filters or selecting different tags.</p>
                  </div>
                )}

                {!loading && assets.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No assets uploaded</h3>
                    <p>Upload your first image to get started with the asset library.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Animation Tab */}
          <TabsContent value="animation" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Fade In Animation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fade In</CardTitle>
                  <CardDescription>Smooth opacity transition</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square w-full rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
                    <div 
                      className={cn(
                        "transition-opacity duration-1000",
                        animationStates.fadeIn ? "opacity-100" : "opacity-0"
                      )}
                    >
                      <PlaceholderImage size="lg" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAnimation('fadeIn')}
                      className="flex-1"
                    >
                      {animationStates.fadeIn ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                      {animationStates.fadeIn ? 'Fade Out' : 'Fade In'}
                    </Button>
                  </div>
                  <code className="text-xs bg-muted p-2 rounded block">
                    transition-opacity duration-1000
                  </code>
                </CardContent>
              </Card>

              {/* Slide In Animation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Slide In</CardTitle>
                  <CardDescription>Transform translate animation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square w-full rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
                    <div 
                      className={cn(
                        "transition-transform duration-700 ease-out",
                        animationStates.slideIn ? "translate-x-0" : "translate-x-full"
                      )}
                    >
                      <PlaceholderImage size="lg" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAnimation('slideIn')}
                      className="flex-1"
                    >
                      {animationStates.slideIn ? <RotateCcw className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                      {animationStates.slideIn ? 'Reset' : 'Slide In'}
                    </Button>
                  </div>
                  <code className="text-xs bg-muted p-2 rounded block">
                    transition-transform duration-700 ease-out
                  </code>
                </CardContent>
              </Card>

              {/* Bounce Animation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bounce</CardTitle>
                  <CardDescription>Scale with bounce effect</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square w-full rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
                    <div 
                      className={cn(
                        "transition-transform duration-500",
                        animationStates.bounce ? "animate-bounce scale-110" : "scale-100"
                      )}
                    >
                      <PlaceholderImage size="lg" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAnimation('bounce')}
                      className="flex-1"
                    >
                      {animationStates.bounce ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                      {animationStates.bounce ? 'Stop' : 'Bounce'}
                    </Button>
                  </div>
                  <code className="text-xs bg-muted p-2 rounded block">
                    animate-bounce scale-110
                  </code>
                </CardContent>
              </Card>

              {/* Rotate Animation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rotate</CardTitle>
                  <CardDescription>360 degree rotation effect</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square w-full rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
                    <div 
                      className={cn(
                        "transition-transform duration-1000 ease-in-out",
                        animationStates.rotate ? "rotate-360" : "rotate-0"
                      )}
                    >
                      <PlaceholderImage size="lg" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAnimation('rotate')}
                      className="flex-1"
                    >
                      {animationStates.rotate ? <RotateCcw className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                      {animationStates.rotate ? 'Reset' : 'Rotate'}
                    </Button>
                  </div>
                  <code className="text-xs bg-muted p-2 rounded block">
                    transition-transform duration-1000 ease-in-out rotate-360
                  </code>
                </CardContent>
              </Card>

              {/* Pulse Animation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pulse</CardTitle>
                  <CardDescription>Rhythmic scale pulsing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square w-full rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
                    <div 
                      className={cn(
                        animationStates.pulse ? "animate-pulse" : ""
                      )}
                    >
                      <PlaceholderImage size="lg" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAnimation('pulse')}
                      className="flex-1"
                    >
                      {animationStates.pulse ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                      {animationStates.pulse ? 'Stop' : 'Pulse'}
                    </Button>
                  </div>
                  <code className="text-xs bg-muted p-2 rounded block">
                    animate-pulse
                  </code>
                </CardContent>
              </Card>

              {/* Scale Animation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scale</CardTitle>
                  <CardDescription>Smooth scale transformation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square w-full rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
                    <div 
                      className={cn(
                        "transition-transform duration-500 ease-out",
                        animationStates.scale ? "scale-125" : "scale-100"
                      )}
                    >
                      <PlaceholderImage size="lg" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAnimation('scale')}
                      className="flex-1"
                    >
                      {animationStates.scale ? <RotateCcw className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                      {animationStates.scale ? 'Reset' : 'Scale Up'}
                    </Button>
                  </div>
                  <code className="text-xs bg-muted p-2 rounded block">
                    transition-transform duration-500 ease-out scale-125
                  </code>
                </CardContent>
              </Card>
            </div>

            {/* Animation Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Goodable Animation Guidelines</CardTitle>
                <CardDescription>Animation principles for civic engagement platform experiences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-600">Do</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Use subtle, joyful animations that enhance user experience</li>
                      <li>• Keep durations between 200-700ms for optimal perception</li>
                      <li>• Use easing functions (ease-out, ease-in-out) for natural motion</li>
                      <li>• Provide reduced motion alternatives for accessibility</li>
                      <li>• Test performance on all devices to ensure inclusivity</li>
                      <li>• Create dopamine-driven micro-interactions</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600">Don't</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Overuse flashy or distracting animations</li>
                      <li>• Create animations longer than 1 second</li>
                      <li>• Use linear timing functions without purpose</li>
                      <li>• Animate too many elements simultaneously</li>
                      <li>• Ignore accessibility and motion sensitivity preferences</li>
                      <li>• Sacrifice performance for visual flair</li>
                    </ul>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Goodable Philosophy:</strong> Animations should make civic engagement feel approachable and delightful, 
                    encouraging users to participate in democracy through subtle, unexpected moments of joy.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Image Preview Dialog */}
        <ImagePreviewDialog
          image={previewImage}
          open={showPreview}
          onOpenChange={setShowPreview}
        />
      </div>
    </div>
  );
};

export default ImageSystem;