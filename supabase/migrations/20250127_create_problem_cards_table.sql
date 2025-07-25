-- Create problem_cards table to properly link UI cards to policy data
CREATE TABLE IF NOT EXISTS public.problem_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier (e.g., 'addictive-technology')
  title TEXT NOT NULL, -- Display title for the card (e.g., 'Addictive Technology')
  description TEXT, -- Card description
  category TEXT, -- Category like 'Technology', 'Healthcare', etc.
  sub_problems INTEGER DEFAULT 0,
  solutions INTEGER DEFAULT 0,
  policy_data_title TEXT, -- Links to "Title" column in "Top 50 Public Policy Problems" table
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.problem_cards ENABLE ROW LEVEL SECURITY;

-- Create read policy for all users
CREATE POLICY "Problem cards are viewable by everyone" 
ON public.problem_cards 
FOR SELECT 
USING (true);

-- Create update policy for authenticated users (admin)
CREATE POLICY "Admin users can update problem cards" 
ON public.problem_cards 
FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM profiles WHERE role = 'admin'
))
WITH CHECK (auth.uid() IN (
  SELECT user_id FROM profiles WHERE role = 'admin'
));

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_problem_cards_updated_at
BEFORE UPDATE ON public.problem_cards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert initial problem cards with mappings to policy data
INSERT INTO public.problem_cards (slug, title, category, sub_problems, solutions, policy_data_title, description)
VALUES
  -- Technology
  ('addictive-technology', 'Addictive Technology', 'Technology', 5, 8, 'Addictive Tech: Redesigning for Human Wellbeing', 'Comprehensive solutions and policy approaches to address addictive technology challenges in our communities.'),
  ('digital-divide', 'Digital Divide', 'Technology', 14, 41, 'Digital Divide: Connecting Everyone', 'Expanding access to technology and digital literacy for all community members.'),
  ('digital-privacy', 'Digital Privacy', 'Technology', 8, 15, 'Digital Privacy: Guarding Our Data', 'Protecting personal data and privacy rights in the digital age.'),
  ('digital-rights', 'Digital Rights', 'Technology', 6, 12, 'Digital Rights: Protecting Freedom and Privacy Online', 'Ensuring fundamental rights and freedoms in digital spaces.'),
  
  -- Economic Policy
  ('income-stagnation', 'Income Stagnation', 'Economic Policy', 16, 32, 'Income Stagnation: The Squeeze on Working Americans', 'Addressing wage stagnation and economic mobility challenges.'),
  ('end-stage-capitalism', 'End Stage Capitalism', 'Economic Policy', 2, 2, 'End-Stage Capitalism: Power and Inequality', 'Examining corporate consolidation and economic inequality.'),
  ('tax-fairness', 'Tax Fairness', 'Economic Policy', 10, 20, 'Tax Fairness: Making the System Work for All', 'Creating equitable tax structures for all income levels.'),
  ('small-business', 'Small Business Survival', 'Economic Policy', 12, 28, 'Small Business Survival: Leveling the Playing Field', 'Supporting local businesses against corporate competition.'),
  
  -- Healthcare
  ('healthcare-access', 'Healthcare Access', 'Healthcare', 20, 52, 'Healthcare Access: Bridging the Coverage Gap', 'Ensuring quality healthcare is accessible to all residents.'),
  ('mental-health', 'Mental Health Support', 'Healthcare', 12, 38, 'Mental Health Support: Bridging the Care Divide', 'Expanding mental health services and reducing stigma.'),
  ('elder-care', 'Elder Care', 'Healthcare', 7, 19, 'Elder Care: Dignity and Support for Aging Neighbors', 'Supporting aging populations with comprehensive care.'),
  ('substance-abuse', 'Substance Abuse', 'Healthcare', 15, 35, 'Substance Abuse: Healing Communities', 'Addressing addiction with treatment and support.'),
  ('reproductive-health', 'Reproductive Health', 'Healthcare', 9, 18, 'Reproductive Health: Safeguarding Personal Choice', 'Protecting access to reproductive healthcare services.'),
  
  -- Housing
  ('housing-crisis', 'Housing Crisis', 'Housing', 18, 45, 'Housing Crisis: Keeping Communities Together', 'Addressing affordability and availability of housing.'),
  ('homelessness', 'Homelessness', 'Housing', 12, 30, 'Homelessness: A Path to Stability', 'Creating pathways from homelessness to stable housing.'),
  
  -- Education
  ('education-access', 'Education Access', 'Education', 31, 78, 'Education Access: Opportunity for All', 'Ensuring quality education for all students.'),
  ('youth-opportunity', 'Youth Opportunity', 'Education', 10, 25, 'Youth Opportunity: Investing in the Next Generation', 'Creating pathways for youth development and success.'),
  ('financial-literacy', 'Financial Literacy', 'Education', 8, 16, 'Financial Literacy: Building Wealth for Everyone', 'Teaching essential financial skills to all communities.'),
  
  -- Social Issues
  ('cultural-divisions', 'Cultural Divisions', 'Social Issues', 1, 1, 'Cultural Divisions: Bridging America''s Fracture', 'Building bridges across political and cultural divides.'),
  ('social-isolation', 'Social Isolation', 'Social Connection', 11, 29, 'Social Isolation: Rebuilding Human Connection', 'Combating loneliness and rebuilding community connections.'),
  ('free-time', 'Free Time', 'Social Connection', 11, 20, 'Free Time: Restoring Balance', 'Promoting work-life balance and meaningful leisure.'),
  
  -- Infrastructure
  ('infrastructure', 'Aging Infrastructure', 'Infrastructure', 16, 42, 'Aging Infrastructure: Fixing the Foundations', 'Modernizing critical infrastructure systems.'),
  ('public-transit', 'Public Transit', 'Transportation', 10, 24, 'Public Transit Renewal: Getting America Moving', 'Expanding and modernizing public transportation.'),
  ('transportation-equity', 'Transportation Equity', 'Transportation', 8, 18, 'Transportation Equity: Access for All', 'Ensuring equitable access to transportation.'),
  
  -- Environmental
  ('climate-change', 'Climate Resilience', 'Environment', 25, 58, 'Climate Resilience at a Crossroads', 'Building resilience against climate change impacts.'),
  ('clean-air-water', 'Clean Air and Water', 'Environment', 12, 28, 'Clean Air and Water: Protecting Public Health', 'Protecting environmental health and safety.'),
  ('water-security', 'Water Security', 'Environment', 8, 16, 'Water Security: Averting the Next Crisis', 'Ensuring sustainable water resources.'),
  ('energy-transition', 'Energy Transition', 'Environment', 14, 32, 'Energy Transition: Powering a Sustainable Future', 'Transitioning to clean energy systems.'),
  
  -- Democracy & Governance
  ('civic-engagement', 'Civic Engagement', 'Democracy', 10, 22, 'Civic Engagement: Rebuilding Democratic Participation', 'Strengthening democratic participation.'),
  ('voter-access', 'Voter Access', 'Democracy', 8, 16, 'Voter Access: Strengthening Democracy', 'Protecting and expanding voting rights.'),
  ('fake-news', 'Fake News', 'Media', 1, 3, 'Fake News Threat: Defending Truth', 'Combating misinformation and disinformation.'),
  
  -- Public Safety
  ('criminal-justice', 'Criminal Justice Reform', 'Justice', 14, 35, 'Criminal Justice Reform: Toward Real Public Safety', 'Reforming the criminal justice system.'),
  ('community-safety', 'Community Safety', 'Public Safety', 12, 28, 'Community Safety: Trust, Not Just Enforcement', 'Building safer communities through trust.'),
  ('gun-violence', 'Gun Violence Prevention', 'Public Safety', 10, 24, 'Gun Violence Prevention: Community First', 'Preventing gun violence through community solutions.'),
  ('youth-justice', 'Youth Justice', 'Justice', 8, 18, 'Youth Justice: Breaking the Cycle', 'Reforming youth justice systems.'),
  
  -- Other Issues
  ('food-security', 'Food Security', 'Food & Agriculture', 9, 24, 'Food Security: Ending Hunger in Our Communities', 'Ensuring access to nutritious food for all.'),
  ('workplace-burnout', 'Workplace Burnout', 'Labor', 6, 15, 'Workplace Burnout: A Sustainable Work Culture', 'Addressing workplace stress and burnout.'),
  ('immigration-reform', 'Immigration Reform', 'Immigration', 12, 30, 'Immigration Reform: Pathways, Not Gridlock', 'Creating fair and practical immigration policies.'),
  ('veterans-affairs', 'Veterans Affairs', 'Veterans', 10, 25, 'Veterans Affairs: Keeping Our Promises', 'Supporting veterans and their families.'),
  ('disability-inclusion', 'Disability Inclusion', 'Social Issues', 8, 20, 'Disability Inclusion: Equal Access for All', 'Ensuring full inclusion for people with disabilities.'),
  ('arts-culture', 'Arts & Culture', 'Culture', 6, 14, 'Arts & Culture: Investing in Creative Communities', 'Supporting arts and cultural institutions.'),
  ('neighborhood-revitalization', 'Neighborhood Revitalization', 'Community', 10, 24, 'Neighborhood Revitalization: Beyond Gentrification', 'Revitalizing communities without displacement.'),
  ('urban-planning', 'Urban Planning', 'Planning', 12, 30, 'Urban Planning: Building Inclusive Cities', 'Creating equitable and sustainable urban environments.'),
  ('rural-development', 'Rural Development', 'Community', 8, 18, 'Rural Development: Bridging Urban-Rural Gaps', 'Supporting rural communities and economies.'),
  ('public-health', 'Public Health Preparedness', 'Healthcare', 10, 25, 'Public Health Preparedness: Ready for Tomorrow', 'Strengthening public health systems.'),
  ('disaster-response', 'Disaster Response', 'Emergency', 8, 20, 'Disaster Response: Reaching Everyone', 'Improving emergency response systems.'),
  ('science-research', 'Science Investment', 'Research', 6, 15, 'Science and Research Investment: Driving Progress', 'Supporting scientific research and innovation.');

-- Create index for faster lookups
CREATE INDEX idx_problem_cards_slug ON public.problem_cards(slug);
CREATE INDEX idx_problem_cards_policy_title ON public.problem_cards(policy_data_title);

-- Add comment explaining the table
COMMENT ON TABLE public.problem_cards IS 'Maps problem UI cards to policy data in "Top 50 Public Policy Problems" table';
COMMENT ON COLUMN public.problem_cards.policy_data_title IS 'Links to Title column in "Top 50 Public Policy Problems" table';