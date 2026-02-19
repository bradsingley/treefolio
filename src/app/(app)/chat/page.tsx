import { ChatInterface } from '@/components/chat-interface'

export default function ChatPage() {
  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-[var(--heading)]">
          Chat with Kodama
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Ask about your trees, get care advice, or just talk bonsai.
        </p>
      </header>

      <ChatInterface />
    </div>
  );
}
