import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const LawsClean = () => {
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
      } catch (err: any) {
        console.error("Error fetching laws:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLaws();
  }, []);

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading laws...</div>;
  }

  if (error) {
    return <div style={{ padding: "2rem", color: "red" }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
        NY State Laws
      </h1>
      
      <div style={{ marginBottom: "1rem" }}>
        <p>Found {laws.length} laws in database:</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {laws.map((law) => (
          <div 
            key={law.id} 
            style={{ 
              padding: "1rem", 
              border: "1px solid #ccc", 
              borderRadius: "8px",
              backgroundColor: "#f9f9f9"
            }}
          >
            <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
              {law.name}
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#666" }}>
              ID: {law.law_id} | Chapter: {law.chapter} | Type: {law.law_type}
            </p>
          </div>
        ))}
      </div>

      {laws.length === 0 && (
        <div style={{ color: "#666" }}>
          No laws found in database. Make sure the migration ran successfully.
        </div>
      )}
    </div>
  );
};

export default LawsClean;