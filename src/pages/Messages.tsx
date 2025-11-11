import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  text: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read: boolean;
}

interface Profile {
  id: string;
  name: string;
}

const Messages = () => {
  const { userId: recipientId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [recipient, setRecipient] = useState<Profile | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && recipientId) {
      fetchRecipient();
      fetchMessages();

      const channel = supabase
        .channel(`messages-${user.id}-${recipientId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${recipientId},receiver_id=eq.${user.id}`,
          },
          () => {
            fetchMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, recipientId]);

  const fetchRecipient = async () => {
    if (!recipientId) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("id", recipientId)
      .single();

    if (error) {
      console.error("Error fetching recipient:", error);
    } else {
      setRecipient(data);
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    if (!user || !recipientId) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data || []);
      markMessagesAsRead();
    }
  };

  const markMessagesAsRead = async () => {
    if (!user || !recipientId) return;

    await supabase
      .from("messages")
      .update({ read: true })
      .eq("sender_id", recipientId)
      .eq("receiver_id", user.id)
      .eq("read", false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !recipientId) return;

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: recipientId,
      text: newMessage.trim(),
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNewMessage("");
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  if (authLoading || loading || !user || !recipient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card className="shadow-card h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="border-b border-border">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 bg-primary">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(recipient.name)}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{recipient.name}</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.sender_id === user.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className={`text-xs mt-1 ${isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>

          <div className="p-4 border-t border-border">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Messages;
