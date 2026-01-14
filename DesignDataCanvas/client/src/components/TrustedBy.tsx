export default function TrustedBy() {
  const companies = [
    "Bank of England",
    "FAANG",
    "insightsoftware",
    "Squirro",
    "Trino"
  ];

  return (
    <section className="py-12 border-y border-neutral-subtle bg-neutral/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <p className="text-center text-muted-foreground mb-8 font-mono text-sm tracking-tight">
          FROM STARTUPS TO THE FORTUNE 500, TRUSTED BY TEAMS OF ALL SIZES
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {companies.map((company, index) => (
            <div key={index} className="grayscale hover:grayscale-0 transition-all duration-300">
              <p className="text-center font-mono font-bold text-muted-foreground">{company}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
