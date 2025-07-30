import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Redirect from /public-policy to /blog with category filter
export default function PublicPolicyRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Preserve any existing search params and add proposals category
    const params = new URLSearchParams(searchParams);
    params.set('category', 'proposals');
    
    navigate(`/blog?${params.toString()}`, { replace: true });
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-muted-foreground">Taking you to the blog proposals section.</p>
      </div>
    </div>
  );
}