import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { PostCard } from "@/components/PostCard";
import { FollowButton } from "@/components/FollowButton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Mail, Edit2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
}

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

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchPosts();
      fetchFollowStats();
    }
  }, [userId]);

  const fetchProfile = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Could not load profile",
        variant: "destructive",
      });
    } else {
      setProfile(data);
      setBioText(data.bio || "");
    }
    setLoading(false);
  };

  const fetchPosts = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        text,
        image_url,
        created_at,
        author_id,
        profiles (name)
      `)
      .eq("author_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data || []);
    }
  };

  const fetchFollowStats = async () => {
    if (!userId) return;

    const { count: followers } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);

    const { count: following } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId);

    setFollowersCount(followers || 0);
    setFollowingCount(following || 0);
  };

  const handleSaveBio = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ bio: bioText })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Bio updated successfully!" });
      setEditingBio(false);
      fetchProfile();
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  if (authLoading || loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isOwnProfile = user.id === userId;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20 bg-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  <div className="flex space-x-4 mt-2 text-sm text-muted-foreground">
                    <span><strong>{posts.length}</strong> posts</span>
                    <span><strong>{followersCount}</strong> followers</span>
                    <span><strong>{followingCount}</strong> following</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {isOwnProfile ? (
                  <>
                    {editingBio ? (
                      <Button onClick={handleSaveBio} size="sm">
                        Save Bio
                      </Button>
                    ) : (
                      <Button onClick={() => setEditingBio(true)} variant="outline" size="sm">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <FollowButton currentUserId={user.id} targetUserId={userId} />
                    <Button
                      onClick={() => navigate(`/messages/${userId}`)}
                      variant="outline"
                      size="sm"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {editingBio ? (
              <Textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                placeholder="Write a bio..."
                className="min-h-[80px]"
              />
            ) : (
              <p className="text-foreground">
                {profile.bio || "No bio yet"}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Posts</h2>
          {posts.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No posts yet</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
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
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
