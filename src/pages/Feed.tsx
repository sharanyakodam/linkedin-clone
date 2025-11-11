import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { CreatePost } from "@/components/CreatePost";
import { PostCard } from "@/components/PostCard";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface Post {
  id: string;
  text: string;
  image_url: string | null;
  created_at: string;
  author_id: string;
  profiles: {
    name: string;
  };
}

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        text,
        image_url,
        created_at,
        author_id,
        profiles (
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <CreatePost onPostCreated={fetchPosts} />

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const getLikesCount = async () => {
                const { count } = await supabase
                  .from("likes")
                  .select("*", { count: "exact", head: true })
                  .eq("post_id", post.id);
                return count || 0;
              };

              const getIsLiked = async () => {
                const { data } = await supabase
                  .from("likes")
                  .select("id")
                  .eq("post_id", post.id)
                  .eq("user_id", user.id)
                  .maybeSingle();
                return !!data;
              };

              return (
                <PostCard
                  key={post.id}
                  postId={post.id}
                  authorId={post.author_id}
                  authorName={post.profiles.name}
                  text={post.text}
                  imageUrl={post.image_url}
                  createdAt={post.created_at}
                  currentUserId={user.id}
                  likesCount={0}
                  isLiked={false}
                  onPostDeleted={fetchPosts}
                  onPostEdited={fetchPosts}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Feed;
