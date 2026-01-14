const details = [
  { label: "Location", value: "Atmospheric gallery, Marylebone, London" },
  { label: "Date", value: "Thursday 22 January 2026, evening" },
  { label: "Format", value: "An evening-length salon where conversations unfold across the room" },
  { label: "Dress", value: "Come as your most interesting self" }
];

export default function EventDetails() {
  return (
    <section className="bg-black py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="space-y-12">
          {details.map((detail, index) => (
            <div key={index} className="border-t border-slate-800 pt-6" data-testid={`item-detail-${index}`}>
              <p className="text-xs uppercase tracking-widest text-amber-400/60 mb-3 font-light" data-testid={`text-detail-label-${index}`}>
                {detail.label}
              </p>
              <p className="text-lg text-slate-300 font-light leading-relaxed" data-testid={`text-detail-value-${index}`}>
                {detail.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
