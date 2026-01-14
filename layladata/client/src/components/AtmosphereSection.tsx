export default function AtmosphereSection() {
  return (
    <section className="bg-black py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-2xl md:text-3xl text-slate-300 font-light leading-relaxed mb-20 text-center" data-testid="text-atmosphere">
          Set in an atmospheric, candlelit gallery in Marylebone, chief data officers, heads of analytics and AI, senior product leaders, and artists who work with data share the same room for an unhurried night of conversation.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div data-testid="item-mood-0">
            <p className="text-amber-400/70 text-sm uppercase tracking-widest font-light">Candlelight</p>
          </div>
          <div data-testid="item-mood-1">
            <p className="text-amber-400/70 text-sm uppercase tracking-widest font-light">Gallery</p>
          </div>
          <div data-testid="item-mood-2">
            <p className="text-amber-400/70 text-sm uppercase tracking-widest font-light">Data × Art</p>
          </div>
          <div data-testid="item-mood-3">
            <p className="text-amber-400/70 text-sm uppercase tracking-widest font-light">Off record</p>
          </div>
        </div>
      </div>
    </section>
  );
}
