"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PhoneIcon, MapPinIcon, MailIcon } from "lucide-react";

export default function HeroFormContactWithBackground() {
  return (
    <>
      {/* Hero */}
      <div className="relative flex min-h-[800px] items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/goodable-night.avif"
            alt="NYSgpt night background"
            className="w-full h-full object-cover brightness-[0.6]"
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 md:px-6 md:py-20 lg:py-32 2xl:max-w-[1400px]">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <div className="text-white">
              <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Got a problem?
              </h1>
              <p className="mt-4 max-w-lg text-xl text-white/80">
                Great! Go ahead and share that problem with others and get to work.
              </p>

              <div className="mt-12 space-y-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 rounded-full bg-white/10 p-3 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">1</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white">
                      Identify the problem
                    </h3>
                    <p className="mt-1 text-white/80">Now you can work the problem.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 rounded-full bg-white/10 p-3 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">2</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white">
                      Vote on the problem
                    </h3>
                    <p className="mt-1 text-white/80">Now we can all agree.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 rounded-full bg-white/10 p-3 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">3</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white">
                      Talk about it.
                    </h3>
                    <p className="mt-1 text-white/80">
                      It's not complaining if you're committed to making the change.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form */}
            <div className="bg-background/95 rounded-lg p-8 shadow-lg backdrop-blur-sm">
              <h2 className="mb-6 text-2xl font-bold">Send us your problems.</h2>
              <TooltipProvider>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Label className="mb-1.5 cursor-help" htmlFor="name">
                            Name
                          </Label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This will be used if attribution is desired.</p>
                        </TooltipContent>
                      </Tooltip>
                      <Input id="name" placeholder="Tony S." />
                    </div>
                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Label className="mb-1.5 cursor-help" htmlFor="penName">
                            Pen Name
                          </Label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This will be used if a pen name is preferred.</p>
                        </TooltipContent>
                      </Tooltip>
                      <Input id="penName" placeholder="Iron Man" />
                    </div>
                  </div>
                <div>
                  <Label className="mb-1.5" htmlFor="email">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="johndoe@example.com"
                  />
                </div>
                <div>
                  <Label className="mb-1.5" htmlFor="phone">
                    Phone number (optional)
                  </Label>
                  <Input id="phone" placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <Label className="mb-1.5" htmlFor="category">
                    Category
                  </Label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="childcare">Childcare</SelectItem>
                      <SelectItem value="quality-time">Quality Time</SelectItem>
                      <SelectItem value="third-place">Third Place</SelectItem>
                      <SelectItem value="housing">Housing</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5" htmlFor="message">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your problem or proposal. Don't over think this. Ex. 'I never have any free time', 'I can't afford to live here' are acceptable starters."
                    rows={4}
                  />
                </div>
                <Button className="w-full">Send Message</Button>
                </form>
              </TooltipProvider>
              <p className="text-muted-foreground mt-4 text-center text-xs">
                We will not get back to you. Solve your own problem and help others do the same.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* End Hero */}
    </>
  );
}
