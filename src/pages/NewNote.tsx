import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotePersistence } from "@/hooks/useNotePersistence";
import { Button } from "@/components/ui/button";

export default function NewNote() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createNote } = useNotePersistence();
  const creating = useRef(false);

  useEffect(() => {
    if (!user || creating.current) return;
    creating.current = true;

    createNote({
      title: "Untitled Note",
      content: "",
    }).then((note) => {
      if (note?.id) {
        window.dispatchEvent(new Event("refresh-sidebar-notes"));
        navigate(`/n/${note.id}`, { replace: true });
      }
    }).catch((err) => {
      console.error("Failed to create note:", err);
      creating.current = false;
    });
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">Please log in to create notes.</p>
        <Button onClick={() => navigate("/auth-2")} className="font-semibold">
          Sign Up
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span className="text-sm">Creating note...</span>
      </div>
    </div>
  );
}
