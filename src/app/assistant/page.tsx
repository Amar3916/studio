'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, BrainCircuit } from 'lucide-react';
import { answerScholarshipQuestion } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"


type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEli5, setIsEli5] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const question = isEli5 ? `Explain like I'm 5: ${input}` : input;
      const result = await answerScholarshipQuestion({ question });
      const assistantMessage: Message = { role: 'assistant', content: result.answer };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-60px)]">
      <div className="flex items-center justify-between p-4 border-b">
         <div className="flex items-center gap-4">
             <BrainCircuit className="h-8 w-8 text-primary" />
             <div>
                <h2 className="text-2xl font-bold tracking-tight">AI Assistant</h2>
                <p className="text-sm text-muted-foreground">Your personal guide to financial aid.</p>
             </div>
         </div>
         <div className="flex items-center space-x-2">
          <Switch id="eli5-mode" checked={isEli5} onCheckedChange={setIsEli5} />
          <Label htmlFor="eli5-mode">ELI5 Mode</Label>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-4',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-md rounded-lg p-3 text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
              </div>
              {message.role === 'user' && (
                 <Avatar className="h-8 w-8">
                    <AvatarFallback><User /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {loading && (
             <div className="flex items-start gap-4 justify-start">
                <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about scholarships..."
            autoComplete="off"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
