import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const messages = [
  { text: "You're putting the public back in public policy.", colorClass: "bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200" },
  { text: "It has meaning if you give it meaning.", colorClass: "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200" },
  { text: "No one is coming. It's up to you now.", colorClass: "bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-200" },
  { text: "Wow! That idea you have is a good one. Tell us about it.", colorClass: "bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200" },
  { text: "Remember, we're all in this boat together.", colorClass: "bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-200" },
  { text: "Are you looking for someone to follow. Or something to do? We've got'em both.", colorClass: "bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200" }
];

export const WelcomeMessage = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('Good morning');
  const [messageIndex, setMessageIndex] = useState(0);

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

  // Get message index from session storage or initialize
  useEffect(() => {
    const storedIndex = sessionStorage.getItem('welcomeMessageIndex');
    if (storedIndex) {
      setMessageIndex(parseInt(storedIndex));
    }
  }, []);

  // Rotate message on each page load
  useEffect(() => {
    const nextIndex = (messageIndex + 1) % messages.length;
    sessionStorage.setItem('welcomeMessageIndex', nextIndex.toString());
  }, []);

  const getUserDisplayName = () => {
    if (user?.user_metadata?.display_name) return user.user_metadata.display_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'there';
  };

  const currentMessage = messages[messageIndex];

  // Only show for authenticated users
  if (!user) return null;

  return (
    <div className={`px-3 py-2 rounded-md text-sm ${currentMessage.colorClass}`}>
      <div className="font-medium">
        {greeting}, {getUserDisplayName()}!
      </div>
      <div className="mt-1">
        {currentMessage.text}
      </div>
    </div>
  );
};