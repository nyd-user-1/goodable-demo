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
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAsset } from '@/hooks/useAssets';

// Site-wide Placeholder Image Component (moved from StyleGuide)
const PlaceholderImage: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'rounded' | 'circle';
}> = ({ className = '', size = 'md', variant = 'default' }) => {
  const { asset: placeholderAsset } = useAsset('goodable-heart-terrarium');
  
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
  
  const placeholderUrl = placeholderAsset?.url || '/goodable-night.avif';
  
  return (
    <div className={cn(
      sizeClasses[size],
      variantClasses[variant],
      'bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20',
      'border border-border overflow-hidden flex items-center justify-center',
      'transition-all duration-300 hover:scale-105 hover:shadow-lg',
      className
    )}>
      {placeholderAsset ? (
        <img 
          src={placeholderUrl} 
          alt="Goodable heart terrarium - site placeholder" 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <Heart className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Goodable</span>
        </div>
      )}
    </div>
  );
};

// All images from public directory
const publicAssets = [
  'goodable-night.avif',
  'goodable-day.avif',
  'goodable-heart-terrarium.png',
  'goodable-loading.gif',
  'ai-content-disclaimer.png',
  'bills-pdf-icon.svg',
  'goodable-bills-pdf-icon.svg',
  'goodable-calendar-icon.svg',
  'goodable-chart-icon.svg',
  'goodable-clock-icon.svg',
  'goodable-file-icon.svg',
  'goodable-folder-icon.svg',
  'goodable-heart-icon.svg',
  'goodable-home-icon.svg',
  'goodable-key-icon.svg',
  'goodable-lightning-icon.svg',
  'goodable-map-icon.svg',
  'goodable-message-icon.svg',
  'goodable-phone-icon.svg',
  'goodable-plus-icon.svg',
  'goodable-question-icon.svg',
  'goodable-search-icon.svg',
  'goodable-settings-icon.svg',
  'goodable-star-icon.svg',
  'goodable-user-icon.svg',
  'goodable-window-icon.svg'
];

const ImageSystem = () => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [animationStates, setAnimationStates] = useState({
    fadeIn: false,
    slideIn: false,
    bounce: false
  });

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
              <h1 className="text-4xl font-bold mb-2">Image System</h1>
              <p className="text-muted-foreground text-lg">
                Visual assets, components, and animations for Goodable
              </p>
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
            <div>Components: 1</div>
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
                  Reusable image component with multiple size and variant options
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
                <CardTitle>Public Directory Assets</CardTitle>
                <CardDescription>
                  All images available in the public directory ({publicAssets.length} items)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {publicAssets.map((asset) => (
                    <Card key={asset} className="p-4">
                      <div className="aspect-square w-full mb-4 rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
                        <img 
                          src={`/${asset}`} 
                          alt={asset}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling!.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden flex-col items-center justify-center text-muted-foreground">
                          <Image className="w-8 h-8 mb-2" />
                          <span className="text-xs">Asset</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm truncate">{asset}</h5>
                        <div className="flex items-center justify-between">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            /{asset}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(`/${asset}`, asset)}
                            className="p-1"
                          >
                            {copiedItem === asset ? (
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Animation Tab */}
          <TabsContent value="animation" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
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
            </div>

            {/* Animation Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Animation Guidelines</CardTitle>
                <CardDescription>Best practices for Goodable animations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-600">Do</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Use subtle, purposeful animations</li>
                      <li>• Keep durations between 200-700ms</li>
                      <li>• Use easing functions (ease-out, ease-in-out)</li>
                      <li>• Provide reduced motion alternatives</li>
                      <li>• Test performance on lower-end devices</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600">Don't</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Overuse flashy or distracting animations</li>
                      <li>• Create animations longer than 1 second</li>
                      <li>• Use linear timing functions</li>
                      <li>• Animate too many elements simultaneously</li>
                      <li>• Ignore accessibility preferences</li>
                    </ul>
                  </div>
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