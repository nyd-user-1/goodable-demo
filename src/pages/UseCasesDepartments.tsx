import { ChatHeader } from '@/components/ChatHeader';
import { UseCasesTabs } from '@/components/UseCasesTabs';
import FooterSimple from '@/components/marketing/FooterSimple';
import { useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { departmentPrompts, agencyPrompts, authorityPrompts } from './Prompts';

const allDepartmentPrompts = [
  ...departmentPrompts,
  ...agencyPrompts,
  ...authorityPrompts,
];

const UseCasesDepartments = () => {
  const navigate = useNavigate();

  const handlePromptClick = (prompt: string) => {
    navigate(`/?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader />

      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Chats for legislative research
            </h1>

            <UseCasesTabs />

            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-4">
              Explore NYS departments, agencies, and public authorities.
            </p>
            <p className="text-muted-foreground">
              Tap a chat to get started.
            </p>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {allDepartmentPrompts.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handlePromptClick(item.prompt)}
                className="group break-inside-avoid bg-muted/30 hover:bg-muted/50 rounded-2xl p-6 cursor-pointer transition-all duration-200"
              >
                <h3 className="font-semibold text-base mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.prompt}
                </p>

                <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-4 transition-all duration-200">
                  <div className="flex justify-end">
                    <div className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center">
                      <ArrowUp className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 pt-8 border-t">
            <p className="text-sm text-muted-foreground text-center max-w-4xl mx-auto leading-relaxed">
              These prompts cover New York State departments, agencies, and public authorities to help you explore government services and operations.
            </p>
          </div>
        </div>
      </main>

      <FooterSimple />
    </div>
  );
};

export default UseCasesDepartments;
