import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Law {
  id: number;
  law_id: string;
  name: string;
  chapter: string;
  law_type: string;
  total_sections: number;
}

const LawsMinimal = () => {
  const [laws, setLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLaws = async () => {
      try {
        console.log("Fetching laws...");
        const { data, error: fetchError } = await supabase
          .from("ny_laws")
          .select("id, law_id, name, chapter, law_type, total_sections")
          .order("name", { ascending: true });

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
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">NY State Laws</h1>
        <p>Loading laws...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">NY State Laws</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">NY State Laws</h1>
      
      <div className="mb-4">
        <p className="text-gray-600">Found {laws.length} laws in database</p>
      </div>

      <div className="grid gap-4">
        {laws.map((law) => (
          <div key={law.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-lg">{law.name}</h3>
            <div className="text-sm text-gray-600 mt-2">
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                {law.law_id}
              </span>
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                Chapter {law.chapter}
              </span>
              <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded">
                {law.total_sections} sections
              </span>
            </div>
          </div>
        ))}
      </div>

      {laws.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No laws found in database.</p>
        </div>
      )}
    </div>
  );
};

export default LawsMinimal;