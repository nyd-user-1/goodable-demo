import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ReviewStatus = 'support' | 'oppose' | 'neutral' | null;

export interface BillReview {
  id: string;
  user_id: string;
  bill_id: number;
  review_status: ReviewStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export const useBillReviews = () => {
  const [reviews, setReviews] = useState<BillReview[]>([]);
  const [reviewsByBillId, setReviewsByBillId] = useState<Map<number, BillReview>>(new Map());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReviews = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setReviews([]);
        setReviewsByBillId(new Map());
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_bill_reviews")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const reviewsData = (data || []) as BillReview[];
      setReviews(reviewsData);

      const reviewMap = new Map<number, BillReview>();
      reviewsData.forEach(review => {
        reviewMap.set(review.bill_id, review);
      });
      setReviewsByBillId(reviewMap);
    } catch (error) {
      console.error("Failed to load bill reviews:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getReviewForBill = useCallback((billId: number): BillReview | undefined => {
    return reviewsByBillId.get(billId);
  }, [reviewsByBillId]);

  const setReviewStatus = useCallback(async (billId: number, status: ReviewStatus) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to review bills",
          variant: "destructive",
        });
        return;
      }

      const existingReview = reviewsByBillId.get(billId);

      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from("user_bill_reviews")
          .update({ review_status: status })
          .eq("id", existingReview.id);

        if (error) throw error;

        // Update local state
        const updatedReview = { ...existingReview, review_status: status, updated_at: new Date().toISOString() };
        setReviewsByBillId(prev => new Map(prev).set(billId, updatedReview));
        setReviews(prev => prev.map(r => r.id === existingReview.id ? updatedReview : r));
      } else {
        // Create new review
        const { data, error } = await supabase
          .from("user_bill_reviews")
          .insert({
            user_id: user.id,
            bill_id: billId,
            review_status: status,
          })
          .select()
          .single();

        if (error) throw error;

        const newReview = data as BillReview;
        setReviewsByBillId(prev => new Map(prev).set(billId, newReview));
        setReviews(prev => [newReview, ...prev]);
      }

      const statusLabel = status === 'support' ? 'Support' : status === 'oppose' ? 'Oppose' : 'Neutral';
      toast({
        title: "Review saved",
        description: `Bill marked as "${statusLabel}"`,
      });
    } catch (error) {
      console.error("Failed to save review status:", error);
      toast({
        title: "Error",
        description: "Failed to save review status",
        variant: "destructive",
      });
    }
  }, [reviewsByBillId, toast]);

  const saveNote = useCallback(async (billId: number, note: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add notes",
          variant: "destructive",
        });
        return;
      }

      const existingReview = reviewsByBillId.get(billId);

      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from("user_bill_reviews")
          .update({ note })
          .eq("id", existingReview.id);

        if (error) throw error;

        // Update local state
        const updatedReview = { ...existingReview, note, updated_at: new Date().toISOString() };
        setReviewsByBillId(prev => new Map(prev).set(billId, updatedReview));
        setReviews(prev => prev.map(r => r.id === existingReview.id ? updatedReview : r));
      } else {
        // Create new review with just a note
        const { data, error } = await supabase
          .from("user_bill_reviews")
          .insert({
            user_id: user.id,
            bill_id: billId,
            note,
          })
          .select()
          .single();

        if (error) throw error;

        const newReview = data as BillReview;
        setReviewsByBillId(prev => new Map(prev).set(billId, newReview));
        setReviews(prev => [newReview, ...prev]);
      }

      toast({
        title: "Note saved",
        description: "Your note has been saved",
      });
    } catch (error) {
      console.error("Failed to save note:", error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    }
  }, [reviewsByBillId, toast]);

  const saveReview = useCallback(async (billId: number, status: ReviewStatus, note: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to review bills",
          variant: "destructive",
        });
        return;
      }

      const existingReview = reviewsByBillId.get(billId);

      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from("user_bill_reviews")
          .update({ review_status: status, note })
          .eq("id", existingReview.id);

        if (error) throw error;

        // Update local state
        const updatedReview = { ...existingReview, review_status: status, note, updated_at: new Date().toISOString() };
        setReviewsByBillId(prev => new Map(prev).set(billId, updatedReview));
        setReviews(prev => prev.map(r => r.id === existingReview.id ? updatedReview : r));
      } else {
        // Create new review
        const { data, error } = await supabase
          .from("user_bill_reviews")
          .insert({
            user_id: user.id,
            bill_id: billId,
            review_status: status,
            note,
          })
          .select()
          .single();

        if (error) throw error;

        const newReview = data as BillReview;
        setReviewsByBillId(prev => new Map(prev).set(billId, newReview));
        setReviews(prev => [newReview, ...prev]);
      }

      toast({
        title: "Review saved",
        description: "Your review has been saved",
      });
    } catch (error) {
      console.error("Failed to save review:", error);
      toast({
        title: "Error",
        description: "Failed to save review",
        variant: "destructive",
      });
    }
  }, [reviewsByBillId, toast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    reviewsByBillId,
    loading,
    getReviewForBill,
    setReviewStatus,
    saveNote,
    saveReview,
    refetch: fetchReviews,
  };
};
