import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LikeButtonProps {
  postId: string;
  userId: string;
  initialLikesCount: number;
  initialIsLiked: boolean;
}

export const LikeButton = ({ postId, userId, initialLikesCount, initialIsLiked }: LikeButtonProps) => {
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel(`post-likes-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchLikes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const fetchLikes = async () => {
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    const { data: userLike } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();

    setLikesCount(count || 0);
    setIsLiked(!!userLike);
  };

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (isLiked) {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: userId });

        if (error) throw error;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={loading}
      className="gap-2 transition-all duration-200 hover:scale-105"
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
        }`}
      />
      <span className="text-sm">{likesCount}</span>
    </Button>
  );
};
