import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { oliveChocolate, orangeChocolate, dateChocolate } from "@/lib/images";

type Product = {
  id: number;
  name: string;
  flavor: string;
  description: string;
  image: string;
  price: string;
};

export const ProductCarousel: React.FC = () => {
  const products: Product[] = [
    {
      id: 1,
      name: "Olive Branch",
      flavor: "Olive Oil & Almond",
      description: "Bold dark chocolate infused with pressed Mediterranean olive oil and crunchy local almonds. A premium chocolate experience.",
      image: oliveChocolate,
      price: "£21.99"
    },
    {
      id: 2,
      name: "Citrus Gold",
      flavor: "Orange Blossom & Sea Salt",
      description: "Vibrant citrus notes meld with Mediterranean sea salt crystals for a bright, refreshing chocolate experience.",
      image: orangeChocolate,
      price: "£21.99"
    },
    {
      id: 3,
      name: "Sweet Delight",
      flavor: "Fig & Date with Tahini Swirl",
      description: "Sweet Mediterranean dates and figs with a luxurious tahini swirl. A taste of culinary tradition in every bite.",
      image: dateChocolate,
      price: "£21.99"
    }
  ];

  return (
    <section id="products" className="py-16 bg-offwhite">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="appear-animation"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl heading text-center mb-4 text-watermelon">
            <span className="uneven-text inline-block">OUR FLAVORS</span>
          </h2>
          <p className="text-center text-dark/80 max-w-3xl mx-auto mb-12">
            Premium dark chocolate with distinctive Mediterranean flavors. Each bar offers a unique taste experience you won't find anywhere else.
          </p>
        </motion.div>

        <div className="appear-animation">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {products.map((product) => (
                <CarouselItem key={product.id} className="md:basis-1/3 p-4">
                  <div className="relative">
                    <Card className="bg-offwhite rounded-xl overflow-hidden shadow-xl h-full border-t-8 border-watermelon">
                      <div className="w-full h-56 relative">
                        <img 
                          src={product.image} 
                          alt={product.flavor} 
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute top-0 right-0 bg-watermelon text-offwhite px-3 py-1 rounded-bl-lg font-bold shadow-md">
                          PREMIUM
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-2 text-watermelon heading uppercase tracking-wider">{product.name}</h3>
                        <p className="text-green mb-4 handwritten text-xl">{product.flavor}</p>
                        <p className="text-dark/80 mb-4">{product.description}</p>
                      </CardContent>
                      <CardFooter className="p-6 pt-0 flex justify-between items-center">
                        <span className="text-dark font-bold">{product.price}</span>
                        <Link href="/checkout">
                          <Button className="chunky-btn bg-watermelon hover:bg-watermelon/90 text-offwhite py-2 px-4">
                            FUND NOW
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                    <div className="absolute -top-3 -left-3 bg-gold text-dark px-3 py-1 rounded-lg font-bold text-sm shadow-md transform rotate-[-3deg]">
                      NEW
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-8">
              <CarouselPrevious className="static mx-2 bg-watermelon/10 hover:bg-watermelon/20 text-watermelon" />
              <CarouselNext className="static mx-2 bg-watermelon/10 hover:bg-watermelon/20 text-watermelon" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};
