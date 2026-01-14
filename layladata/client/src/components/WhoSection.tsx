const people = [
  "Data leaders and product people",
  "People building with AI and ML", 
  "Artists who work with data"
];

export default function WhoSection() {
  return (
    <section className="bg-slate-950 py-32 px-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-sm uppercase tracking-widest text-amber-400/60 mb-16 text-center font-light" data-testid="text-who-title">
          Who is in the room
        </h2>
        
        <div className="space-y-6">
          {people.map((person, index) => (
            <p 
              key={index}
              className="text-2xl md:text-3xl text-slate-300 font-light text-center border-l border-amber-500/20 pl-8 py-2"
              data-testid={`text-person-${index}`}
            >
              {person}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
