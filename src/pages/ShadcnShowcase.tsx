import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut, CommandDialog } from '@/components/ui/command';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from '@/components/ui/menubar';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Toggle } from '@/components/ui/toggle';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Calendar } from '@/components/ui/calendar';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { 
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  ArrowUpDown,
  MoreHorizontal,
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
  SortAsc,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Calculator,
  Calendar as CalendarLucide,
  Smile,
  Command as CommandIcon,
  Code,
  Github,
  Twitter,
  Zap,
  BookOpen,
  Users,
  Settings2,
  HelpCircle,
  LogOut,
  CreditCard,
  Keyboard,
  UserPlus,
  PlusCircle,
  LifeBuoy,
  Cloud,
  Building,
  Scale,
  BarChart,
  Clock
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
  
  // Data Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  
  // New component states
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [toggleGroupValue, setToggleGroupValue] = useState("center");
  const [toggleGroupMultiple, setToggleGroupMultiple] = useState<string[]>(["bold"]);
  const [togglePressed, setTogglePressed] = useState(false);
  
  const { toast } = useToast();

  const showToast = () => {
    toast({
      title: "Toast Example",
      description: "This is a sample toast notification!",
    });
  };

  // Command dialog keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandDialogOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

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

  // Sample data for Data Table
  type Payment = {
    id: string;
    amount: number;
    status: "pending" | "processing" | "success" | "failed";
    email: string;
    date: string;
  };

  const samplePayments: Payment[] = [
    { id: "728ed52f", amount: 100, status: "pending", email: "m@example.com", date: "2024-01-15" },
    { id: "489e1d42", amount: 125, status: "processing", email: "example@gmail.com", date: "2024-01-14" },
    { id: "147f2f6b", amount: 316, status: "success", email: "john@company.com", date: "2024-01-13" },
    { id: "3c5d8f9a", amount: 242, status: "success", email: "sarah@startup.io", date: "2024-01-12" },
    { id: "92b4c7e1", amount: 837, status: "processing", email: "dev@techcorp.com", date: "2024-01-11" },
    { id: "6f8a9c2d", amount: 462, status: "failed", email: "user@domain.org", date: "2024-01-10" },
    { id: "5e7b8a1c", amount: 193, status: "success", email: "client@business.net", date: "2024-01-09" },
    { id: "4d6a9b2e", amount: 751, status: "pending", email: "contact@agency.com", date: "2024-01-08" },
  ];

  // Column definitions for Data Table
  const paymentColumns: ColumnDef<Payment>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "Payment ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={
              status === "success" ? "default" :
              status === "processing" ? "secondary" :
              status === "pending" ? "outline" :
              "destructive"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(payment.id);
                  toast({
                    title: "Payment ID copied",
                    description: "Payment ID has been copied to clipboard.",
                  });
                }}
              >
                Copy payment ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => toast({
                  title: "View Customer",
                  description: `Viewing customer: ${payment.email}`,
                })}
              >
                View customer
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast({
                  title: "View Payment Details",
                  description: `Payment: ${payment.id} - ${payment.amount}`,
                })}
              >
                View payment details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Create table instance
  const table = useReactTable({
    data: samplePayments,
    columns: paymentColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

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

          {/* Component Index/Navigation */}
          <Card className="sticky top-4 z-10 bg-background/95 backdrop-blur border-2">
            <CardHeader>
              <CardTitle>Component Index</CardTitle>
              <CardDescription>Click any component below to jump to its section</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                <a href="#form-controls" className="text-primary hover:underline font-medium">Form Controls</a>
                <a href="#display-components" className="text-primary hover:underline font-medium">Display Components</a>
                <a href="#navigation-layout" className="text-primary hover:underline font-medium">Navigation & Layout</a>
                <a href="#overlays-dialogs" className="text-primary hover:underline font-medium">Overlays & Dialogs</a>
                <a href="#alerts-notifications" className="text-primary hover:underline font-medium">Alerts & Notifications</a>
                <a href="#data-display" className="text-primary hover:underline font-medium">Data Display</a>
                <a href="#calendar-date" className="text-primary hover:underline font-medium">Calendar & Date</a>
                <a href="#combobox-autocomplete" className="text-primary hover:underline font-medium">Combobox & Autocomplete</a>
                <a href="#data-table" className="text-primary hover:underline font-medium">Data Table</a>
                <a href="#hover-card" className="text-primary hover:underline font-medium">Hover Card</a>
                <a href="#menubar" className="text-primary hover:underline font-medium">Menubar</a>
                <a href="#navigation-menu" className="text-primary hover:underline font-medium">Navigation Menu</a>
                <a href="#slider" className="text-primary hover:underline font-medium">Slider</a>
                <a href="#toggle-group" className="text-primary hover:underline font-medium">Toggle Group</a>
                <a href="#command" className="text-primary hover:underline font-medium">Command</a>
              </div>
            </CardContent>
          </Card>

          {/* Form Controls */}
          <Card id="form-controls">
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
          <Card id="display-components">
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
          <Card id="navigation-layout">
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
          <Card id="overlays-dialogs">
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
          <Card id="alerts-notifications">
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
          <Card id="data-display">
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
          <Card id="calendar-date">
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
          <Card id="combobox-autocomplete">
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

          {/* Data Table Components */}
          <Card id="data-table">
            <CardHeader>
              <CardTitle>Data Table with TanStack Table</CardTitle>
              <CardDescription>Advanced data tables with sorting, filtering, pagination, and row selection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Table Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Filter emails..."
                    value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                      table.getColumn("email")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="ml-auto">
                        Columns <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {table
                        .getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => {
                          return (
                            <DropdownMenuItem
                              key={column.id}
                              className="capitalize"
                              onClick={() => column.toggleVisibility(!column.getIsVisible())}
                            >
                              <Checkbox
                                checked={column.getIsVisible()}
                                className="mr-2"
                              />
                              {column.id}
                            </DropdownMenuItem>
                          );
                        })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Data Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={paymentColumns.length}
                          className="h-24 text-center"
                        >
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Table Footer with Pagination and Selection */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                      value={`${table.getState().pagination.pageSize}`}
                      onValueChange={(value) => {
                        table.setPageSize(Number(value));
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={table.getState().pagination.pageSize} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                          <SelectItem key={pageSize} value={`${pageSize}`}>
                            {pageSize}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => table.setPageIndex(0)}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <span className="sr-only">Go to first page</span>
                      <ChevronDown className="h-4 w-4 rotate-90" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <span className="sr-only">Go to previous page</span>
                      <ChevronDown className="h-4 w-4 rotate-90" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      <span className="sr-only">Go to next page</span>
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    </Button>
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                      disabled={!table.getCanNextPage()}
                    >
                      <span className="sr-only">Go to last page</span>
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Features Overview */}
              <div className="space-y-3">
                <h4 className="font-semibold">Data Table Features</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">✅ Sorting</h5>
                    <p className="text-xs text-muted-foreground">Click column headers to sort data ascending/descending</p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">🔍 Filtering</h5>
                    <p className="text-xs text-muted-foreground">Search and filter data with real-time updates</p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">📄 Pagination</h5>
                    <p className="text-xs text-muted-foreground">Navigate through pages with customizable page sizes</p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">☑️ Row Selection</h5>
                    <p className="text-xs text-muted-foreground">Select individual rows or all rows with checkboxes</p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">👁️ Column Visibility</h5>
                    <p className="text-xs text-muted-foreground">Show/hide columns with the column visibility toggle</p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">⚡ Row Actions</h5>
                    <p className="text-xs text-muted-foreground">Context menus with copy, view, and action options</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Implementation Examples */}
              <div className="space-y-3">
                <h4 className="font-semibold">Implementation Examples</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm space-y-2">
                    <p className="font-medium">Basic Data Table Setup:</p>
                    <code className="block bg-background p-2 rounded text-xs">
{`import { useReactTable, getCoreRowModel, ColumnDef } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Data = {
  id: string
  name: string
  status: string
}

const columns: ColumnDef<Data>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "status", 
    header: "Status",
  },
]

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
})

<Table>
  <TableHeader>
    {table.getHeaderGroups().map((headerGroup) => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <TableHead key={header.id}>
            {flexRender(header.column.columnDef.header, header.getContext())}
          </TableHead>
        ))}
      </TableRow>
    ))}
  </TableHeader>
  <TableBody>
    {table.getRowModel().rows.map((row) => (
      <TableRow key={row.id}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
</Table>`}
                    </code>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="font-semibold">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      table.toggleAllRowsSelected(false);
                      toast({
                        title: "Selection Cleared",
                        description: "All row selections have been cleared.",
                      });
                    }}
                  >
                    Clear Selection
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      table.resetSorting();
                      toast({
                        title: "Sorting Reset",
                        description: "All sorting has been reset to default.",
                      });
                    }}
                  >
                    Reset Sorting
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      table.resetColumnFilters();
                      toast({
                        title: "Filters Cleared",
                        description: "All column filters have been cleared.",
                      });
                    }}
                  >
                    Clear Filters
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      table.resetColumnVisibility();
                      toast({
                        title: "Columns Reset",
                        description: "All columns are now visible.",
                      });
                    }}
                  >
                    Show All Columns
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hover Card Components */}
          <Card id="hover-card">
            <CardHeader>
              <CardTitle>Hover Card</CardTitle>
              <CardDescription>Preview content on hover for enhanced user experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Hover Card */}
              <div className="space-y-3">
                <h4 className="font-semibold">Basic Hover Card</h4>
                <div className="flex items-center gap-4">
                  <p className="text-sm">
                    Hover over{" "}
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className="underline cursor-pointer text-blue-600 hover:text-blue-800">
                          @shadcn
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="flex justify-between space-x-4">
                          <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>SC</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">@shadcn</h4>
                            <p className="text-sm">
                              The React Framework – created and maintained by @vercel.
                            </p>
                            <div className="flex items-center pt-2">
                              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                              <span className="text-xs text-muted-foreground">
                                Joined December 2021
                              </span>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    {" "}to see their profile information.
                  </p>
                </div>
              </div>

              <Separator />

              {/* User Profile Hover Cards */}
              <div className="space-y-3">
                <h4 className="font-semibold">User Profile Hover Cards</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <span className="text-sm underline">John Doe</span>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="flex justify-between space-x-4">
                          <Avatar>
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">John Doe</h4>
                            <p className="text-sm">Senior Software Engineer</p>
                            <p className="text-sm text-muted-foreground">
                              Full-stack developer with 8+ years of experience in React, Node.js, and cloud technologies.
                            </p>
                            <div className="flex items-center pt-2">
                              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                              <span className="text-xs text-muted-foreground">
                                Joined January 2020
                              </span>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>SM</AvatarFallback>
                          </Avatar>
                          <span className="text-sm underline">Sarah Miller</span>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="flex justify-between space-x-4">
                          <Avatar>
                            <AvatarFallback>SM</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">Sarah Miller</h4>
                            <p className="text-sm">Product Manager</p>
                            <p className="text-sm text-muted-foreground">
                              Product strategist focused on user experience and data-driven decision making.
                            </p>
                            <div className="flex items-center pt-2">
                              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                              <span className="text-xs text-muted-foreground">
                                Joined March 2019
                              </span>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Technical Documentation Hover Cards */}
              <div className="space-y-3">
                <h4 className="font-semibold">Documentation Hover Cards</h4>
                <div className="space-y-4">
                  <p className="text-sm">
                    Learn more about{" "}
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className="underline cursor-pointer text-blue-600 hover:text-blue-800">
                          React Query
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-96">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">TanStack Query (React Query)</h4>
                          <p className="text-sm text-muted-foreground">
                            Powerful data synchronization for React applications. 
                            Fetch, cache and update data without touching any "global state".
                          </p>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <p className="text-xs font-medium">Key Features:</p>
                              <ul className="text-xs text-muted-foreground space-y-1 mt-1">
                                <li>• Caching</li>
                                <li>• Background Updates</li>
                                <li>• Optimistic Updates</li>
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs font-medium">Latest Version:</p>
                              <p className="text-xs text-muted-foreground mt-1">v5.0.0</p>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    {", "}
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className="underline cursor-pointer text-blue-600 hover:text-blue-800">
                          TypeScript
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-96">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">TypeScript</h4>
                          <p className="text-sm text-muted-foreground">
                            TypeScript is a strongly typed programming language that builds on JavaScript.
                          </p>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <p className="text-xs font-medium">Benefits:</p>
                              <ul className="text-xs text-muted-foreground space-y-1 mt-1">
                                <li>• Type Safety</li>
                                <li>• Better IDE Support</li>
                                <li>• Refactoring</li>
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs font-medium">Current Version:</p>
                              <p className="text-xs text-muted-foreground mt-1">v5.6.2</p>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    {", and "}
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className="underline cursor-pointer text-blue-600 hover:text-blue-800">
                          Tailwind CSS
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-96">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Tailwind CSS</h4>
                          <p className="text-sm text-muted-foreground">
                            A utility-first CSS framework for rapidly building custom user interfaces.
                          </p>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <p className="text-xs font-medium">Advantages:</p>
                              <ul className="text-xs text-muted-foreground space-y-1 mt-1">
                                <li>• Utility Classes</li>
                                <li>• No CSS Writing</li>
                                <li>• Responsive Design</li>
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs font-medium">Version:</p>
                              <p className="text-xs text-muted-foreground mt-1">v3.4.0</p>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    {" "}for modern web development.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Legislative/Political Hover Cards */}
              <div className="space-y-3">
                <h4 className="font-semibold">Legislative Information Hover Cards</h4>
                <div className="space-y-4">
                  <p className="text-sm">
                    View details about{" "}
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className="underline cursor-pointer text-blue-600 hover:text-blue-800">
                          H.R. 1234
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-96">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold">H.R. 1234</h4>
                            <Badge variant="secondary">In Committee</Badge>
                          </div>
                          <p className="text-sm font-medium">Infrastructure Investment and Jobs Act</p>
                          <p className="text-sm text-muted-foreground">
                            A bill to authorize funds for Federal-aid highways, highway safety programs, 
                            and transit programs, and for other purposes.
                          </p>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <p className="text-xs font-medium">Sponsor:</p>
                              <p className="text-xs text-muted-foreground">Rep. Jane Smith (D-CA)</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium">Introduced:</p>
                              <p className="text-xs text-muted-foreground">March 15, 2024</p>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    {", "}
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className="underline cursor-pointer text-blue-600 hover:text-blue-800">
                          Sen. John Wilson
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="flex justify-between space-x-4">
                          <Avatar>
                            <AvatarFallback>JW</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">Sen. John Wilson</h4>
                            <p className="text-sm">Senator (R-TX)</p>
                            <p className="text-sm text-muted-foreground">
                              Serves on the Finance Committee and Environment Committee. 
                              Focus areas include energy policy and economic development.
                            </p>
                            <div className="flex items-center pt-2">
                              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                              <span className="text-xs text-muted-foreground">
                                In office since 2018
                              </span>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    {", and the "}
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className="underline cursor-pointer text-blue-600 hover:text-blue-800">
                          House Finance Committee
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-96">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">House Committee on Financial Services</h4>
                          <p className="text-sm text-muted-foreground">
                            Oversees the financial services industry, including banking, housing, 
                            insurance, and securities.
                          </p>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <p className="text-xs font-medium">Chair:</p>
                              <p className="text-xs text-muted-foreground">Rep. Mary Johnson</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium">Members:</p>
                              <p className="text-xs text-muted-foreground">54 Representatives</p>
                            </div>
                          </div>
                          <div className="pt-2">
                            <p className="text-xs font-medium">Active Bills:</p>
                            <p className="text-xs text-muted-foreground">23 bills under consideration</p>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    .
                  </p>
                </div>
              </div>

              <Separator />

              {/* Feature Showcase */}
              <div className="space-y-3">
                <h4 className="font-semibold">Hover Card Features</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">⚡ Instant Preview</h5>
                    <p className="text-xs text-muted-foreground">
                      Content appears instantly on hover without page navigation
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">📱 Accessible</h5>
                    <p className="text-xs text-muted-foreground">
                      Works with keyboard navigation and screen readers
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">🎯 Customizable</h5>
                    <p className="text-xs text-muted-foreground">
                      Flexible content layout and positioning options
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">⏱️ Smart Timing</h5>
                    <p className="text-xs text-muted-foreground">
                      Configurable open/close delays for better UX
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">🎨 Rich Content</h5>
                    <p className="text-xs text-muted-foreground">
                      Support for avatars, badges, links, and complex layouts
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">📐 Smart Positioning</h5>
                    <p className="text-xs text-muted-foreground">
                      Automatically positions to stay within viewport
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Implementation Examples */}
              <div className="space-y-3">
                <h4 className="font-semibold">Implementation Examples</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm space-y-2">
                    <p className="font-medium">Basic Hover Card Usage:</p>
                    <code className="block bg-background p-2 rounded text-xs">
{`import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

<HoverCard>
  <HoverCardTrigger asChild>
    <span className="underline cursor-pointer">@username</span>
  </HoverCardTrigger>
  <HoverCardContent className="w-80">
    <div className="flex justify-between space-x-4">
      <Avatar>
        <AvatarImage src="/avatar.jpg" />
        <AvatarFallback>UN</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold">Username</h4>
        <p className="text-sm">User description here...</p>
        <div className="flex items-center pt-2">
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
          <span className="text-xs text-muted-foreground">
            Joined December 2021
          </span>
        </div>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>`}
                    </code>
                  </div>
                </div>
              </div>

              {/* Use Cases */}
              <div className="space-y-3">
                <h4 className="font-semibold">Perfect Use Cases for Goodable</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h5 className="text-sm font-medium mb-2">🏛️ Legislator Profiles</h5>
                    <p className="text-xs text-muted-foreground">
                      Show member bio, committee assignments, and voting record on hover
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h5 className="text-sm font-medium mb-2">📋 Bill Summaries</h5>
                    <p className="text-xs text-muted-foreground">
                      Display bill status, sponsor, and key details without navigation
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h5 className="text-sm font-medium mb-2">🏢 Committee Info</h5>
                    <p className="text-xs text-muted-foreground">
                      Preview committee membership, jurisdiction, and active bills
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h5 className="text-sm font-medium mb-2">📊 Vote Details</h5>
                    <p className="text-xs text-muted-foreground">
                      Show vote breakdown, date, and outcome on hover
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menubar */}
          <Card id="menubar">
            <CardHeader>
              <CardTitle>Menubar</CardTitle>
              <CardDescription>A visually persistent menu common in desktop applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Menubar */}
              <div className="space-y-3">
                <h4 className="font-semibold">Basic Menubar</h4>
                <Menubar>
                  <MenubarMenu>
                    <MenubarTrigger>File</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>
                        New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                      </MenubarItem>
                      <MenubarItem>
                        New Window <MenubarShortcut>⌘N</MenubarShortcut>
                      </MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem disabled>
                        New Incognito Window
                      </MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>
                        Print... <MenubarShortcut>⌘P</MenubarShortcut>
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                  <MenubarMenu>
                    <MenubarTrigger>Edit</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>
                        Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                      </MenubarItem>
                      <MenubarItem>
                        Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                      </MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>
                        Find <MenubarShortcut>⌘F</MenubarShortcut>
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                  <MenubarMenu>
                    <MenubarTrigger>View</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>Always Show Bookmarks Bar</MenubarItem>
                      <MenubarItem>Always Show Full URLs</MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>
                        Reload <MenubarShortcut>⌘R</MenubarShortcut>
                      </MenubarItem>
                      <MenubarItem disabled>
                        Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
                      </MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>Toggle Fullscreen</MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                  <MenubarMenu>
                    <MenubarTrigger>Profiles</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>John Smith</MenubarItem>
                      <MenubarItem>Sarah Johnson</MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>
                        Add Profile...
                      </MenubarItem>
                      <MenubarItem>Manage Profiles...</MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              </div>

              {/* Legislative Menubar */}
              <div className="space-y-3">
                <h4 className="font-semibold">Legislative Application Menubar</h4>
                <Menubar>
                  <MenubarMenu>
                    <MenubarTrigger>Bills</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>
                        <FileText className="mr-2 h-4 w-4" />
                        View All Bills
                      </MenubarItem>
                      <MenubarItem>
                        <Search className="mr-2 h-4 w-4" />
                        Search Bills <MenubarShortcut>⌘K</MenubarShortcut>
                      </MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>
                        <Star className="mr-2 h-4 w-4" />
                        Favorite Bills
                      </MenubarItem>
                      <MenubarItem>
                        <Bell className="mr-2 h-4 w-4" />
                        Bill Alerts
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                  <MenubarMenu>
                    <MenubarTrigger>Members</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>
                        <Users className="mr-2 h-4 w-4" />
                        All Legislators
                      </MenubarItem>
                      <MenubarItem>
                        <Building className="mr-2 h-4 w-4" />
                        House Members
                      </MenubarItem>
                      <MenubarItem>
                        <Scale className="mr-2 h-4 w-4" />
                        Senate Members
                      </MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>
                        <Heart className="mr-2 h-4 w-4" />
                        Favorite Members
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                  <MenubarMenu>
                    <MenubarTrigger>Tools</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>
                        <Calculator className="mr-2 h-4 w-4" />
                        Bill Impact Calculator
                      </MenubarItem>
                      <MenubarItem>
                        <BarChart className="mr-2 h-4 w-4" />
                        Voting Analytics
                      </MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>
                        <Download className="mr-2 h-4 w-4" />
                        Export Data <MenubarShortcut>⌘E</MenubarShortcut>
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              </div>

              <Separator />

              {/* Implementation Examples */}
              <div className="space-y-3">
                <h4 className="font-semibold">Implementation Examples</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm space-y-2">
                    <p className="font-medium">Basic Menubar Usage:</p>
                    <code className="block bg-background p-2 rounded text-xs">
{`import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from "@/components/ui/menubar"

<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>
        New Tab <MenubarShortcut>⌘T</MenubarShortcut>
      </MenubarItem>
      <MenubarItem>New Window</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Print</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`}
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Menu */}
          <Card id="navigation-menu">
            <CardHeader>
              <CardTitle>Navigation Menu</CardTitle>
              <CardDescription>A collection of links for navigating websites</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Navigation Menu */}
              <div className="space-y-3">
                <h4 className="font-semibold">Basic Navigation Menu</h4>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                          <li className="row-span-3">
                            <NavigationMenuLink asChild>
                              <a
                                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                href="/"
                              >
                                <Heart className="h-6 w-6" />
                                <div className="mb-2 mt-4 text-lg font-medium">
                                  Goodable
                                </div>
                                <p className="text-sm leading-tight text-muted-foreground">
                                  Legislative policy analysis and tracking platform
                                </p>
                              </a>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <a
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                href="/bills"
                              >
                                <div className="text-sm font-medium leading-none">Bills</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  Browse and track legislative bills
                                </p>
                              </a>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <a
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                href="/members"
                              >
                                <div className="text-sm font-medium leading-none">Members</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  Explore legislator profiles and voting records
                                </p>
                              </a>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <a
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                href="/committees"
                              >
                                <div className="text-sm font-medium leading-none">Committees</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  Track committee activities and memberships
                                </p>
                              </a>
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          <li>
                            <NavigationMenuLink asChild>
                              <a
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                href="/shadcn-showcase"
                              >
                                <div className="text-sm font-medium leading-none">UI Components</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  Complete shadcn/ui component showcase
                                </p>
                              </a>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <a
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                href="/dashboard"
                              >
                                <div className="text-sm font-medium leading-none">Dashboard</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  Analytics and overview dashboard
                                </p>
                              </a>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <a
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                href="/policy-portal"
                              >
                                <div className="text-sm font-medium leading-none">Policy Portal</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  Collaborative policy drafting tools
                                </p>
                              </a>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <a
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                href="/playground"
                              >
                                <div className="text-sm font-medium leading-none">AI Playground</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  Experiment with AI-powered analysis
                                </p>
                              </a>
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink
                        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                        href="/docs"
                      >
                        Documentation
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>

              <Separator />

              {/* Implementation Examples */}
              <div className="space-y-3">
                <h4 className="font-semibold">Implementation Examples</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm space-y-2">
                    <p className="font-medium">Basic Navigation Menu Usage:</p>
                    <code className="block bg-background p-2 rounded text-xs">
{`import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink>Link</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`}
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slider */}
          <Card id="slider">
            <CardHeader>
              <CardTitle>Slider</CardTitle>
              <CardDescription>An input where the user selects a value from within a given range</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Slider */}
              <div className="space-y-3">
                <h4 className="font-semibold">Basic Slider</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Volume: {sliderValue[0]}</label>
                    <Slider
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      max={100}
                      step={1}
                      className="w-[60%]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Range Slider</label>
                    <Slider
                      defaultValue={[20, 80]}
                      max={100}
                      step={1}
                      className="w-[60%]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Disabled Slider</label>
                    <Slider
                      defaultValue={[50]}
                      max={100}
                      step={1}
                      disabled
                      className="w-[60%]"
                    />
                  </div>
                </div>
              </div>

              {/* Legislative Use Cases */}
              <div className="space-y-3">
                <h4 className="font-semibold">Legislative Application Examples</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">📊 Voting Confidence: 85%</label>
                    <Slider
                      defaultValue={[85]}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Adjust confidence threshold for vote predictions
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">💰 Budget Range: $2M - $8M</label>
                    <Slider
                      defaultValue={[20, 80]}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Filter bills by estimated budget impact
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">📅 Timeline: 6 months</label>
                    <Slider
                      defaultValue={[6]}
                      max={24}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Set bill tracking timeline
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">🎯 Priority Score: 75</label>
                    <Slider
                      defaultValue={[75]}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Adjust bill priority weighting
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Implementation Examples */}
              <div className="space-y-3">
                <h4 className="font-semibold">Implementation Examples</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm space-y-2">
                    <p className="font-medium">Basic Slider Usage:</p>
                    <code className="block bg-background p-2 rounded text-xs">
{`import { Slider } from "@/components/ui/slider"

const [value, setValue] = useState([50])

<Slider
  value={value}
  onValueChange={setValue}
  max={100}
  step={1}
  className="w-[60%]"
/>`}
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Toggle Group */}
          <Card id="toggle-group">
            <CardHeader>
              <CardTitle>Toggle Group</CardTitle>
              <CardDescription>A set of two-state buttons that can be toggled on or off</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Toggle Groups */}
              <div className="space-y-3">
                <h4 className="font-semibold">Basic Toggle Groups</h4>
                <div className="space-y-4">
                  {/* Single Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Text Alignment (Single)</label>
                    <ToggleGroup type="single" value={toggleGroupValue} onValueChange={setToggleGroupValue}>
                      <ToggleGroupItem value="left" aria-label="Align left">
                        <AlignLeft className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="center" aria-label="Align center">
                        <AlignCenter className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="right" aria-label="Align right">
                        <AlignRight className="h-4 w-4" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  {/* Multiple Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Text Formatting (Multiple)</label>
                    <ToggleGroup type="multiple" value={toggleGroupMultiple} onValueChange={setToggleGroupMultiple}>
                      <ToggleGroupItem value="bold" aria-label="Bold">
                        <Bold className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="italic" aria-label="Italic">
                        <Italic className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="underline" aria-label="Underline">
                        <Underline className="h-4 w-4" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  {/* Outline Variant */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Outline Style</label>
                    <ToggleGroup type="single" variant="outline">
                      <ToggleGroupItem value="a">A</ToggleGroupItem>
                      <ToggleGroupItem value="b">B</ToggleGroupItem>
                      <ToggleGroupItem value="c">C</ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  {/* Different Sizes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Size Variants</label>
                    <div className="flex items-center gap-4">
                      <ToggleGroup type="single" size="sm">
                        <ToggleGroupItem value="small">Small</ToggleGroupItem>
                      </ToggleGroup>
                      <ToggleGroup type="single">
                        <ToggleGroupItem value="default">Default</ToggleGroupItem>
                      </ToggleGroup>
                      <ToggleGroup type="single" size="lg">
                        <ToggleGroupItem value="large">Large</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legislative Use Cases */}
              <div className="space-y-3">
                <h4 className="font-semibold">Legislative Application Examples</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">🏛️ Chamber Selection</label>
                    <ToggleGroup type="single" defaultValue="house">
                      <ToggleGroupItem value="house">
                        <Building className="h-4 w-4 mr-2" />
                        House
                      </ToggleGroupItem>
                      <ToggleGroupItem value="senate">
                        <Scale className="h-4 w-4 mr-2" />
                        Senate
                      </ToggleGroupItem>
                      <ToggleGroupItem value="both">
                        <Users className="h-4 w-4 mr-2" />
                        Both
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">📊 Bill Status Filters</label>
                    <ToggleGroup type="multiple" defaultValue={["active", "passed"]}>
                      <ToggleGroupItem value="active" variant="outline">
                        <Zap className="h-4 w-4 mr-2" />
                        Active
                      </ToggleGroupItem>
                      <ToggleGroupItem value="passed" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Passed
                      </ToggleGroupItem>
                      <ToggleGroupItem value="failed" variant="outline">
                        <X className="h-4 w-4 mr-2" />
                        Failed
                      </ToggleGroupItem>
                      <ToggleGroupItem value="pending" variant="outline">
                        <Clock className="h-4 w-4 mr-2" />
                        Pending
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">🎯 Analysis Views</label>
                    <ToggleGroup type="single" defaultValue="summary">
                      <ToggleGroupItem value="summary">
                        <FileText className="h-4 w-4 mr-2" />
                        Summary
                      </ToggleGroupItem>
                      <ToggleGroupItem value="details">
                        <Info className="h-4 w-4 mr-2" />
                        Details
                      </ToggleGroupItem>
                      <ToggleGroupItem value="timeline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Timeline
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Implementation Examples */}
              <div className="space-y-3">
                <h4 className="font-semibold">Implementation Examples</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm space-y-2">
                    <p className="font-medium">Basic Toggle Group Usage:</p>
                    <code className="block bg-background p-2 rounded text-xs">
{`import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

<ToggleGroup type="single">
  <ToggleGroupItem value="a">A</ToggleGroupItem>
  <ToggleGroupItem value="b">B</ToggleGroupItem>
  <ToggleGroupItem value="c">C</ToggleGroupItem>
</ToggleGroup>`}
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Command */}
          <Card id="command">
            <CardHeader>
              <CardTitle>Command</CardTitle>
              <CardDescription>Fast, composable, unstyled command menu for React</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Command */}
              <div className="space-y-3">
                <h4 className="font-semibold">Basic Command Menu</h4>
                <Command className="rounded-lg border shadow-md max-w-md">
                  <CommandInput placeholder="Type a command or search..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                      <CommandItem>
                        <CalendarLucide className="mr-2 h-4 w-4" />
                        <span>Calendar</span>
                      </CommandItem>
                      <CommandItem>
                        <Smile className="mr-2 h-4 w-4" />
                        <span>Search Emoji</span>
                      </CommandItem>
                      <CommandItem>
                        <Calculator className="mr-2 h-4 w-4" />
                        <span>Calculator</span>
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Settings">
                      <CommandItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                        <CommandShortcut>⌘P</CommandShortcut>
                      </CommandItem>
                      <CommandItem>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                        <CommandShortcut>⌘B</CommandShortcut>
                      </CommandItem>
                      <CommandItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        <CommandShortcut>⌘S</CommandShortcut>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>

              {/* Command Dialog */}
              <div className="space-y-3">
                <h4 className="font-semibold">Command Dialog</h4>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCommandDialogOpen(true)}
                  >
                    <CommandIcon className="mr-2 h-4 w-4" />
                    Open Command Menu
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-2">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Press ⌘K to open
                  </p>
                </div>

                <CommandDialog open={commandDialogOpen} onOpenChange={setCommandDialogOpen}>
                  <CommandInput placeholder="Type a command or search..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="🏛️ Legislative">
                      <CommandItem>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Search Bills</span>
                      </CommandItem>
                      <CommandItem>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Find Legislators</span>
                      </CommandItem>
                      <CommandItem>
                        <Building className="mr-2 h-4 w-4" />
                        <span>Browse Committees</span>
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="📊 Tools">
                      <CommandItem>
                        <BarChart className="mr-2 h-4 w-4" />
                        <span>Analytics Dashboard</span>
                        <CommandShortcut>⌘D</CommandShortcut>
                      </CommandItem>
                      <CommandItem>
                        <Calculator className="mr-2 h-4 w-4" />
                        <span>Impact Calculator</span>
                      </CommandItem>
                      <CommandItem>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Export Data</span>
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="⚙️ Settings">
                      <CommandItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                        <CommandShortcut>⌘P</CommandShortcut>
                      </CommandItem>
                      <CommandItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        <CommandShortcut>⌘S</CommandShortcut>
                      </CommandItem>
                      <CommandItem>
                        <Keyboard className="mr-2 h-4 w-4" />
                        <span>Keyboard shortcuts</span>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </CommandDialog>
              </div>

              {/* Legislative Command Menu */}
              <div className="space-y-3">
                <h4 className="font-semibold">Legislative Search Command</h4>
                <Command className="rounded-lg border shadow-md max-w-md">
                  <CommandInput placeholder="Search bills, members, committees..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="📋 Recent Bills">
                      <CommandItem>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>H.R. 1234 - Climate Action Bill</span>
                      </CommandItem>
                      <CommandItem>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>S. 567 - Healthcare Reform Act</span>
                      </CommandItem>
                      <CommandItem>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>H.R. 890 - Infrastructure Investment</span>
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="👥 Legislators">
                      <CommandItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Sen. John Smith (D-CA)</span>
                      </CommandItem>
                      <CommandItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Rep. Sarah Johnson (R-TX)</span>
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="🏢 Committees">
                      <CommandItem>
                        <Building className="mr-2 h-4 w-4" />
                        <span>House Judiciary Committee</span>
                      </CommandItem>
                      <CommandItem>
                        <Building className="mr-2 h-4 w-4" />
                        <span>Senate Finance Committee</span>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>

              <Separator />

              {/* Implementation Examples */}
              <div className="space-y-3">
                <h4 className="font-semibold">Implementation Examples</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm space-y-2">
                    <p className="font-medium">Basic Command Usage:</p>
                    <code className="block bg-background p-2 rounded text-xs">
{`import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"

<Command>
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
      <CommandItem>Search Emoji</CommandItem>
      <CommandItem>Calculator</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`}
                    </code>
                  </div>
                </div>
              </div>

              {/* Feature Grid */}
              <div className="space-y-3">
                <h4 className="font-semibold">Key Features</h4>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h5 className="text-sm font-medium">⚡ Fast Search</h5>
                    <p className="text-xs text-muted-foreground">
                      Instant search and filtering with keyboard navigation
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h5 className="text-sm font-medium">⌨️ Keyboard Shortcuts</h5>
                    <p className="text-xs text-muted-foreground">
                      Full keyboard support with customizable shortcuts
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h5 className="text-sm font-medium">🎯 Grouped Results</h5>
                    <p className="text-xs text-muted-foreground">
                      Organize commands and results into logical groups
                    </p>
                  </div>
                </div>
              </div>

              {/* Use Cases */}
              <div className="space-y-3">
                <h4 className="font-semibold">Perfect Use Cases for Goodable</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h5 className="text-sm font-medium mb-2">🔍 Global Search</h5>
                    <p className="text-xs text-muted-foreground">
                      Quick search across bills, legislators, committees, and documents
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h5 className="text-sm font-medium mb-2">⚡ Quick Actions</h5>
                    <p className="text-xs text-muted-foreground">
                      Fast access to common tools like export, filter, and analysis
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h5 className="text-sm font-medium mb-2">🎯 Command Palette</h5>
                    <p className="text-xs text-muted-foreground">
                      Power user interface for advanced legislative research
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h5 className="text-sm font-medium mb-2">📊 Context-Aware</h5>
                    <p className="text-xs text-muted-foreground">
                      Show relevant commands based on current page or selection
                    </p>
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