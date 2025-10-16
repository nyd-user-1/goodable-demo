import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function DottedBorderAccordion() {
  return (
    <div className="max-w-md mx-auto py-6">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value="item-1"
          className="border-0 mb-4 relative before:absolute before:inset-0 before:rounded-md before:border-2 before:border-dashed before:border-border/50 data-[state=open]:before:border-border before:transition-colors before:duration-300"
        >
          <div className="relative p-0.5">
            <AccordionTrigger className="hover:no-underline px-4 py-3 rounded-t-md">
              Is it accessible?
            </AccordionTrigger>
            <AccordionContent className="px-4">
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </div>
        </AccordionItem>
        <AccordionItem
          value="item-2"
          className="border-0 mb-4 relative before:absolute before:inset-0 before:rounded-md before:border-2 before:border-dashed before:border-border/50 data-[state=open]:before:border-border before:transition-colors before:duration-300"
        >
          <div className="relative p-0.5">
            <AccordionTrigger className="hover:no-underline px-4 py-3 rounded-t-md">
              Is it styled?
            </AccordionTrigger>
            <AccordionContent className="px-4">
              Yes. It comes with default styles that matches the other
              components&apos; aesthetic.
            </AccordionContent>
          </div>
        </AccordionItem>
        <AccordionItem
          value="item-3"
          className="border-0 mb-4 relative before:absolute before:inset-0 before:rounded-md before:border-2 before:border-dashed before:border-border/50 data-[state=open]:before:border-border before:transition-colors before:duration-300"
        >
          <div className="relative p-0.5">
            <AccordionTrigger className="hover:no-underline px-4 py-3 rounded-t-md">
              Is it animated?
            </AccordionTrigger>
            <AccordionContent className="px-4">
              Yes. It&apos;s animated by default, but you can disable it if you
              prefer.
            </AccordionContent>
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
