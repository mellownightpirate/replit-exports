import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const EmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type EmailFormData = z.infer<typeof EmailSchema>;

export default function EmailSignup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmailFormData>({
    resolver: zodResolver(EmailSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: EmailFormData) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/signup", data);
      toast({
        title: "Success!",
        description: "You've been added to the newsletter.",
        variant: "default",
      });
      reset();
    } catch (error) {
      toast({
        title: "Something went wrong.",
        description: "Please try again later.",
        variant: "destructive",
      });
      console.error("Newsletter signup failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Join the Learning Community</h2>
          <p className="mt-4 text-lg text-white/90">Get notified about new content, upcoming events, and exclusive resources</p>
        </div>

        <div className="mt-10 max-w-xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="sm:flex">
            <div className="min-w-0 flex-1">
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className={`block w-full px-4 py-3 rounded-md border-0 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm ${errors.email ? 'ring-2 ring-red-500' : ''}`}
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-white">{errors.email.message}</p>
              )}
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="block w-full px-4 py-3 rounded-md shadow bg-white text-primary-600 font-medium hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : "Subscribe"}
              </button>
            </div>
          </form>
          <p className="mt-3 text-sm text-white/80 text-center">I respect your privacy. Unsubscribe at any time.</p>
        </div>
      </div>
    </section>
  );
}
