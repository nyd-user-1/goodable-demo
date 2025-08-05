import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Download, 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Info,
  BookOpen,
  FileText
} from "lucide-react";

const LawsAdminSimple = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [lawCount, setLawCount] = useState(0);

  // Redirect if not admin (basic check)
  if (!user || user.email !== 'admin@goodable.dev') {
    return <Navigate to="/laws" replace />;
  }

  const handleCheckProgress = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      // Get law count from database
      const { count, error } = await supabase
        .from("ny_laws")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      
      setLawCount(count || 0);
      setMessage(`Found ${count || 0} laws in database`);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncTest = async () => {
    setLoading(true);
    setMessage("Testing sync functionality...");
    
    try {
      const { data, error } = await supabase.functions.invoke(
        'nys-legislation-search',
        { body: { action: 'get-progress' } }
      );

      if (error) throw error;
      
      setMessage(`Sync test successful! API responded with data: ${JSON.stringify(data)}`);
    } catch (error: any) {
      setMessage(`Sync test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Laws Database Admin (Simple)</h1>
            <p className="text-muted-foreground mt-2">
              Basic admin panel for testing database connectivity
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Admin Panel
          </Badge>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Laws</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lawCount}</div>
              <p className="text-xs text-muted-foreground">In database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Ready</div>
              <p className="text-xs text-muted-foreground">System operational</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User</CardTitle>
              <Info className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">{user.email}</div>
              <p className="text-xs text-muted-foreground">Admin access</p>
            </CardContent>
          </Card>
        </div>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Database Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={handleCheckProgress}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                Check Database
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleSyncTest}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
                Test Sync API
              </Button>
            </div>

            {/* Status Messages */}
            {message && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This is a simplified admin panel for testing. Use "Check Database" to verify 
            table connectivity and "Test Sync API" to test the edge function.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default LawsAdminSimple;