import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LikeButton } from "./LikeButton";
import { CommentsSection } from "./CommentsSection";
import { EditDeletePost } from "./EditDeletePost";
import { useNavigate } from "react-router-dom";

interface PostCardProps {
  postId: string;
  authorId: string;
  authorName: string;
  text: string;
  imageUrl?: string | null;
  createdAt: string;
  currentUserId: string;
  likesCount: number;
  isLiked: boolean;
  onPostDeleted: () => void;
  onPostEdited: () => void;
}

export const PostCard = ({ 
  postId, 
  authorId, 
  authorName, 
  text, 
  imageUrl, 
  createdAt,
  currentUserId,
  likesCount,
  isLiked,
  onPostDeleted,
  onPostEdited
}: PostCardProps) => {
  const navigate = useNavigate();
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all duration-200 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar 
              className="h-10 w-10 bg-primary cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate(`/profile/${authorId}`)}
            >
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials(authorName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p 
                className="font-semibold text-foreground cursor-pointer hover:underline"
                onClick={() => navigate(`/profile/${authorId}`)}
              >
                {authorName}
              </p>
              <p className="text-sm text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          {currentUserId === authorId && (
            <EditDeletePost
              postId={postId}
              currentText={text}
              onDeleted={onPostDeleted}
              onEdited={onPostEdited}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground whitespace-pre-wrap">{text}</p>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Post content"
            className="w-full rounded-lg object-cover max-h-96"
          />
        )}
        <div className="flex items-center space-x-2 pt-2 border-t border-border">
          <LikeButton
            postId={postId}
            userId={currentUserId}
            initialLikesCount={likesCount}
            initialIsLiked={isLiked}
          />
          <CommentsSection postId={postId} userId={currentUserId} />
        </div>
      </CardContent>
    </Card>
  );
};
