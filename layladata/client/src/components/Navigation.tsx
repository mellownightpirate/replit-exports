import { Link } from "wouter";

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-slate-100 font-light text-lg tracking-tight hover:text-amber-400/80 transition-colors" data-testid="link-nav-home">
          Layla
        </Link>
        <div className="flex items-center gap-6">
          <Link 
            href="/past-events" 
            className="text-slate-400 text-sm uppercase tracking-wider hover:text-amber-400/80 transition-colors"
            data-testid="link-nav-past-events"
          >
            Past events
          </Link>
        </div>
      </div>
    </nav>
  );
}
