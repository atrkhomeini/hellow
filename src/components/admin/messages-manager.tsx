"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, MailOpen, Trash2, Clock, User, MailIcon } from "lucide-react";
import { usePortfolioStore, Message } from "@/store/portfolio-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function MessagesManager() {
  const { messages, setMessages } = usePortfolioStore();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/messages");
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
  }, [setMessages]);

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    try {
      const response = await fetch("/api/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead }),
      });

      if (response.ok) {
        setMessages(
          messages.map((msg) =>
            msg.id === id ? { ...msg, isRead } : msg
          )
        );
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update message", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/messages?id=${id}`, { method: "DELETE" });

      if (response.ok) {
        setMessages(messages.filter((msg) => msg.id !== id));
        setSelectedMessage(null);
        toast({ title: "Success", description: "Message deleted" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete message", variant: "destructive" });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Messages</h2>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
              : "All messages read"}
          </p>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-2">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              setSelectedMessage(message);
              if (!message.isRead) {
                handleMarkAsRead(message.id, true);
              }
            }}
            className={cn(
              "p-4 rounded-lg border cursor-pointer transition-colors",
              message.isRead
                ? "border-border bg-card"
                : "border-primary/30 bg-primary/5"
            )}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  message.isRead ? "bg-surface-300" : "bg-primary/10"
                )}
              >
                {message.isRead ? (
                  <MailOpen className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Mail className="w-5 h-5 text-primary" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "font-medium",
                      message.isRead ? "text-foreground" : "text-foreground"
                    )}
                  >
                    {message.name}
                  </span>
                  {!message.isRead && (
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      New
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <MailIcon className="w-3 h-3" />
                  {message.email}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {message.subject || message.content}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(message.createdAt)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(message.id, !message.isRead);
                  }}
                >
                  {message.isRead ? (
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <MailOpen className="w-4 h-4 text-primary" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(message.id);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {messages.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No messages yet. Messages from the contact form will appear here.</p>
        </div>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Message from {selectedMessage?.name}</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MailIcon className="w-4 h-4" />
                {selectedMessage.email}
              </div>
              {selectedMessage.subject && (
                <div>
                  <label className="text-sm font-medium text-foreground">Subject</label>
                  <p className="text-muted-foreground">{selectedMessage.subject}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-foreground">Message</label>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {selectedMessage.content}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                Sent on {formatDate(selectedMessage.createdAt)}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                  Close
                </Button>
                <a href={`mailto:${selectedMessage.email}`}>
                  <Button className="bg-primary hover:bg-primary/90">Reply</Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
