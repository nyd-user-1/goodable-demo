import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LawDetail } from "@/components/LawDetail";
import { Tables } from "@/integrations/supabase/types";

type Law = Tables<"ny_laws">;

const LawsClean = () => {
  const navigate = useNavigate();
  const [laws, setLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLaw, setSelectedLaw] = useState<Law | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

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

  const handleLawClick = (law: Law, index: number) => {
    setSelectedLaw(law);
    setCurrentIndex(index);
  };

  const handleBack = () => {
    setSelectedLaw(null);
    setCurrentIndex(-1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setSelectedLaw(laws[newIndex]);
      setCurrentIndex(newIndex);
    }
  };

  const handleNext = () => {
    if (currentIndex < laws.length - 1) {
      const newIndex = currentIndex + 1;
      setSelectedLaw(laws[newIndex]);
      setCurrentIndex(newIndex);
    }
  };

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading laws...</div>;
  }

  if (error) {
    return <div style={{ padding: "2rem", color: "red" }}>Error: {error}</div>;
  }

  if (selectedLaw) {
    return (
      <LawDetail
        law={selectedLaw}
        onBack={handleBack}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={currentIndex > 0}
        hasNext={currentIndex < laws.length - 1}
      />
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
        NY State Laws
      </h1>
      
      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p>Found {laws.length} laws in database:</p>
        <button
          onClick={() => navigate("/laws/admin")}
          style={{
            backgroundColor: "#3B82F6",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontSize: "0.875rem"
          }}
        >
          Admin Panel
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {laws.map((law, index) => (
          <div 
            key={law.id} 
            onClick={() => handleLawClick(law, index)}
            style={{ 
              padding: "1rem", 
              border: "1px solid #ccc", 
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
              cursor: "pointer",
              transition: "all 0.2s ease",
              ":hover": {
                backgroundColor: "#e8f4f8",
                borderColor: "#3B82F6"
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e8f4f8";
              e.currentTarget.style.borderColor = "#3B82F6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f9f9f9";
              e.currentTarget.style.borderColor = "#ccc";
            }}
          >
            <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
              {law.name}
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>
              ID: {law.law_id} | Chapter: {law.chapter} | Type: {law.law_type}
            </p>
            <p style={{ fontSize: "0.75rem", color: "#888" }}>
              {law.total_sections} sections • Click to view details
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