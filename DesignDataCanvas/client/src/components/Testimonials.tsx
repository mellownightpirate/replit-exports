import { Star } from "lucide-react";

interface TestimonialProps {
  rating: number;
  text: string;
  initials: string;
  name: string;
  role: string;
}

function TestimonialCard({ rating, text, initials, name, role }: TestimonialProps) {
  return (
    <div className="notion-card group">
      <div className="flex gap-2 mb-5">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="fill-primary text-primary" size={18} />
        ))}
      </div>
      <p className="text-foreground mb-8 leading-relaxed">{text}</p>
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary">
          <span className="font-medium text-sm">{initials}</span>
        </div>
        <div className="ml-3">
          <p className="font-medium text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const testimonials = [
    {
      rating: 5,
      text: "Amin quickly understood our analytics needs and provided a strategic roadmap that aligned perfectly with our business goals. His expertise in embedded analytics transformed how we deliver insights to our customers.",
      initials: "JD",
      name: "James Darwin",
      role: "CTO, Enterprise SaaS Company"
    },
    {
      rating: 5,
      text: "Working with Amin on our self-service analytics strategy was eye-opening. His process-first approach helped us avoid costly tool mistakes and build a solution our users actually adopted and loved.",
      initials: "SR",
      name: "Sarah Rodriguez",
      role: "Data Director, Healthcare Provider"
    },
    {
      rating: 5,
      text: "Amin's dashboard implementation for our financial team transformed our reporting processes. His ability to translate complex requirements into intuitive analytics solutions is remarkable.",
      initials: "MK",
      name: "Michael Kim",
      role: "CFO, Technology Startup"
    }
  ];

  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-mono font-bold tracking-tight mb-4">Testimonials</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            What clients say about working with Amin
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              rating={testimonial.rating}
              text={testimonial.text}
              initials={testimonial.initials}
              name={testimonial.name}
              role={testimonial.role}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
