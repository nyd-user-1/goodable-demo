import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageSquare, 
  Send, 
  Star, 
  Quote,
  ArrowRight,
  Users,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ContactFormWithBackground() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Policy Director",
      avatar: "/goodable%20pwa.jpg",
      content: "Goodable transformed how we approach legislative analysis. The AI insights are game-changing."
    },
    {
      name: "Marcus Rodriguez",
      role: "Legislative Aide",
      avatar: "/goodable%20pwa.jpg", 
      content: "Finally, a platform that understands the complexity of policy work. Incredible collaboration tools."
    },
    {
      name: "Dr. Elena Vasquez",
      role: "Research Director",
      avatar: "/goodable%20pwa.jpg",
      content: "The bill tracking and committee insights save us hours every week. Essential for our work."
    }
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/goodable-night.avif)"
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          
          {/* Left Side - Content */}
          <div className="text-white space-y-8">
            <div className="space-y-6">
              <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Get in Touch
              </Badge>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Ready to make a
                <span className="block text-blue-400">difference?</span>
              </h2>
              
              <p className="text-xl text-gray-200 leading-relaxed max-w-lg">
                Join thousands of policy professionals who trust Goodable to power their legislative work. 
                Let's discuss how we can support your mission.
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">5,000+</div>
                <div className="text-sm text-gray-300">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">50+</div>
                <div className="text-sm text-gray-300">Jurisdictions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">24/7</div>
                <div className="text-sm text-gray-300">Support</div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Trusted by policy professionals
              </h3>
              <div className="space-y-3">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                          <AvatarFallback className="bg-blue-500 text-white">
                            {testimonial.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-white">{testimonial.name}</p>
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-300 mb-2">{testimonial.role}</p>
                          <p className="text-sm text-gray-200">{testimonial.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="relative">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <MessageSquare className="w-12 h-12 text-blue-600 mx-auto" />
                    <h3 className="text-2xl font-bold text-gray-900">Let's Connect</h3>
                    <p className="text-gray-600">
                      Tell us about your policy work and how we can help
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                        Subject *
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder="What would you like to discuss?"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us about your policy work, challenges, or how we can help..."
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 h-auto text-base"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Send Message
                          <Send className="w-4 h-4" />
                        </div>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      We'll respond within 24 hours. By submitting, you agree to our{" "}
                      <a href="/privacy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}