import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      navigate('/new-chat');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted/20 flex min-h-screen">
      {/* Left side - Testimonial */}
      <div className="relative hidden lg:flex lg:w-1/2">
        <div className="relative h-full w-full">
          <img
            src="https://images.unsplash.com/photo-1734336056841-8f4dd3ca6e32?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Testimonial background"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />

          {/* Logo */}
          <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white">
            <span className="text-xl font-semibold">Goodable</span>
          </Link>

          {/* Testimonial */}
          <div className="absolute right-8 bottom-8 left-8 text-white">
            <blockquote className="mb-4 text-2xl font-medium">
              &quot;Goodable transformed how we track legislation and engage with our representatives.&quot;
            </blockquote>
            <div>
              <div className="font-medium">Policy Advocate</div>
              <div className="text-sm opacity-90">
                Nonprofit Organization
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <Link to="/" className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <span className="text-xl font-semibold">Goodable</span>
          </Link>

          <div className="space-y-2 text-center">
            <h1 className="text-foreground text-2xl font-bold">
              Welcome back to Goodable
            </h1>
            <p className="text-muted-foreground">
              Track legislation, engage with democracy, and make your voice heard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-foreground text-sm font-medium"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-foreground text-sm font-medium"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
              <div className="text-right">
                <a
                  href="#"
                  className="text-primary hover:text-primary/80 text-sm"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label
                htmlFor="remember"
                className="text-foreground text-sm font-medium"
              >
                Remember sign in details
              </Label>
              <Switch
                id="remember"
                checked={rememberMe}
                onCheckedChange={setRememberMe}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? 'Signing in...' : 'Log In'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="border-border w-full border-t" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background text-muted-foreground px-2">
                  OR
                </span>
              </div>
            </div>

            <Button variant="outline" className="w-full py-3" type="button">
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <p className="text-muted-foreground text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link
                to="/auth-4"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Sign up
              </Link>
            </p>
          </form>

          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            By clicking continue, you agree to our{" "}
            <a href="/terms">Terms of Service</a> and{" "}
            <a href="/privacy">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
