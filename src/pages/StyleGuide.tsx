import React, { useState } from 'react';
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
import { 
  Palette, 
  Type, 
  Layout, 
  Layers, 
  Zap, 
  Sun, 
  Moon,
  Copy,
  Check,
  Download,
  Code,
  Sparkles,
  Image,
  Heart
} from 'lucide-react';
// import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useAsset } from '@/hooks/useAssets';

// Site-wide Placeholder Image Component
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
  
  const placeholderUrl = placeholderAsset?.url || '/goodable%2015.avif';
  
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

const StyleGuide = () => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  
  // Simple theme detection based on document class
  const getCurrentTheme = () => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  };
  
  const [currentTheme] = useState(getCurrentTheme());

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(id);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  // Design Tokens
  const colors = {
    primary: {
      name: 'Primary Blue',
      value: '#3D63DD',
      variable: '--primary',
      usage: 'Main brand color, CTAs, links'
    },
    secondary: {
      name: 'Secondary Blue',
      value: '#5A7FDB',
      variable: '--secondary',
      usage: 'Secondary actions, accents'
    },
    accent: {
      name: 'Accent Gray',
      value: '#8B8D98',
      variable: '--accent',
      usage: 'Muted text, borders'
    },
    destructive: {
      name: 'Destructive Red',
      value: '#ef4444',
      variable: '--destructive',
      usage: 'Error states, delete actions'
    },
    success: {
      name: 'Success Green',
      value: '#22c55e',
      variable: '--success',
      usage: 'Success states, confirmations'
    },
    warning: {
      name: 'Warning Orange',
      value: '#f59e0b',
      variable: '--warning',
      usage: 'Warning states, alerts'
    }
  };

  const typography = {
    display: {
      name: 'Display',
      sizes: ['text-6xl', 'text-5xl', 'text-4xl'],
      usage: 'Hero headings, major titles'
    },
    heading: {
      name: 'Heading',
      sizes: ['text-3xl', 'text-2xl', 'text-xl', 'text-lg'],
      usage: 'Section headings, card titles'
    },
    body: {
      name: 'Body',
      sizes: ['text-base', 'text-sm', 'text-xs'],
      usage: 'Body text, descriptions'
    }
  };

  const spacing = {
    xs: { name: '0.25rem', value: '1', class: 'p-1' },
    sm: { name: '0.5rem', value: '2', class: 'p-2' },
    md: { name: '1rem', value: '4', class: 'p-4' },
    lg: { name: '1.5rem', value: '6', class: 'p-6' },
    xl: { name: '2rem', value: '8', class: 'p-8' },
    '2xl': { name: '3rem', value: '12', class: 'p-12' }
  };

  const shadows = [
    { name: 'Small', class: 'shadow-sm', usage: 'Cards, buttons' },
    { name: 'Medium', class: 'shadow-md', usage: 'Elevated elements' },
    { name: 'Large', class: 'shadow-lg', usage: 'Modals, popovers' },
    { name: 'Extra Large', class: 'shadow-xl', usage: 'Major overlays' }
  ];

  const borderRadius = [
    { name: 'Small', class: 'rounded-sm', usage: 'Badges, small elements' },
    { name: 'Medium', class: 'rounded-md', usage: 'Buttons, inputs' },
    { name: 'Large', class: 'rounded-lg', usage: 'Cards, containers' },
    { name: 'Extra Large', class: 'rounded-xl', usage: 'Major sections' }
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Design System</h1>
              <p className="text-muted-foreground text-lg">
                Living style guide and component library for Goodable
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                v2.0
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Tokens
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Current Mode: {currentTheme === 'dark' ? 'Dark' : 'Light'}
            </div>
            <div>Last Updated: Today</div>
            <div>Components: 24</div>
          </div>
        </div>

        <Tabs defaultValue="colors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="spacing" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Spacing
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Components
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Images
            </TabsTrigger>
            <TabsTrigger value="effects" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Effects
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Usage
            </TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Palette</CardTitle>
                <CardDescription>
                  Core brand colors with their usage guidelines and CSS variables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(colors).map(([key, color]) => (
                    <Card key={key} className="p-4">
                      <div 
                        className="w-full h-20 rounded-lg mb-4 border"
                        style={{ backgroundColor: color.value }}
                      />
                      <div className="space-y-2">
                        <h4 className="font-semibold">{color.name}</h4>
                        <div className="flex items-center justify-between">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {color.value}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(color.value, key)}
                            className="p-1"
                          >
                            {copiedColor === key ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">{color.usage}</p>
                        <code className="text-xs text-muted-foreground">{color.variable}</code>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Theme Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Light vs Dark Mode</CardTitle>
                <CardDescription>
                  Color behavior across different themes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Light Mode Preview */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Light Mode
                    </h4>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="h-4 bg-gray-900 rounded" />
                      <div className="h-3 bg-gray-600 rounded w-3/4" />
                      <div className="flex gap-2">
                        <div className="h-8 bg-blue-600 rounded px-3 flex items-center">
                          <span className="text-white text-xs">Primary</span>
                        </div>
                        <div className="h-8 bg-gray-100 border rounded px-3 flex items-center">
                          <span className="text-gray-900 text-xs">Secondary</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dark Mode Preview */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Dark Mode
                    </h4>
                    <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 space-y-3">
                      <div className="h-4 bg-white rounded" />
                      <div className="h-3 bg-gray-400 rounded w-3/4" />
                      <div className="flex gap-2">
                        <div className="h-8 bg-blue-600 rounded px-3 flex items-center">
                          <span className="text-white text-xs">Primary</span>
                        </div>
                        <div className="h-8 bg-gray-800 border border-gray-700 rounded px-3 flex items-center">
                          <span className="text-gray-100 text-xs">Secondary</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Typography Scale</CardTitle>
                <CardDescription>
                  Consistent text sizing and hierarchy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {Object.entries(typography).map(([key, type]) => (
                  <div key={key} className="space-y-4">
                    <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      {type.name}
                    </h4>
                    <div className="space-y-4">
                      {type.sizes.map((size) => (
                        <div key={size} className="flex items-center gap-4">
                          <code className="text-xs bg-muted px-2 py-1 rounded min-w-[80px]">
                            {size}
                          </code>
                          <div className={cn(size, "font-semibold")}>
                            The quick brown fox jumps over the lazy dog
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{type.usage}</p>
                    <Separator />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Spacing Tab */}
          <TabsContent value="spacing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Spacing System</CardTitle>
                <CardDescription>
                  Consistent spacing using a 4px base unit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(spacing).map(([key, space]) => (
                    <div key={key} className="flex items-center gap-4">
                      <div className="min-w-[100px]">
                        <code className="text-sm">{key}</code>
                        <div className="text-xs text-muted-foreground">{space.name}</div>
                      </div>
                      <div className="flex-1 flex items-center gap-4">
                        <div 
                          className="bg-primary h-4"
                          style={{ width: `${parseInt(space.value) * 4}px` }}
                        />
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {space.class}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle>Buttons</CardTitle>
                  <CardDescription>All button variants and states</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Small</Button>
                    <Button>Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button disabled>Disabled</Button>
                    <Button disabled className="opacity-75">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Loading
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Form Elements */}
              <Card>
                <CardHeader>
                  <CardTitle>Form Elements</CardTitle>
                  <CardDescription>Input fields and form controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Input field" />
                  <Textarea placeholder="Textarea field" />
                  <div className="flex items-center space-x-2">
                    <Switch id="example-switch" />
                    <label htmlFor="example-switch">Switch</label>
                  </div>
                </CardContent>
              </Card>

              {/* Badges */}
              <Card>
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                  <CardDescription>Status indicators and labels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Progress</CardTitle>
                  <CardDescription>Progress indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={33} />
                  <Progress value={66} />
                  <Progress value={100} />
                </CardContent>
              </Card>

              {/* Avatars */}
              <Card>
                <CardHeader>
                  <CardTitle>Avatars</CardTitle>
                  <CardDescription>User profile images</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>MD</AvatarFallback>
                    </Avatar>
                    <Avatar className="w-16 h-16">
                      <AvatarFallback>LG</AvatarFallback>
                    </Avatar>
                  </div>
                </CardContent>
              </Card>

              {/* Cards */}
              <Card>
                <CardHeader>
                  <CardTitle>Cards</CardTitle>
                  <CardDescription>Content containers</CardDescription>
                </CardHeader>
                <CardContent>
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Example Card</h4>
                    <p className="text-sm text-muted-foreground">
                      This is an example of a nested card component with content.
                    </p>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Placeholder Images</CardTitle>
                <CardDescription>
                  Site-wide placeholder image component with consistent styling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Default Placeholder</h4>
                  <div className="flex items-center gap-6">
                    <PlaceholderImage />
                    <div className="space-y-2 text-sm">
                      <p><strong>Usage:</strong> Standard placeholder for content areas</p>
                      <p><strong>Size:</strong> Medium (128x128px)</p>
                      <p><strong>Variant:</strong> Default (rounded-lg)</p>
                      <code className="block bg-muted p-2 rounded text-xs">
                        {'<PlaceholderImage />'}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Size Variants</h4>
                  <div className="flex items-end gap-4">
                    <div className="text-center space-y-2">
                      <PlaceholderImage size="sm" />
                      <p className="text-xs text-muted-foreground">Small (64x64px)</p>
                      <code className="text-xs bg-muted px-1 rounded">size="sm"</code>
                    </div>
                    <div className="text-center space-y-2">
                      <PlaceholderImage size="md" />
                      <p className="text-xs text-muted-foreground">Medium (128x128px)</p>
                      <code className="text-xs bg-muted px-1 rounded">size="md"</code>
                    </div>
                    <div className="text-center space-y-2">
                      <PlaceholderImage size="lg" />
                      <p className="text-xs text-muted-foreground">Large (192x192px)</p>
                      <code className="text-xs bg-muted px-1 rounded">size="lg"</code>
                    </div>
                    <div className="text-center space-y-2">
                      <PlaceholderImage size="xl" />
                      <p className="text-xs text-muted-foreground">Extra Large (256x256px)</p>
                      <code className="text-xs bg-muted px-1 rounded">size="xl"</code>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Style Variants</h4>
                  <div className="flex items-center gap-6">
                    <div className="text-center space-y-2">
                      <PlaceholderImage variant="default" />
                      <p className="text-xs text-muted-foreground">Default</p>
                      <code className="text-xs bg-muted px-1 rounded">variant="default"</code>
                    </div>
                    <div className="text-center space-y-2">
                      <PlaceholderImage variant="rounded" />
                      <p className="text-xs text-muted-foreground">Rounded</p>
                      <code className="text-xs bg-muted px-1 rounded">variant="rounded"</code>
                    </div>
                    <div className="text-center space-y-2">
                      <PlaceholderImage variant="circle" />
                      <p className="text-xs text-muted-foreground">Circle</p>
                      <code className="text-xs bg-muted px-1 rounded">variant="circle"</code>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Implementation</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm">
{`import { PlaceholderImage } from '@/components/ui/placeholder-image';

// Basic usage
<PlaceholderImage />

// With size and variant
<PlaceholderImage 
  size="lg" 
  variant="circle" 
  className="custom-styles" 
/>

// All props
<PlaceholderImage 
  size="sm" | "md" | "lg" | "xl"
  variant="default" | "rounded" | "circle"
  className="additional-classes"
/>`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Features</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Automatically loads heart terrarium image from assets system</li>
                    <li>Graceful fallback to branded placeholder when image unavailable</li>
                    <li>Responsive design with hover effects</li>
                    <li>Dark mode support with appropriate gradients</li>
                    <li>Consistent sizing and styling across all variants</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Effects Tab */}
          <TabsContent value="effects" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Shadows */}
              <Card>
                <CardHeader>
                  <CardTitle>Shadows</CardTitle>
                  <CardDescription>Elevation and depth</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {shadows.map((shadow) => (
                    <div key={shadow.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{shadow.name}</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {shadow.class}
                        </code>
                      </div>
                      <div className={cn("w-full h-16 bg-card rounded-lg", shadow.class)} />
                      <p className="text-xs text-muted-foreground">{shadow.usage}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Border Radius */}
              <Card>
                <CardHeader>
                  <CardTitle>Border Radius</CardTitle>
                  <CardDescription>Rounded corners</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {borderRadius.map((radius) => (
                    <div key={radius.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{radius.name}</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {radius.class}
                        </code>
                      </div>
                      <div className={cn("w-full h-16 bg-primary", radius.class)} />
                      <p className="text-xs text-muted-foreground">{radius.usage}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Guide</CardTitle>
                <CardDescription>
                  How to use this design system in your components
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">CSS Variables</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm">
{`:root {
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
}`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Tailwind Classes</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm">
{`// Primary button
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Click me
</Button>

// Card with proper spacing
<Card className="p-6 space-y-4 shadow-md rounded-lg">
  <CardHeader>...</CardHeader>
</Card>`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Component Usage</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm">
{`import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Use semantic variants
<Button variant="primary">Main Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Tertiary Action</Button>`}
                    </pre>
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

export default StyleGuide;