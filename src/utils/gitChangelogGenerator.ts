export interface GitCommit {
  hash: string;
  date: string;
  message: string;
  author: string;
  files: string[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  description: string;
  commits: GitCommit[];
  features: ChangelogFeature[];
  isLatest?: boolean;
}

export interface ChangelogFeature {
  title: string;
  description: string;
  category: string;
  type: 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'perf' | 'test' | 'chore';
}

export class GitChangelogGenerator {
  private static parseCommitMessage(message: string): {
    type: string;
    scope?: string;
    description: string;
    isBreaking: boolean;
  } {
    // Parse conventional commit format: type(scope): description
    const conventionalRegex = /^(\w+)(?:\(([^)]+)\))?\!?:\s*(.+)$/;
    const match = message.match(conventionalRegex);
    
    if (match) {
      const [, type, scope, description] = match;
      return {
        type: type.toLowerCase(),
        scope,
        description,
        isBreaking: message.includes('!')
      };
    }
    
    // Fallback parsing for non-conventional commits
    const firstLine = message.split('\n')[0];
    if (firstLine.toLowerCase().startsWith('feat')) {
      return { type: 'feat', description: firstLine, isBreaking: false };
    } else if (firstLine.toLowerCase().startsWith('fix')) {
      return { type: 'fix', description: firstLine, isBreaking: false };
    } else {
      return { type: 'chore', description: firstLine, isBreaking: false };
    }
  }

  private static categorizeCommit(type: string, scope?: string): string {
    const categoryMap: Record<string, string> = {
      'feat': scope ? this.scopeToCategory(scope) : 'Features',
      'fix': 'Bug Fixes',
      'docs': 'Documentation',
      'style': 'Styling',
      'refactor': 'Code Improvements',
      'perf': 'Performance',
      'test': 'Testing',
      'chore': scope ? this.scopeToCategory(scope) : 'Maintenance',
      'build': 'Build System',
      'ci': 'CI/CD'
    };
    
    return categoryMap[type] || 'Other';
  }

  private static scopeToCategory(scope: string): string {
    const scopeMap: Record<string, string> = {
      'ui': 'UI/UX',
      'ux': 'UI/UX',
      'auth': 'Authentication',
      'api': 'API',
      'db': 'Database',
      'search': 'Search',
      'chat': 'AI Chat',
      'bills': 'Bills',
      'members': 'Members',
      'committees': 'Committees',
      'dashboard': 'Dashboard',
      'analytics': 'Analytics',
      'performance': 'Performance',
      'accessibility': 'Accessibility',
      'mobile': 'Mobile',
      'desktop': 'Desktop'
    };
    
    return scopeMap[scope.toLowerCase()] || 'Features';
  }

  public static async fetchGitCommits(): Promise<GitCommit[]> {
    try {
      // Try to fetch from the API endpoint first
      const response = await fetch('/api/git/commits.json').catch(() => null);
      
      if (response?.ok) {
        const commits = await response.json();
        return commits;
      }
      
      // Try to fetch from changelog.json if available
      const changelogResponse = await fetch('/api/changelog.json').catch(() => null);
      if (changelogResponse?.ok) {
        const changelog = await changelogResponse.json();
        const allCommits: GitCommit[] = [];
        changelog.forEach((entry: any) => {
          if (entry.commits) {
            allCommits.push(...entry.commits);
          }
        });
        return allCommits;
      }
      
      // Fallback: Return mock data that represents recent commits
      return this.getMockCommits();
    } catch (error) {
      console.error('Failed to fetch git commits:', error);
      return this.getMockCommits();
    }
  }

  private static getMockCommits(): GitCommit[] {
    return [
      {
        hash: 'd0c83e98',
        date: '2025-07-23T10:30:00Z',
        message: 'feat: Radix color system with light/dark mode',
        author: 'Claude Code',
        files: ['src/index.css', 'tailwind.config.ts']
      },
      {
        hash: 'a1b2c3d4',
        date: '2025-07-22T15:45:00Z',
        message: 'feat(ui): Implement Perplexity-style autocomplete combobox',
        author: 'Claude Code',
        files: ['src/components/AutocompleteCombobox.tsx', 'src/pages/Home.tsx']
      },
      {
        hash: 'e5f6g7h8',
        date: '2025-07-22T14:20:00Z',
        message: 'enhance(ux): Add Magic UI components and filter improvements',
        author: 'Claude Code',
        files: ['src/components/magicui/', 'src/components/features/']
      }
    ];
  }

  public static generateChangelogFromCommits(commits: GitCommit[]): ChangelogEntry[] {
    // Group commits by date/version
    const groupedCommits = this.groupCommitsByVersion(commits);
    
    return groupedCommits.map((group, index) => {
      const features = group.commits
        .map(commit => this.commitToFeature(commit))
        .filter(Boolean) as ChangelogFeature[];

      return {
        version: group.version,
        date: group.date,
        title: this.generateVersionTitle(features),
        description: this.generateVersionDescription(features),
        commits: group.commits,
        features,
        isLatest: index === 0
      };
    });
  }

  private static groupCommitsByVersion(commits: GitCommit[]): Array<{
    version: string;
    date: string;
    commits: GitCommit[];
  }> {
    // Sort commits by date (newest first)
    const sortedCommits = [...commits].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Group by day/week for auto-versioning
    const groups: Array<{ version: string; date: string; commits: GitCommit[] }> = [];
    let currentGroup: GitCommit[] = [];
    let lastDate: Date | null = null;
    let versionCounter = 1;

    for (const commit of sortedCommits) {
      const commitDate = new Date(commit.date);
      
      if (!lastDate || this.shouldCreateNewVersion(lastDate, commitDate)) {
        if (currentGroup.length > 0) {
          groups.push({
            version: `v${versionCounter}.${groups.length}.0`,
            date: this.formatDate(lastDate!),
            commits: [...currentGroup]
          });
        }
        currentGroup = [commit];
        lastDate = commitDate;
      } else {
        currentGroup.push(commit);
      }
    }

    // Add the last group
    if (currentGroup.length > 0) {
      groups.push({
        version: `v${versionCounter}.${groups.length}.0`,
        date: this.formatDate(lastDate!),
        commits: currentGroup
      });
    }

    return groups;
  }

  private static shouldCreateNewVersion(lastDate: Date, currentDate: Date): boolean {
    // Create new version if commits are more than 1 day apart
    const daysDiff = Math.abs(lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > 1;
  }

  private static commitToFeature(commit: GitCommit): ChangelogFeature | null {
    const parsed = this.parseCommitMessage(commit.message);
    
    if (parsed.type === 'chore' && !parsed.scope) {
      return null; // Skip generic chore commits
    }

    return {
      title: this.extractFeatureTitle(parsed.description),
      description: parsed.description,
      category: this.categorizeCommit(parsed.type, parsed.scope),
      type: parsed.type as ChangelogFeature['type']
    };
  }

  private static extractFeatureTitle(description: string): string {
    // Extract a clean title from the commit description
    return description
      .replace(/^(add|implement|create|fix|update|enhance|improve)\s*/i, '')
      .replace(/^\w/, c => c.toUpperCase());
  }

  private static generateVersionTitle(features: ChangelogFeature[]): string {
    const hasFeatures = features.some(f => f.type === 'feat');
    const hasFixes = features.some(f => f.type === 'fix');
    const hasUI = features.some(f => f.category.includes('UI'));
    
    if (hasFeatures && hasUI) {
      return 'Enhanced User Experience & New Features';
    } else if (hasFeatures) {
      return 'New Features & Improvements';
    } else if (hasFixes) {
      return 'Bug Fixes & Stability Improvements';
    } else {
      return 'Platform Updates';
    }
  }

  private static generateVersionDescription(features: ChangelogFeature[]): string {
    const categories = [...new Set(features.map(f => f.category))];
    const categoriesText = categories.slice(0, 3).join(', ');
    
    return `Updates and improvements across ${categoriesText}${categories.length > 3 ? ' and more' : ''}.`;
  }

  private static formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}