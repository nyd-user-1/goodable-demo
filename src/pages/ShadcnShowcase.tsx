import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Toggle } from '@/components/ui/toggle';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  Settings,
  User,
  Mail,
  Bell,
  Search,
  Heart,
  Star,
  Plus,
  Download,
  Upload,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Menu,
  Home,
  FileText,
  MoreHorizontal,
  Eye,
  EyeOff,
  Copy,
  Share,
  ExternalLink,
  Filter,
  SortAsc
} from 'lucide-react';

const ShadcnShowcase = () => {
  const [progress, setProgress] = useState(33);
  const [sliderValue, setSliderValue] = useState([50]);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedRange, setSelectedRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  
  // Combobox states
  const [frameworkOpen, setFrameworkOpen] = useState(false);
  const [frameworkValue, setFrameworkValue] = useState("");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [languageValue, setLanguageValue] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusValue, setStatusValue] = useState("");
  
  const { toast } = useToast();

  const showToast = () => {
    toast({
      title: "Toast Example",
      description: "This is a sample toast notification!",
    });
  };

  // Combobox data
  const frameworks = [
    { value: "next.js", label: "Next.js" },
    { value: "sveltekit", label: "SvelteKit" },
    { value: "nuxt.js", label: "Nuxt.js" },
    { value: "remix", label: "Remix" },
    { value: "astro", label: "Astro" },
    { value: "vite", label: "Vite" },
    { value: "react", label: "React" },
    { value: "vue", label: "Vue.js" },
  ];

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "php", label: "PHP" },
  ];

  const statuses = [
    { value: "backlog", label: "Backlog" },
    { value: "todo", label: "Todo" },
    { value: "in-progress", label: "In Progress" },
    { value: "done", label: "Done" },
    { value: "canceled", label: "Canceled" },
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">shadcn/ui Component Showcase</h1>
            <p className="text-muted-foreground text-lg">
              Complete collection of all shadcn/ui components integrated into Goodable
            </p>
          </div>

          {/* Form Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Form Controls</CardTitle>
              <CardDescription>Input fields, buttons, and form elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Buttons */}
              <div className="space-y-3">
                <h4 className="font-semibold">Buttons</h4>
                <div className="flex flex-wrap gap-2">
                  <Button>Default</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button size="sm">Small</Button>
                  <Button size="lg">Large</Button>
                  <Button disabled>Disabled</Button>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    With Icon
                  </Button>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-3">
                <h4 className="font-semibold">Input Fields</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input placeholder="Email address" type="email" />
                  <Input placeholder="Password" type="password" />
                  <Textarea placeholder="Write your message here..." />
                  <div className="space-y-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Option 1</SelectItem>
                        <SelectItem value="option2">Option 2</SelectItem>
                        <SelectItem value="option3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Switches and Checkboxes */}
              <div className="space-y-3">
                <h4 className="font-semibold">Toggles & Selections</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={switchChecked} 
                      onCheckedChange={setSwitchChecked} 
                      id="airplane-mode" 
                    />
                    <label htmlFor="airplane-mode">Airplane Mode</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={checkboxChecked}
                      onCheckedChange={setCheckboxChecked}
                      id="terms"
                    />
                    <label htmlFor="terms">Accept terms and conditions</label>
                  </div>

                  <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option1" id="r1" />
                      <label htmlFor="r1">Option 1</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option2" id="r2" />
                      <label htmlFor="r2">Option 2</label>
                    </div>
                  </RadioGroup>

                  <Toggle aria-label="Toggle italic">
                    <Star className="h-4 w-4" />
                  </Toggle>
                </div>
              </div>

              {/* Sliders and Progress */}
              <div className="space-y-3">
                <h4 className="font-semibold">Progress & Sliders</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label>Progress: {progress}%</label>
                    <Progress value={progress} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>-10</Button>
                      <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>+10</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label>Slider: {sliderValue[0]}</label>
                    <Slider
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Components */}
          <Card>
            <CardHeader>
              <CardTitle>Display Components</CardTitle>
              <CardDescription>Badges, avatars, and visual elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Badges */}
              <div className="space-y-3">
                <h4 className="font-semibold">Badges</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </div>

              {/* Avatars */}
              <div className="space-y-3">
                <h4 className="font-semibold">Avatars</h4>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">SM</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Skeletons */}
              <div className="space-y-3">
                <h4 className="font-semibold">Loading Skeletons</h4>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation & Layout */}
          <Card>
            <CardHeader>
              <CardTitle>Navigation & Layout</CardTitle>
              <CardDescription>Tabs, accordions, and organizational components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tabs */}
              <div className="space-y-3">
                <h4 className="font-semibold">Tabs</h4>
                <Tabs defaultValue="account" className="w-full">
                  <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  <TabsContent value="account">
                    <p className="text-sm text-muted-foreground">Account management content goes here.</p>
                  </TabsContent>
                  <TabsContent value="password">
                    <p className="text-sm text-muted-foreground">Password settings content goes here.</p>
                  </TabsContent>
                  <TabsContent value="settings">
                    <p className="text-sm text-muted-foreground">General settings content goes here.</p>
                  </TabsContent>
                </Tabs>
              </div>

              <Separator />

              {/* Accordion */}
              <div className="space-y-3">
                <h4 className="font-semibold">Accordion</h4>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Is it accessible?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It adheres to the WAI-ARIA design pattern.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Is it styled?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It comes with default styles that matches the other components aesthetic.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Is it animated?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It's animated by default, but you can disable it if you prefer.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <Separator />

              {/* Collapsible */}
              <div className="space-y-3">
                <h4 className="font-semibold">Collapsible</h4>
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    Toggle collapsible content
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 p-4 border rounded">
                    This content can be collapsed and expanded.
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CardContent>
          </Card>

          {/* Overlays & Dialogs */}
          <Card>
            <CardHeader>
              <CardTitle>Overlays & Dialogs</CardTitle>
              <CardDescription>Modals, sheets, popovers, and overlays</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-4">
                {/* Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dialog Example</DialogTitle>
                      <DialogDescription>
                        This is a sample dialog with content.
                      </DialogDescription>
                    </DialogHeader>
                    <p>Dialog content goes here.</p>
                  </DialogContent>
                </Dialog>

                {/* Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">Open Sheet</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Sheet Example</SheetTitle>
                      <SheetDescription>
                        This is a sample sheet sidebar.
                      </SheetDescription>
                    </SheetHeader>
                    <p className="mt-4">Sheet content goes here.</p>
                  </SheetContent>
                </Sheet>

                {/* Drawer */}
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline">Open Drawer</Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Drawer Example</DrawerTitle>
                      <DrawerDescription>This is a sample drawer.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4">
                      <p>Drawer content goes here.</p>
                    </div>
                  </DrawerContent>
                </Drawer>

                {/* Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Open Popover</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <p className="text-sm">This is a popover with some content.</p>
                  </PopoverContent>
                </Popover>

                {/* Tooltip */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Hover for Tooltip</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This is a helpful tooltip!</p>
                  </TooltipContent>
                </Tooltip>

                {/* Alert Dialog */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">Open Alert</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Dropdown <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Toast Trigger */}
                <Button onClick={showToast} variant="outline">
                  Show Toast
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
              <CardDescription>Different alert styles and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Default Alert</AlertTitle>
                <AlertDescription>
                  This is a default alert with some important information.
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Alert</AlertTitle>
                <AlertDescription>
                  Something went wrong. Please try again.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Data Display */}
          <Card>
            <CardHeader>
              <CardTitle>Data Display</CardTitle>
              <CardDescription>Tables and data presentation components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Table */}
              <div className="space-y-3">
                <h4 className="font-semibold">Table</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">John Doe</TableCell>
                      <TableCell><Badge variant="secondary">Active</Badge></TableCell>
                      <TableCell>Admin</TableCell>
                      <TableCell className="text-right">$250.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Jane Smith</TableCell>
                      <TableCell><Badge>Online</Badge></TableCell>
                      <TableCell>User</TableCell>
                      <TableCell className="text-right">$150.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <Separator />

              {/* Command */}
              <div className="space-y-3">
                <h4 className="font-semibold">Command Palette</h4>
                <Command className="rounded-lg border shadow-md max-w-md">
                  <CommandInput placeholder="Type a command or search..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                      <CommandItem>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>Calendar</span>
                      </CommandItem>
                      <CommandItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </CommandItem>
                      <CommandItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>

              <Separator />

              {/* Scroll Area */}
              <div className="space-y-3">
                <h4 className="font-semibold">Scroll Area</h4>
                <ScrollArea className="h-32 w-full rounded border p-4">
                  <div className="space-y-2">
                    {Array.from({ length: 20 }, (_, i) => (
                      <div key={i} className="text-sm">
                        Item {i + 1} - This is scrollable content
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

          {/* Calendar Components */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar & Date Picker</CardTitle>
              <CardDescription>Date selection and calendar components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Single Date Calendar */}
              <div className="space-y-3">
                <h4 className="font-semibold">Single Date Selection</h4>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-lg border w-fit"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium">Selected Date:</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate ? selectedDate.toLocaleDateString() : "No date selected"}
                    </p>
                    <div className="space-y-2">
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedDate(new Date())}
                        variant="outline"
                      >
                        Select Today
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedDate(undefined)}
                        variant="outline"
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Range Calendar */}
              <div className="space-y-3">
                <h4 className="font-semibold">Date Range Selection</h4>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <Calendar
                      mode="range"
                      selected={selectedRange}
                      onSelect={setSelectedRange}
                      className="rounded-lg border w-fit"
                      numberOfMonths={2}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium">Selected Range:</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>From: {selectedRange?.from ? selectedRange.from.toLocaleDateString() : "Not selected"}</p>
                      <p>To: {selectedRange?.to ? selectedRange.to.toLocaleDateString() : "Not selected"}</p>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          const today = new Date();
                          const nextWeek = new Date(today);
                          nextWeek.setDate(today.getDate() + 7);
                          setSelectedRange({ from: today, to: nextWeek });
                        }}
                        variant="outline"
                      >
                        Select This Week
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedRange({ from: undefined, to: undefined })}
                        variant="outline"
                      >
                        Clear Range
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Multiple Calendars */}
              <div className="space-y-3">
                <h4 className="font-semibold">Multiple Month View</h4>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-lg border w-fit"
                  numberOfMonths={3}
                />
              </div>

              <Separator />

              {/* Calendar with Disabled Dates */}
              <div className="space-y-3">
                <h4 className="font-semibold">Calendar with Disabled Dates</h4>
                <div className="flex flex-col lg:flex-row gap-6">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-lg border w-fit"
                    disabled={(date) => {
                      // Disable weekends
                      return date.getDay() === 0 || date.getDay() === 6;
                    }}
                  />
                  <div className="flex-1">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Features:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Weekends are disabled</li>
                        <li>• Only weekdays can be selected</li>
                        <li>• Great for business date picking</li>
                        <li>• Fully customizable disabled logic</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Calendar Usage Examples */}
              <div className="space-y-3">
                <h4 className="font-semibold">Implementation Examples</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm space-y-2">
                    <p className="font-medium">Basic Usage:</p>
                    <code className="block bg-background p-2 rounded text-xs">
{`import { Calendar } from "@/components/ui/calendar"

const [date, setDate] = React.useState<Date | undefined>(new Date())

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-lg border"
/>`}
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Combobox Components */}
          <Card>
            <CardHeader>
              <CardTitle>Combobox & Autocomplete</CardTitle>
              <CardDescription>Searchable dropdown components with filtering</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Combobox */}
              <div className="space-y-3">
                <h4 className="font-semibold">Framework Selector</h4>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <Popover open={frameworkOpen} onOpenChange={setFrameworkOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={frameworkOpen}
                          className="w-[280px] justify-between"
                        >
                          {frameworkValue
                            ? frameworks.find((framework) => framework.value === frameworkValue)?.label
                            : "Select framework..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0">
                        <Command>
                          <CommandInput placeholder="Search framework..." />
                          <CommandList>
                            <CommandEmpty>No framework found.</CommandEmpty>
                            <CommandGroup>
                              {frameworks.map((framework) => (
                                <CommandItem
                                  key={framework.value}
                                  value={framework.value}
                                  onSelect={(currentValue) => {
                                    setFrameworkValue(currentValue === frameworkValue ? "" : currentValue);
                                    setFrameworkOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      frameworkValue === framework.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {framework.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium">Selected Framework:</p>
                    <p className="text-sm text-muted-foreground">
                      {frameworkValue 
                        ? frameworks.find(f => f.value === frameworkValue)?.label 
                        : "No framework selected"}
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => setFrameworkValue("")}
                      variant="outline"
                      disabled={!frameworkValue}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Language Selector */}
              <div className="space-y-3">
                <h4 className="font-semibold">Programming Language</h4>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <Popover open={languageOpen} onOpenChange={setLanguageOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={languageOpen}
                          className="w-[280px] justify-between"
                        >
                          {languageValue
                            ? languages.find((language) => language.value === languageValue)?.label
                            : "Select language..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0">
                        <Command>
                          <CommandInput placeholder="Search language..." />
                          <CommandList>
                            <CommandEmpty>No language found.</CommandEmpty>
                            <CommandGroup>
                              {languages.map((language) => (
                                <CommandItem
                                  key={language.value}
                                  value={language.value}
                                  onSelect={(currentValue) => {
                                    setLanguageValue(currentValue === languageValue ? "" : currentValue);
                                    setLanguageOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      languageValue === language.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {language.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium">Selected Language:</p>
                    <p className="text-sm text-muted-foreground">
                      {languageValue 
                        ? languages.find(l => l.value === languageValue)?.label 
                        : "No language selected"}
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => setLanguageValue("")}
                      variant="outline"
                      disabled={!languageValue}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Status Combobox with Colors */}
              <div className="space-y-3">
                <h4 className="font-semibold">Status Selector</h4>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={statusOpen}
                          className="w-[280px] justify-between"
                        >
                          {statusValue ? (
                            <div className="flex items-center">
                              <div className={cn(
                                "w-2 h-2 rounded-full mr-2",
                                statusValue === "backlog" && "bg-gray-500",
                                statusValue === "todo" && "bg-blue-500",
                                statusValue === "in-progress" && "bg-yellow-500",
                                statusValue === "done" && "bg-green-500",
                                statusValue === "canceled" && "bg-red-500"
                              )} />
                              {statuses.find((status) => status.value === statusValue)?.label}
                            </div>
                          ) : (
                            "Select status..."
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0">
                        <Command>
                          <CommandInput placeholder="Search status..." />
                          <CommandList>
                            <CommandEmpty>No status found.</CommandEmpty>
                            <CommandGroup>
                              {statuses.map((status) => (
                                <CommandItem
                                  key={status.value}
                                  value={status.value}
                                  onSelect={(currentValue) => {
                                    setStatusValue(currentValue === statusValue ? "" : currentValue);
                                    setStatusOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      statusValue === status.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className={cn(
                                    "w-2 h-2 rounded-full mr-2",
                                    status.value === "backlog" && "bg-gray-500",
                                    status.value === "todo" && "bg-blue-500",
                                    status.value === "in-progress" && "bg-yellow-500",
                                    status.value === "done" && "bg-green-500",
                                    status.value === "canceled" && "bg-red-500"
                                  )} />
                                  {status.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium">Selected Status:</p>
                    <div className="flex items-center gap-2">
                      {statusValue && (
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          statusValue === "backlog" && "bg-gray-500",
                          statusValue === "todo" && "bg-blue-500",
                          statusValue === "in-progress" && "bg-yellow-500",
                          statusValue === "done" && "bg-green-500",
                          statusValue === "canceled" && "bg-red-500"
                        )} />
                      )}
                      <p className="text-sm text-muted-foreground">
                        {statusValue 
                          ? statuses.find(s => s.value === statusValue)?.label 
                          : "No status selected"}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setStatusValue("")}
                      variant="outline"
                      disabled={!statusValue}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Multiple Comboboxes in Form */}
              <div className="space-y-3">
                <h4 className="font-semibold">Form with Multiple Comboboxes</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Framework</label>
                    <Popover open={frameworkOpen} onOpenChange={setFrameworkOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={frameworkOpen}
                          className="w-full justify-between"
                        >
                          {frameworkValue
                            ? frameworks.find((framework) => framework.value === frameworkValue)?.label
                            : "Select..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search..." />
                          <CommandList>
                            <CommandEmpty>No option found.</CommandEmpty>
                            <CommandGroup>
                              {frameworks.map((framework) => (
                                <CommandItem
                                  key={framework.value}
                                  value={framework.value}
                                  onSelect={(currentValue) => {
                                    setFrameworkValue(currentValue === frameworkValue ? "" : currentValue);
                                    setFrameworkOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      frameworkValue === framework.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {framework.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Language</label>
                    <Popover open={languageOpen} onOpenChange={setLanguageOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={languageOpen}
                          className="w-full justify-between"
                        >
                          {languageValue
                            ? languages.find((language) => language.value === languageValue)?.label
                            : "Select..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search..." />
                          <CommandList>
                            <CommandEmpty>No option found.</CommandEmpty>
                            <CommandGroup>
                              {languages.map((language) => (
                                <CommandItem
                                  key={language.value}
                                  value={language.value}
                                  onSelect={(currentValue) => {
                                    setLanguageValue(currentValue === languageValue ? "" : currentValue);
                                    setLanguageOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      languageValue === language.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {language.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={statusOpen}
                          className="w-full justify-between"
                        >
                          {statusValue
                            ? statuses.find((status) => status.value === statusValue)?.label
                            : "Select..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search..." />
                          <CommandList>
                            <CommandEmpty>No option found.</CommandEmpty>
                            <CommandGroup>
                              {statuses.map((status) => (
                                <CommandItem
                                  key={status.value}
                                  value={status.value}
                                  onSelect={(currentValue) => {
                                    setStatusValue(currentValue === statusValue ? "" : currentValue);
                                    setStatusOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      statusValue === status.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {status.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    toast({
                      title: "Form Submitted!",
                      description: `Framework: ${frameworkValue || "None"}, Language: ${languageValue || "None"}, Status: ${statusValue || "None"}`,
                    });
                  }}
                  className="w-full md:w-auto"
                >
                  Submit Form
                </Button>
              </div>

              <Separator />

              {/* Implementation Examples */}
              <div className="space-y-3">
                <h4 className="font-semibold">Implementation Examples</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm space-y-2">
                    <p className="font-medium">Basic Combobox Usage:</p>
                    <code className="block bg-background p-2 rounded text-xs">
{`import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"

const [open, setOpen] = React.useState(false)
const [value, setValue] = React.useState("")

<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild>
    <Button variant="outline" role="combobox" aria-expanded={open}>
      {value ? options.find(opt => opt.value === value)?.label : "Select..."}
      <ChevronsUpDown className="ml-2 h-4 w-4" />
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Command>
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No option found.</CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <CommandItem key={option.value} value={option.value}>
              <Check className={value === option.value ? "opacity-100" : "opacity-0"} />
              {option.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>`}
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold">All shadcn/ui Components Loaded!</h3>
                <p className="text-sm text-muted-foreground">
                  This showcase demonstrates the complete shadcn/ui component library integrated into Goodable.
                  All components are now available throughout the application.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ShadcnShowcase;