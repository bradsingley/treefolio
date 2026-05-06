"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { logoutAction } from "@/lib/auth-actions";

const navItems = [
  { href: "/", label: "Collection", icon: GridIcon },
  { href: "/calendar", label: "Calendar", icon: CalendarIcon },
  { href: "/chat", label: "Chat", icon: ChatIcon },
];

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar — sticky to viewport so footer (theme + sign out)
          stays visible without scrolling. */}
      <aside className="hidden md:flex sticky top-0 h-screen w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-colors duration-300">
        <div className="flex items-center gap-2 px-6 py-6">
          <LeafIcon className="h-6 w-6 text-[var(--accent)]" />
          <span className="font-heading text-xl font-semibold text-[var(--heading)]">
            Treefolio
          </span>
        </div>

        <nav className="flex-1 px-3 py-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                      isActive
                        ? "bg-[var(--accent-light)] font-medium text-[var(--heading)]"
                        : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-[var(--border)] px-4 py-4 space-y-2">
          {isAdmin && (
            <a
              href="https://api.bradsingley.com/admin"
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--background)] hover:text-[var(--foreground)]"
            >
              <ShieldIcon className="h-4 w-4" />
              Admin
            </a>
          )}
          <ThemeToggle />
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--background)] hover:text-[var(--foreground)]"
            >
              <LogoutIcon className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-[var(--border)] bg-[var(--surface)]/95 py-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-colors duration-300 md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-1 text-xs transition-colors ${
                isActive
                  ? "font-medium text-[var(--heading)]"
                  : "text-[var(--muted)]"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <ThemeToggle compact />
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex flex-col items-center gap-1 px-4 py-1 text-xs text-[var(--muted)]"
          >
            <LogoutIcon className="h-5 w-5" />
            Out
          </button>
        </form>
      </nav>
    </>
  );
}

/* ─── Minimal inline icons (1.5px stroke) ─── */

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22V8" />
      <path d="M5 12s1-6 7-10c6 4 7 10 7 10" />
      <path d="M7 16s1-4 5-7c4 3 5 7 5 7" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
