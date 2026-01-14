import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { insertParticipantSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

type FormValues = z.infer<typeof insertParticipantSchema>;

// Define the interest options
const interestOptions = [
  { id: 'feedback', label: 'Give feedback on the chocolate or site' },
  { id: 'make', label: 'Help make chocolate' },
  { id: 'share', label: 'Share on socials' },
  { id: 'distribute', label: 'Sell or distribute Free Bar' },
  { id: 'creative', label: 'Help design, write, or fundraise' },
  { id: 'other', label: 'Other' }
];

export const ParticipationForm: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [otherSelected, setOtherSelected] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(insertParticipantSchema),
    defaultValues: {
      name: null,
      email: '',
      interests: [],
      otherInterest: null,
      message: null
    }
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest(
        'POST',
        '/api/participate',
        values
      );

      const data = await response.json();
      toast({
        title: 'Success!',
        description: data.message,
      });
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Watch for changes to the interests array
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'interests') {
        setOtherSelected(value.interests?.includes('other') || false);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  return (
    <div className="w-full max-w-md mx-auto bg-paper p-6 rounded-none relative">
      <div className="border-4 border-dashed border-green p-6">
        <h3 className="text-2xl font-bold text-watermelon mb-4 uneven-text">JOIN THE MOVEMENT</h3>
        <p className="mb-6 text-dark">We're a movement, not a company.</p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-dark">Name (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-dark">Email <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel className="text-dark">What would you like to do? <span className="text-red-500">*</span></FormLabel>
              <div className="space-y-3 mt-2">
                {interestOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option.id)}
                            onCheckedChange={(checked) => {
                              const updatedValue = checked
                                ? [...(field.value || []), option.id]
                                : (field.value || []).filter((value) => value !== option.id);
                              field.onChange(updatedValue);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-dark">{option.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </div>
            
            {otherSelected && (
              <FormField
                control={form.control}
                name="otherInterest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-dark">Please specify</FormLabel>
                    <FormControl>
                      <Input placeholder="Tell us how you'd like to help" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-dark">Message (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share any additional thoughts or ideas" 
                      className="resize-none h-24" 
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                type="submit" 
                className="w-full chunky-btn bg-green hover:bg-green/90 text-offwhite py-3 px-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'JOIN US'}
              </Button>
            </motion.div>
          </form>
        </Form>
      </div>
    </div>
  );
};