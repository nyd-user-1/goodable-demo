import { useState, FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function Contact() {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const portalId = '245035447';
    const formGuid = '536281ae-0a9b-4288-9e1f-07ef0f4b4463';

    try {
      await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: [
            { objectTypeId: '0-1', name: 'firstname', value: firstName },
            { objectTypeId: '0-1', name: 'lastname', value: lastName },
            { objectTypeId: '0-1', name: 'email', value: email },
            { objectTypeId: '0-1', name: 'phone', value: phone },
            { objectTypeId: '0-1', name: 'message', value: details },
          ],
          context: {
            pageUri: window.location.href,
            pageName: 'Contact Us Form',
          },
        }),
      });
      toast({ title: 'Message sent', description: "We'll get back to you in 1-2 business days." });
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setDetails('');
    } catch (error) {
      console.error('Contact submission error:', error);
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
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
                    <Button type="submit" disabled={isSubmitting} className="bg-foreground text-background hover:bg-foreground/90">
                      {isSubmitting ? 'Sending...' : 'Send inquiry'}
                    </Button>
                  </div>

                  <div className="mt-3 text-center">
                    <p className="text-muted-foreground text-sm">
                      We&apos;ll get back to you in 1-2 business days.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">About NYSgpt</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                NYSgpt is a specialized legislative policy platform designed to help users understand and analyze New York State legislation. It is powered by a comprehensive database that includes all New York State bills from the current and recent legislative sessions, as well as real-time data from the New York State Senate and Assembly. NYSgpt provides detailed information about bill texts, legislative sponsors, status updates, committee assignments, and more.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The platform is equipped to assist users by making complex legislative information accessible and actionable. It supports informed civic participation by offering evidence-based analysis while maintaining professional objectivity. By using NYSgpt, users can gain insights into how legislation impacts working families, uphold digital rights, and understand the broader political and fiscal implications of proposed laws.
              </p>
            </div>
          </div>
        </div>
      </div>
      <FooterSimple />
    </div>
  );
}
