import { useToast } from "@/hooks/use-toast";

export const useChatActions = () => {
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleFeedback = (type: "thumbs-up" | "thumbs-down") => {
    toast({
      title: "Feedback recorded",
      description: `Thank you for your ${type === "thumbs-up" ? "positive" : "negative"} feedback`,
    });
  };

  return {
    copyToClipboard,
    handleFeedback,
  };
};