import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";

const GALLERY_IMAGES = [
  "IMG_1565.JPG",
  "IMG_1576.jpg",
  "IMG_1585.jpg",
  "IMG_1590.jpg",
  "IMG_1606.jpg",
  "IMG_1620.JPG",
  "IMG_1622.JPG",
  "IMG_1627.jpg",
  "IMG_1628.jpg",
  "IMG_1669.jpg",
  "IMG_1675.JPG",
  "IMG_1723.jpg",
  "IMG_2089.jpg",
  "IMG_2091.JPG",
  "IMG_2098.jpg",
  "IMG_2121.JPG",
  "IMG_2151.JPG",
  "IMG_2160.JPG",
  "IMG_2165.JPG",
  "IMG_2196.jpg",
  "IMG_2209.JPG",
  "IMG_2236.JPG",
  "IMG_2256.JPG",
  "IMG_2334.JPG",
].map((filename, i) => ({
  id: i + 1,
  src: `/assets/past-events/layla-salon-001/${filename}`,
  alt: `Layla Salon 001 - Image ${i + 1}`,
}));

function Lightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: {
  images: typeof GALLERY_IMAGES;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, onNext, onPrev]);

  const image = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      data-testid="lightbox-overlay"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10"
        aria-label="Close lightbox"
        data-testid="button-lightbox-close"
      >
        <X className="w-8 h-8" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 z-10"
        aria-label="Previous image"
        data-testid="button-lightbox-prev"
      >
        <ChevronLeft className="w-10 h-10" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 z-10"
        aria-label="Next image"
        data-testid="button-lightbox-next"
      >
        <ChevronRight className="w-10 h-10" />
      </button>

      <div
        className="max-w-5xl max-h-[85vh] px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.src}
          alt={image.alt}
          className="max-w-full max-h-[85vh] object-contain"
          data-testid={`lightbox-image-${image.id}`}
        />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}

export default function PastEvents() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const nextImage = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % GALLERY_IMAGES.length);
  }, [lightboxIndex]);

  const prevImage = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex(
      (lightboxIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
    );
  }, [lightboxIndex]);

  return (
    <div className="bg-black min-h-screen text-slate-100">
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-amber-400/80 hover:text-amber-400 transition-colors" data-testid="link-back-home">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm uppercase tracking-wider">Back to Layla</span>
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-20">
        <article className="max-w-3xl mx-auto px-6">
          <header className="mb-16">
            <p className="text-amber-400/60 text-xs uppercase tracking-[0.2em] mb-4" data-testid="text-event-meta">
              Thursday 27 November 2025 · Cramer Street Gallery, London
            </p>
            <h1 className="text-4xl md:text-5xl font-light mb-8 tracking-tight" data-testid="text-event-title">
              Layla, Salon 001
            </h1>
          </header>

          <div className="prose prose-invert prose-lg max-w-none space-y-6 text-slate-300 font-light leading-relaxed" data-testid="text-event-body">
            <p>
              On Thursday 27 November we hosted our inaugural Layla salon at Cramer Street Gallery, an intimate, candlelit evening bringing together leaders across data, AI, product, and the creative industries.
            </p>

            <p>
              Our guest speaker was Tom Furse, artist, musician, and long time member of The Horrors. Tom shared the story of his fifteen year career in music, how his practice has evolved, and how machine learning has become a collaborator in the process, a tool he shapes, guides, and occasionally even 'tricks' to reach new aesthetic possibilities.
            </p>

            <p>
              One idea landed with real clarity. The artist is still steering the system. AI can expand the palette, but it does not replace vision. As Tom put it, every new medium begins with imperfections, and those imperfections often become the signature of a new aesthetic.
            </p>

            <p>
              He framed AI not as a rupture, but as the latest chapter in a longer lineage, from early synth experiments, to sampling culture, to generative systems. Creativity has always been a conversation between the artist and their tools, and machine learning is simply the newest voice in that dialogue.
            </p>

            <p>
              After the talk we moved into small group conversations on AI operating models, experimentation and measurement, data culture and decision quality, platform trade offs and cost control, safety, risk, and behaviour in production, and the broader human experience around the work.
            </p>

            <p>
              What made the evening special was the room. Founders, heads of AI, senior product leaders, data scientists, architects, and artists exploring machine systems, all genuinely curious about ideas, not airtime.
            </p>

            <p>
              Layla is designed to be more than a one off. We are building a community that stays connected between gatherings, continuing conversations, forming collaborations, and keeping curiosity alive. Future salons will take new forms, in new venues, and eventually new cities, but the ethos stays the same, thoughtful curation, meaningful dialogue, and a blend of technical and creative perspectives.
            </p>

            <p>
              Thank you to everyone who joined us for the first evening, and especially to Tom for such a generous talk.
            </p>

            <p className="text-slate-400">
              More soon,<br />
              Amin and Sara
            </p>
          </div>
        </article>

        <section className="max-w-6xl mx-auto px-6 mt-20">
          <h2 className="text-2xl font-light mb-8 text-center text-slate-200" data-testid="text-gallery-title">
            Gallery
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {GALLERY_IMAGES.map((image, index) => (
              <button
                key={image.id}
                onClick={() => openLightbox(index)}
                className="aspect-[4/3] overflow-hidden rounded-md bg-slate-900 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                aria-label={`View ${image.alt}`}
                data-testid={`button-gallery-image-${image.id}`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-500 text-sm">
          <Link href="/" className="hover:text-amber-400/80 transition-colors" data-testid="link-footer-home">
            ← Return to Layla
          </Link>
        </div>
      </footer>

      {lightboxIndex !== null && (
        <Lightbox
          images={GALLERY_IMAGES}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
    </div>
  );
}
