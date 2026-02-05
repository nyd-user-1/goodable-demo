import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function NewExcerpt() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is authenticated, show a message about how excerpts work
  if (user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-4 text-center">
        <p className="text-muted-foreground max-w-md">
          Excerpts are created from within a chat. Start a conversation, then save any exchange as an excerpt for quick reference later.
        </p>
        <Button onClick={() => navigate("/")} className="bg-black text-white hover:bg-black/90 font-semibold">
          Start a Chat
        </Button>
      </div>
    );
  }

  // Unauthenticated user view
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 px-4 text-center">
      <p className="text-muted-foreground max-w-md">
        Please log in to create excerpts. Excerpts let you save individual chat exchanges for quick reference later.
      </p>
      <div className="flex gap-3">
        <Button
          onClick={() => navigate("/auth-4")}
          className="bg-black text-white hover:bg-black/90 font-semibold"
        >
          Sign Up
        </Button>
        <Button
          onClick={() => navigate("/auth")}
          variant="outline"
          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
        >
          Log In
        </Button>
      </div>
    </div>
  );
}
