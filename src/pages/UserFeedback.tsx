import { useState } from 'react';
import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowRightIcon,
  CheckIcon,
  RotateCwIcon,
} from 'lucide-react';

interface Question {
  id: number;
  text: string;
  type: 'single' | 'multiple' | 'text';
  options?: { id: string; text: string }[];
}

const questions: Question[] = [
  {
    id: 1,
    text: 'How would you rate your overall experience with NYSgpt?',
    type: 'single',
    options: [
      { id: 'excellent', text: 'Excellent' },
      { id: 'good', text: 'Good' },
      { id: 'okay', text: 'Okay' },
      { id: 'needs-work', text: 'Needs improvement' },
    ],
  },
  {
    id: 2,
    text: 'Which features do you find most useful? (Select all that apply)',
    type: 'multiple',
    options: [
      { id: 'chat', text: 'AI Chat for legislative questions' },
      { id: 'bills', text: 'Bill search and analysis' },
      { id: 'members', text: 'Member profiles and information' },
      { id: 'committees', text: 'Committee pages and data' },
      { id: 'notes', text: 'Notes and excerpts' },
      { id: 'prompts', text: 'Prompt library' },
    ],
  },
  {
    id: 3,
    text: 'What features or improvements would you most like to see?',
    type: 'multiple',
    options: [
      { id: 'alerts', text: 'Bill tracking alerts and notifications' },
      { id: 'compare', text: 'Side-by-side bill comparison' },
      { id: 'voting', text: 'Voting record analysis' },
      { id: 'mobile', text: 'Better mobile experience' },
      { id: 'collab', text: 'Team collaboration tools' },
      { id: 'export', text: 'Export and reporting features' },
    ],
  },
  {
    id: 4,
    text: 'How did you hear about NYSgpt?',
    type: 'single',
    options: [
      { id: 'search', text: 'Search engine' },
      { id: 'social', text: 'Social media' },
      { id: 'colleague', text: 'Colleague or friend' },
      { id: 'news', text: 'News article or press' },
      { id: 'other', text: 'Other' },
    ],
  },
  {
    id: 5,
    text: 'Is there anything else you\'d like to share? What would make NYSgpt more useful for your work?',
    type: 'text',
  },
];

export default function UserFeedback() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const hasAnswered =
    answers[currentQ.id] !== undefined &&
    (currentQ.type !== 'multiple' || (answers[currentQ.id] as string[])?.length > 0) &&
    (currentQ.type !== 'text' || (answers[currentQ.id] as string)?.trim().length > 0);

  const handleSingleChoice = (value: string) => {
    setAnswers({ ...answers, [currentQ.id]: value });
  };

  const handleMultipleChoice = (value: string) => {
    const current = (answers[currentQ.id] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setAnswers({ ...answers, [currentQ.id]: updated });
  };

  const handleTextInput = (value: string) => {
    setAnswers({ ...answers, [currentQ.id]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Build email body from answers
      const lines = questions.map((q) => {
        const answer = answers[q.id];
        let answerText = '';
        if (q.type === 'text') {
          answerText = (answer as string) || 'No response';
        } else if (q.type === 'multiple' && q.options) {
          const selected = (answer as string[]) || [];
          answerText = selected
            .map((id) => q.options!.find((o) => o.id === id)?.text || id)
            .join(', ') || 'No response';
        } else if (q.type === 'single' && q.options) {
          answerText = q.options.find((o) => o.id === answer)?.text || 'No response';
        }
        return `${q.text}\n${answerText}`;
      });

      const subject = encodeURIComponent('User Feedback Form');
      const body = encodeURIComponent(lines.join('\n\n'));
      window.open(`mailto:info@nysgpt.com?subject=${subject}&body=${body}`, '_blank');

      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ChatHeader />
      <div className="container mx-auto px-4 py-16 md:px-6 lg:py-24 2xl:max-w-[1400px] flex-1">
        <div className="mx-auto max-w-2xl">
          {!showResults ? (
            <Card className="border shadow-lg">
              <CardHeader className="pb-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium">
                    User Feedback
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {currentQuestion + 1} of {questions.length}
                  </span>
                </div>
                <CardTitle className="text-2xl font-bold">
                  Help us improve NYSgpt
                </CardTitle>
                <CardDescription>
                  <Progress value={progress} className="mt-2 h-2 [&>div]:bg-foreground" />
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">{currentQ.text}</h3>

                  {currentQ.type === 'single' && currentQ.options && (
                    <RadioGroup
                      value={(answers[currentQ.id] as string) || ''}
                      onValueChange={handleSingleChoice}
                      className="space-y-3"
                    >
                      {currentQ.options.map((option) => (
                        <div
                          key={option.id}
                          className="hover:bg-muted/50 flex items-center space-x-2 rounded-lg border p-4 transition-colors"
                        >
                          <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                          <Label htmlFor={`option-${option.id}`} className="flex-grow cursor-pointer">
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {currentQ.type === 'multiple' && currentQ.options && (
                    <div className="space-y-3">
                      <p className="text-muted-foreground text-sm">Select all that apply</p>
                      {currentQ.options.map((option) => (
                        <div
                          key={option.id}
                          className="hover:bg-muted/50 flex items-center space-x-2 rounded-lg border p-4 transition-colors cursor-pointer"
                          onClick={() => handleMultipleChoice(option.id)}
                        >
                          <Checkbox
                            id={`option-${option.id}`}
                            checked={((answers[currentQ.id] as string[]) || []).includes(option.id)}
                            onCheckedChange={() => handleMultipleChoice(option.id)}
                            className="border-foreground data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                          />
                          <Label htmlFor={`option-${option.id}`} className="flex-grow cursor-pointer">
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentQ.type === 'text' && (
                    <textarea
                      rows={6}
                      placeholder="Type your feedback here..."
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      value={(answers[currentQ.id] as string) || ''}
                      onChange={(e) => handleTextInput(e.target.value)}
                    />
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex justify-between pt-6">
                <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!hasAnswered}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  {currentQuestion < questions.length - 1 ? (
                    <>Next <ArrowRightIcon className="ml-2 h-4 w-4" /></>
                  ) : (
                    'Submit Feedback'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border shadow-lg">
              <CardHeader className="pb-4 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30">
                  <CheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl font-bold">Thank you!</CardTitle>
                <CardDescription className="text-base">
                  Your feedback helps us build a better platform for civic engagement. We read every submission and use it to prioritize improvements.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center gap-4 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentQuestion(0);
                    setAnswers({});
                    setShowResults(false);
                  }}
                >
                  <RotateCwIcon className="mr-2 h-4 w-4" />
                  Submit More Feedback
                </Button>
                <Button
                  className="bg-foreground text-background hover:bg-foreground/90"
                  onClick={() => window.location.href = '/'}
                >
                  Back to NYSgpt
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
      <FooterSimple />
    </div>
  );
}
