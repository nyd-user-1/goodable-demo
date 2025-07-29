interface BlogHeaderProps {
  postsCount: number;
  categoriesCount: number;
}

export const BlogHeader = ({ postsCount, categoriesCount }: BlogHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-foreground mb-2">
        Policy Blog
      </h1>
      <p className="text-xl text-muted-foreground mb-4">
        Insights, analysis, and discussions on policy, governance, and civic engagement.
      </p>
      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <span>{postsCount} articles found</span>
        <span>•</span>
        <span>{categoriesCount} categories</span>
      </div>
    </div>
  );
};