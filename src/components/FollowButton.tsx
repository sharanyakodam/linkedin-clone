import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FollowButtonProps {
  currentUserId: string;
  targetUserId: string;
}

export const FollowButton = ({ currentUserId, targetUserId }: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkFollowStatus();
  }, [currentUserId, targetUserId]);

  const checkFollowStatus = async () => {
    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUserId)
      .eq("following_id", targetUserId)
      .maybeSingle();

    setIsFollowing(!!data);
  };

  const handleFollow = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", targetUserId);

        if (error) throw error;
        toast({ title: "Unfollowed successfully" });
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: currentUserId, following_id: targetUserId });

        if (error) throw error;
        toast({ title: "Following successfully" });
      }
      setIsFollowing(!isFollowing);
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

  if (currentUserId === targetUserId) return null;

  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className="gap-2"
    >
      {isFollowing ? (
        <>
          <UserMinus className="w-4 h-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          Follow
        </>
      )}
    </Button>
  );
};
