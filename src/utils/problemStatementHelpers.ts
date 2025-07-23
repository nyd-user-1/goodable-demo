import { supabase } from '@/integrations/supabase/client';

export const generateProblemFromScenario = async (scenario: string, context?: string): Promise<string> => {
  try {
    let prompt: string;
    
    if (context === 'landing_page') {
      prompt = `You are helping a first-time user who is new to legislative processes. Transform their conversational problem description into a structured legislative problem statement with a welcoming, educational tone.

Generate a response with exactly these sections:
- **Problem Definition**: Clear, formal statement of the issue
- **Scope**: Who and what is affected
- **Impact**: Consequences and implications
- **Stakeholders**: Key groups involved or affected

User's problem: ${scenario}

Use markdown formatting. Be thorough but accessible to newcomers.`;
    } else {
      prompt = `Based on this real-life scenario, generate a clear and structured problem statement that identifies the legislative issue:

Scenario: ${scenario}

Please provide a problem statement that:
1. Clearly identifies the core issue
2. Explains the impact on affected parties
3. Describes why current laws/regulations are insufficient
4. Justifies the need for legislative action
5. Is written in professional policy language

Keep it concise but comprehensive (2-3 paragraphs maximum).`;
    }

    const { data, error } = await supabase.functions.invoke('generate-with-openai', {
      body: { prompt, type: 'problem', context }
    });

    if (error) {
      console.error('Error calling OpenAI function:', error);
      throw new Error('Failed to generate problem statement');
    }

    return data.generatedText || 'Unable to generate problem statement. Please try again.';
  } catch (error) {
    console.error('Error generating problem statement:', error);
    throw new Error('Failed to generate problem statement. Please check your connection and try again.');
  }
};