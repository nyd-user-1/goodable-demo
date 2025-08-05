import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const LawsTest = () => {
  const [laws, setLaws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLaws = async () => {
      try {
        console.log("Fetching laws...");
        const { data, error: fetchError } = await supabase
          .from("ny_laws")
          .select("*")
          .limit(10);

        if (fetchError) {
          console.error("Supabase error:", fetchError);
          throw fetchError;
        }

        console.log("Laws data:", data);
        setLaws(data || []);
      } catch (err: unknown) {
        console.error("Error fetching laws:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch laws");
      } finally {
        setLoading(false);
      }
    };

    fetchLaws();
  }, []);

  if (loading) {
    return <div className="p-8">Loading laws...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Laws Test Page</h1>
      
      <div className="mb-4">
        <p>Found {laws.length} laws in database:</p>
      </div>

      <div className="space-y-4">
        {laws.map((law) => (
          <div key={law.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{law.name}</h3>
            <p className="text-sm text-gray-600">
              ID: {law.law_id} | Chapter: {law.chapter} | Type: {law.law_type}
            </p>
          </div>
        ))}
      </div>

      {laws.length === 0 && (
        <div className="text-gray-600">
          No laws found in database. Make sure the migration ran successfully.
        </div>
      )}
    </div>
  );
};

export default LawsTest;