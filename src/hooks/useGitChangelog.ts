import { useState, useEffect } from 'react';
import { GitChangelogGenerator, ChangelogEntry } from '@/utils/gitChangelogGenerator';

export const useGitChangelog = () => {
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateChangelog = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const commits = await GitChangelogGenerator.fetchGitCommits();
        const changelogEntries = GitChangelogGenerator.generateChangelogFromCommits(commits);
        
        setChangelog(changelogEntries);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate changelog');
        console.error('Changelog generation error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    generateChangelog();
  }, []);

  const refreshChangelog = async () => {
    const commits = await GitChangelogGenerator.fetchGitCommits();
    const changelogEntries = GitChangelogGenerator.generateChangelogFromCommits(commits);
    setChangelog(changelogEntries);
  };

  return {
    changelog,
    isLoading,
    error,
    refreshChangelog
  };
};