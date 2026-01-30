import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotePersistence } from "@/hooks/useNotePersistence";

export default function NewNote() {
  const navigate = useNavigate();
  const { createNote } = useNotePersistence();
  const creating = useRef(false);

  useEffect(() => {
    if (creating.current) return;
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
  }, []);

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
