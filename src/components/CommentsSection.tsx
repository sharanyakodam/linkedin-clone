import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  text: string;
  created_at: string;
  profiles: {
    name: string;
  };
  author_id: string;
}

interface CommentsSectionProps {
  postId: string;
  userId: string;
}

export const CommentsSection = ({ postId, userId }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (showComments) {
      fetchComments();
      
      const channel = supabase
        .channel(`post-comments-${postId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'comments',
            filter: `post_id=eq.${postId}`,
          },
          () => {
            fetchComments();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [postId, showComments]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        id,
        text,
        created_at,
        author_id,
        profiles (name)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || loading) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        author_id: userId,
        text: newComment.trim(),
      });

      if (error) throw error;

      setNewComment("");
      toast({
        title: "Success",
        description: "Comment added!",
      });
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

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="gap-2"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm">{comments.length}</span>
      </Button>

      {showComments && (
        <div className="mt-4 space-y-4 animate-slide-up">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3 animate-fade-in">
              <Avatar className="h-8 w-8 bg-primary">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(comment.profiles.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-secondary rounded-lg p-3">
                  <p className="font-semibold text-sm">{comment.profiles.name}</p>
                  <p className="text-sm text-foreground mt-1">{comment.text}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}

          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px]"
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !newComment.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
