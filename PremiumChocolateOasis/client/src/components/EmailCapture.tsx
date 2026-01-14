import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

type FormValues = z.infer<typeof formSchema>;

export const EmailCapture: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ""
    }
  });

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/subscribe", { email });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: data.message || "You've been subscribed to our newsletter.",
        variant: "default",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    subscribeMutation.mutate(values.email);
  };

  return (
    <section id="join" className="py-16 bg-green text-offwhite">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-2xl mx-auto text-center appear-animation"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="arabic-detail mb-2 text-center">اشترك معنا</div>
          <h2 className="text-3xl md:text-5xl heading mb-4">
            <span className="uneven-text inline-block">JOIN THE MOVEMENT</span>
          </h2>
          <p className="mb-8">Get 15% off your first order, impact reports, and updates on our humanitarian projects.</p>
          
          <div className="bg-offwhite/10 p-8 rounded-xl shadow-lg">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Your email address"
                          className="px-6 py-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-watermelon text-dark h-[50px] bg-offwhite border-none shadow-inner"
                        />
                      </FormControl>
                      <FormMessage className="text-sm text-gold mt-1 text-left" />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="chunky-btn bg-watermelon hover:bg-watermelon/90 text-offwhite py-3 px-6 h-[50px] w-full"
                >
                  {isSubmitting ? "SUBSCRIBING..." : "GET 15% OFF YOUR FIRST ORDER"}
                </Button>
              </form>
            </Form>
            
            <div className="flex justify-center items-center gap-2 mt-6">
              <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-dark text-xs">🛡️</div>
              <p className="text-sm text-offwhite/70">
                We respect your privacy. We'll only send updates about products and impact.
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="bg-offwhite/10 px-4 py-2 rounded-lg">
              <span className="text-sm font-bold">🍫 Premium Chocolate</span>
            </div>
            <div className="bg-offwhite/10 px-4 py-2 rounded-lg">
              <span className="text-sm font-bold">✊ Palestinian Support</span>
            </div>
            <div className="bg-offwhite/10 px-4 py-2 rounded-lg">
              <span className="text-sm font-bold">📦 Carbon-Neutral Shipping</span>
            </div>
            <div className="bg-offwhite/10 px-4 py-2 rounded-lg">
              <span className="text-sm font-bold">💰 100% Profit Donation</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
