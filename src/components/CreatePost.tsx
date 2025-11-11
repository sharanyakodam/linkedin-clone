import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Image, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreatePostProps {
  onPostCreated: () => void;
}

export const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, userId: string): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data } = supabase.storage.from("post-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please write something before posting",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, user.id);
      }

      const { error } = await supabase.from("posts").insert({
        author_id: user.id,
        text: text.trim(),
        image_url: imageUrl,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully!",
      });

      setText("");
      setImageFile(null);
      setImagePreview(null);
      onPostCreated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[100px] resize-none"
            disabled={loading}
          />
          
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full rounded-lg object-cover max-h-64"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                Remove
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                <Image className="w-5 h-5" />
                <span className="text-sm">Add Image</span>
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={loading}
              />
            </label>

            <Button type="submit" disabled={loading || !text.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
