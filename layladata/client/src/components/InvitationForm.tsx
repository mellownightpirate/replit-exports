export default function InvitationForm() {
  return (
    <section className="bg-black py-32 px-6 border-t border-slate-900">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-light text-slate-200 mb-6" data-testid="text-form-title">
          Request an invitation
        </h2>
        <p className="text-slate-400 font-light leading-relaxed mb-12" data-testid="text-form-subtitle">
          Limited places. Request an invitation through Luma.
        </p>
        
        <a
          href="/out/tickets"
          data-ticket-link
          className="inline-flex items-center justify-center px-16 py-6 text-sm font-light tracking-widest uppercase rounded-none border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-all"
          data-testid="link-tickets"
        >
          Request an invitation
        </a>
        
        <p className="text-slate-500 text-xs mt-6 font-light" data-testid="text-reassurance">
          We will be in touch if there is a good fit.
        </p>
      </div>
    </section>
  );
}
