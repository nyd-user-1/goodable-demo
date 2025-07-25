import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdvancedSearchCombobox } from '@/components/features/feed/AdvancedSearchCombobox';
import { LegislativeFeedContainer } from '@/components/features/feed/LegislativeFeedContainer';
import { LegislativeRightSidebar } from '@/components/features/feed/LegislativeRightSidebar';

const FeedPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [greeting, setGreeting] = useState('Good morning');

  // Set dynamic greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
    // TODO: Implement search functionality with API integrations
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.display_name) return user.user_metadata.display_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'there';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="space-y-6">
              {/* Header with greeting */}
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {greeting}, {getUserDisplayName()}!
                </h1>
                <p className="text-lg text-muted-foreground">
                  Stay updated on legislative developments and policy changes
                </p>
              </div>

              {/* Advanced Search Interface */}
              <div className="space-y-4">
                <AdvancedSearchCombobox
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSubmit={handleSearch}
                  placeholder="Ask anything about legislation, policies, or lawmakers..."
                />
              </div>

              {/* Legislative Feed */}
              <LegislativeFeedContainer searchQuery={searchQuery} />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-6">
              <LegislativeRightSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;