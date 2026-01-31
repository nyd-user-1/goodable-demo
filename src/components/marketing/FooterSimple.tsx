export default function FooterSimple() {
  return (
    <footer className="bg-background w-full">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-10 md:h-24 md:flex-row md:px-6 md:py-0 2xl:max-w-[1400px]">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-muted-foreground text-center text-sm leading-loose md:text-left">
            NYSgpt is an Alpha stage product and can make mistakes. Please double-check responses.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <nav className="flex gap-4 md:gap-6">
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Contact
            </a>
          </nav>
          <p className="text-muted-foreground text-center text-sm md:text-left">
            &copy; {new Date().getFullYear()} NYSgpt.com. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
