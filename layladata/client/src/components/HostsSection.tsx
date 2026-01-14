export default function HostsSection() {
  return (
    <section className="bg-slate-950 py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs uppercase tracking-widest text-amber-400/50 mb-6 font-light" data-testid="text-hosts-label">
          Curated by
        </p>
        
        <div className="flex items-center justify-center gap-12">
          <a 
            href="https://www.linkedin.com/in/amin-hasan/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group"
            data-testid="link-amin"
          >
            <div className="w-12 h-12 rounded-full border border-amber-500/30 group-hover:border-amber-500/60 flex items-center justify-center mb-3 mx-auto transition-colors">
              <span className="text-amber-400/70 group-hover:text-amber-400 text-sm font-light transition-colors">AH</span>
            </div>
            <p className="text-slate-400 text-sm font-light group-hover:text-amber-400/70 transition-colors">
              Amin Hasan
            </p>
          </a>
          
          <div className="w-px h-12 bg-slate-800"></div>
          
          <a 
            href="https://www.linkedin.com/in/sara-beazley/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group"
            data-testid="link-sara"
          >
            <div className="w-12 h-12 rounded-full border border-amber-500/30 group-hover:border-amber-500/60 flex items-center justify-center mb-3 mx-auto transition-colors">
              <span className="text-amber-400/70 group-hover:text-amber-400 text-sm font-light transition-colors">SB</span>
            </div>
            <p className="text-slate-400 text-sm font-light group-hover:text-amber-400/70 transition-colors">
              Sara Beazley
            </p>
          </a>
        </div>
      </div>
    </section>
  );
}
