export default function ChatPage() {
  return (
    <div className="animate-fade-in">
      <header className="mb-12">
        <h1 className="font-heading text-3xl font-semibold text-[var(--heading)]">
          Chat with Kodama
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Ask about your trees, get care advice, or just talk bonsai.
        </p>
      </header>

      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <p className="text-sm text-[var(--muted)]">
          Chat interface coming soon.
        </p>
      </div>
    </div>
  );
}
