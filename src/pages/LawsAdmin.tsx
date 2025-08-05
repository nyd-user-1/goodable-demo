import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useLawsData } from "@/hooks/useLawsData";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
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

const LawsAdmin = () => {
  const { user } = useAuth();
  const { 
    allLaws, 
    totalFilteredCount, 
    loading, 
    syncAllLaws, 
    syncSingleLaw, 
    getSyncProgress 
  } = useLawsData();
  
  const [syncStatus, setSyncStatus] = useState<{
    inProgress: boolean;
    progress: number;
    message: string;
    result?: any;
  }>({
    inProgress: false,
    progress: 0,
    message: ""
  });

  const [progressData, setProgressData] = useState<{
    totalLaws: number;
    totalSections: number;
    recentUpdates: any[];
  } | null>(null);

  // Redirect if not admin (basic check - you can enhance this)
  if (!user || user.email !== 'admin@goodable.dev') {
    return <Navigate to="/laws" replace />;
  }

  const handleSyncAll = async () => {
    setSyncStatus({
      inProgress: true,
      progress: 0,
      message: "Starting sync of all NY consolidated laws..."
    });

    try {
      const result = await syncAllLaws();
      setSyncStatus({
        inProgress: false,
        progress: 100,
        message: `Sync completed! Processed ${result.processed}/${result.totalLaws} laws`,
        result
      });
    } catch (error) {
      setSyncStatus({
        inProgress: false,
        progress: 0,
        message: `Sync failed: ${error.message}`,
      });
    }
  };

  const handleGetProgress = async () => {
    try {
      const progress = await getSyncProgress();
      setProgressData(progress);
    } catch (error) {
      console.error("Failed to get progress:", error);
    }
  };

  const handleSyncSingle = async (lawId: string) => {
    try {
      await syncSingleLaw(lawId);
    } catch (error) {
      console.error("Failed to sync law:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Laws Database Admin</h1>
            <p className="text-muted-foreground mt-2">
              Manage NY State Laws database synchronization and monitoring
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
              <div className="text-2xl font-bold">{totalFilteredCount}</div>
              <p className="text-xs text-muted-foreground">In database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progressData?.totalSections || "—"}
              </div>
              <p className="text-xs text-muted-foreground">Law sections</p>
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
        </div>

        {/* Sync Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Synchronization
            </CardTitle>
            <CardDescription>
              Sync NY State Laws from the official NYS Senate API. This process may take several hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={handleSyncAll}
                disabled={syncStatus.inProgress || loading}
                className="flex items-center gap-2"
              >
                {syncStatus.inProgress ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Sync All Laws
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleGetProgress}
                className="flex items-center gap-2"
              >
                <Info className="h-4 w-4" />
                Check Progress
              </Button>
            </div>

            {/* Progress Bar */}
            {syncStatus.inProgress && (
              <div className="space-y-2">
                <Progress value={syncStatus.progress} className="w-full" />
                <p className="text-sm text-muted-foreground">{syncStatus.message}</p>
              </div>
            )}

            {/* Status Messages */}
            {syncStatus.message && !syncStatus.inProgress && (
              <Alert className={syncStatus.result?.success ? "" : "border-destructive"}>
                {syncStatus.result?.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{syncStatus.message}</AlertDescription>
              </Alert>
            )}

            {/* Sync Results */}
            {syncStatus.result && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Sync Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Laws</p>
                      <p className="font-semibold">{syncStatus.result.totalLaws}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Processed</p>
                      <p className="font-semibold text-green-600">{syncStatus.result.processed}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Errors</p>
                      <p className="font-semibold text-red-600">{syncStatus.result.errors}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-semibold">{syncStatus.result.duration}</p>
                    </div>
                  </div>
                  
                  {syncStatus.result.errorDetails && syncStatus.result.errorDetails.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Error Details:</h4>
                      <div className="space-y-1 text-sm">
                        {syncStatus.result.errorDetails.map((error: any, index: number) => (
                          <div key={index} className="text-red-600">
                            {error.lawId}: {error.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Database Status */}
        {progressData && (
          <Card>
            <CardHeader>
              <CardTitle>Database Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Laws:</span>
                      <span className="font-semibold">{progressData.totalLaws}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Sections:</span>
                      <span className="font-semibold">{progressData.totalSections}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Recent Updates</h4>
                  <div className="space-y-2 text-sm">
                    {progressData.recentUpdates?.slice(0, 5).map((law: any) => (
                      <div key={law.law_id} className="flex justify-between">
                        <span className="truncate">{law.name}</span>
                        <span className="text-muted-foreground ml-2">
                          {law.total_sections} sections
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warning */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> The full sync process downloads and processes all NY consolidated laws. 
            This may take 3-6 hours and should be run during off-peak hours. Ensure you have a valid 
            NYS_LEGISLATION_API_KEY configured in your environment variables.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default LawsAdmin;