import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  X
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

// All images from public directory with tags
interface Asset {
  filename: string;
  tags: string[];
}

const publicAssets: Asset[] = [
  { filename: 'OAI LOGO.png', tags: ['logo'] },
  { filename: 'PPLX LOGO.png', tags: ['logo'] },
  { filename: 'alt-ai-small-button.png', tags: ['logo'] },
  { filename: 'claude-ai-icon-65aa.png', tags: ['logo'] },
  { filename: 'goodable pwa.jpg', tags: ['logo'] },
  { filename: 'goodable-text.jpg', tags: ['logo'] },
  { filename: 'gdble-beach.jpg', tags: ['blog-image'] },
  { filename: 'gdble-mtn-2.avif', tags: ['blog-image'] },
  { filename: 'gdble-mtn-3.jpg', tags: ['blog-image'] },
  { filename: 'goodable 15.avif', tags: ['blog-image'] },
  { filename: 'goodable 15.png', tags: ['blog-image'] },
  { filename: 'goodable 4.avif', tags: ['blog-image'] },
  { filename: 'goodable-botanical.avif', tags: ['blog-image'] },
  { filename: 'goodable-dandelion.avif', tags: ['blog-image'] },
  { filename: 'goodable-dream-state.avif', tags: ['blog-image'] },
  { filename: 'goodable-heart-pwa.png', tags: ['blog-image'] },
  { filename: 'goodable-heart.avif', tags: ['blog-image'] },
  { filename: 'goodable-mtn-1.avif', tags: ['blog-image'] },
  { filename: 'goodable-night.avif', tags: ['blog-image'] },
  { filename: 'goodable-path-2.avif', tags: ['blog-image'] },
  { filename: 'goodable-path.avif', tags: ['blog-image'] }
];

const allTags = ['logo', 'blog-image'];

const ImageSystem = () => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [animationStates, setAnimationStates] = useState({
    fadeIn: false,
    slideIn: false,
    bounce: false,
    rotate: false,
    pulse: false,
    scale: false
  });

  const filteredAssets = selectedTags.length === 0 
    ? publicAssets 
    : publicAssets.filter(asset => 
        selectedTags.some(tag => asset.tags.includes(tag))
      );

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
                v1.0
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
              Assets: {publicAssets.length}
            </div>
            <div>Last Updated: Today</div>
            <div>Components: 2</div>
          </div>
        </div>

        <Tabs defaultValue="display" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="display" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Display
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Assets
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
                  All visual assets for the Goodable platform ({publicAssets.length} items)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filter by tag:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Button
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleTag(tag)}
                        className="text-xs"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs text-muted-foreground"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear filters
                    </Button>
                  )}
                </div>

                {/* Assets Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredAssets.map((asset) => (
                    <Card key={asset.filename} className="p-4">
                      <div className="aspect-square w-full mb-4 rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
                        <img 
                          src={`/${encodeURIComponent(asset.filename)}`} 
                          alt={asset.filename}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) {
                              fallback.classList.remove('hidden');
                              fallback.classList.add('flex');
                            }
                          }}
                        />
                        <div className="hidden flex-col items-center justify-center text-muted-foreground">
                          <Image className="w-8 h-8 mb-2" />
                          <span className="text-xs">{asset.filename.split('.')[0]}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm truncate">{asset.filename}</h5>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {asset.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            /{encodeURIComponent(asset.filename)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(`/${encodeURIComponent(asset.filename)}`, asset.filename)}
                            className="p-1"
                          >
                            {copiedItem === asset.filename ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                {filteredAssets.length === 0 && selectedTags.length > 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No assets found</h3>
                    <p>No assets match the selected filters. Try clearing filters or selecting different tags.</p>
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
      </div>
    </div>
  );
};

export default ImageSystem;