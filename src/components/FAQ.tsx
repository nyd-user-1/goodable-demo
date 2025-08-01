import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Can I cancel at anytime?",
    answer:
      "Yes, you can cancel your subscription at any time with no questions asked. Your access will continue until the end of your current billing period. We'd appreciate any feedback you can share to help us improve Goodable.",
  },
  {
    question: "How does Goodable's pricing work?",
    answer:
      "Goodable offers tiered subscriptions designed for different user types - from free accounts for basic access to enterprise plans for organizations. Each tier includes specific features like AI chat sessions, legislative drafting tools, and collaboration capabilities. You can switch between monthly and annual billing, with annual plans offering a 20% discount.",
  },
  {
    question: "How secure is Goodable?",
    answer:
      "Security is our top priority. We use enterprise-grade encryption, secure data centers, and follow best practices for handling sensitive legislative information. All data is encrypted in transit and at rest, and we maintain strict access controls and regular security audits to protect your information.",
  },
  {
    question: "What AI models does Goodable support?",
    answer:
      "Goodable integrates with multiple AI models including GPT-4o, GPT-4o Mini, Claude 3.5 Sonnet, Claude 3.5 Haiku, and Perplexity Sonar models. You can select your preferred model for different tasks like bill analysis, legislative drafting, and policy research. Different subscription tiers may have varying access levels to these models.",
  },
  {
    question: "Can I collaborate with others?",
    answer:
      "Yes! Goodable includes powerful collaboration features. You can invite co-authors to work on legislative drafts, share problem statements, and collaborate on policy solutions. Higher-tier plans include advanced collaboration tools like real-time editing, comment systems, and workflow management.",
  },
  {
    question: "Do you offer student discounts?",
    answer:
      "Absolutely! We have a dedicated Student plan at $19/month (or $15.83/month annually) specifically designed for students and academics. This plan includes unlimited chat sessions, legislative draft creation, and basic analysis tools. Student verification is required to access this discounted pricing.",
  },
  {
    question: "How does the bill tracking feature work?",
    answer:
      "Our bill tracking system allows you to monitor legislative activity across different jurisdictions. You can track specific bills, set up alerts for status changes, analyze voting patterns, and access committee information. Advanced plans include historical data access and comprehensive analytics dashboards.",
  },
  {
    question: "What kind of support do you provide?",
    answer:
      "Support varies by plan tier. Free users have access to documentation and community forums. Paid plans include email support, with higher tiers offering priority support, dedicated account managers, and custom training sessions. Enterprise customers receive SLA guarantees and dedicated support channels.",
  },
];

export default function FAQ() {
  // Split FAQs into two columns (4 questions each)
  const firstColumn = faqs.slice(0, 4);
  const secondColumn = faqs.slice(4, 8);

  return (
    <>
      <div className="max-w-[85rem] container mx-auto px-4 md:px-6 2xl:max-w-[1400px] py-24 lg:py-32">
        {/* Title - center aligned like other sections */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Questions? Answers.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Answers to the most frequently asked questions about Goodable.
          </p>
        </div>

        {/* Two-column layout - center aligned and equal width */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* First Column */}
          <div>
            <Accordion type="single" collapsible className="w-full">
              {firstColumn.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={faq.question}>
                  <AccordionTrigger className="text-lg font-semibold text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Second Column */}
          <div>
            <Accordion type="single" collapsible className="w-full">
              {secondColumn.map((faq, index) => (
                <AccordionItem value={`item-second-${index}`} key={faq.question}>
                  <AccordionTrigger className="text-lg font-semibold text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
}