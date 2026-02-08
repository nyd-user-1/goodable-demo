import { useState, FormEvent } from 'react';
import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Contact() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent('Contact Us Form');
    const body = encodeURIComponent(
      `Name: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone}\n\nDetails:\n${details}`
    );
    window.location.href = `mailto:info@nysgpt.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ChatHeader />
      <div className="container mx-auto px-4 py-24 md:px-6 lg:py-32 2xl:max-w-[1400px] flex-1">
        <div className="mx-auto max-w-2xl lg:max-w-5xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold sm:text-4xl">Contact us</h1>
            <p className="text-muted-foreground mt-3">
              We&apos;d love to talk about how we can help you.
            </p>
          </div>

          <div className="mt-12 grid items-center gap-6 lg:grid-cols-2 lg:gap-16">
            <Card className="p-0">
              <CardContent className="p-6">
                <h2 className="mb-8 text-xl font-semibold">Fill in the form</h2>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                      </div>
                      <div>
                        <Input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                      </div>
                    </div>

                    <div>
                      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div>
                      <Input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>

                    <div>
                      <Textarea placeholder="Details" rows={4} value={details} onChange={(e) => setDetails(e.target.value)} />
                    </div>
                  </div>

                  <div className="mt-4 grid">
                    <Button type="submit" className="bg-foreground text-background hover:bg-foreground/90">Send inquiry</Button>
                  </div>

                  <div className="mt-3 text-center">
                    <p className="text-muted-foreground text-sm">
                      We&apos;ll get back to you in 1-2 business days.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="divide-border divide-y">
              <div className="flex gap-x-7 py-6">
                <MapPin className="text-muted-foreground mt-1.5 size-6" />
                <div>
                  <h3 className="font-semibold">Our address</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    We&apos;re here to help with any questions or code.
                  </p>
                  <address className="text-muted-foreground mt-2 text-sm not-italic">
                    300 Bath Street, Tay House
                    <br />
                    Glasgow G2 4JR, United Kingdom
                  </address>
                </div>
              </div>

              <div className="flex gap-x-7 py-6">
                <Mail className="text-muted-foreground mt-1.5 size-6" />
                <div>
                  <h3 className="font-semibold">Email us</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    We&apos;ll get back to you as soon as possible.
                  </p>
                  <p className="mt-2">
                    <a
                      className="text-foreground text-sm font-medium hover:underline"
                      href="mailto:info@nysgpt.com"
                    >
                      info@nysgpt.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex gap-x-7 py-6">
                <Phone className="text-muted-foreground mt-1.5 size-6" />
                <div>
                  <h3 className="font-semibold">Call us</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Mon-Fri from 8am to 5pm.
                  </p>
                  <p className="mt-2">
                    <a
                      className="text-foreground text-sm font-medium hover:underline"
                      href="tel:+1 (555) 000-0000"
                    >
                      +1 (555) 000-0000
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterSimple />
    </div>
  );
}
