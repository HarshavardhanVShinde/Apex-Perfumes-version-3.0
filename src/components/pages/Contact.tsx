"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { contactSchema, type ContactForm } from '@/lib/schema';

export function Contact() {
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactForm) => {
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Contact form submitted:', data);
      setIsSubmitted(true);
      reset();
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-950 dark:text-neutral-100 mb-4 tracking-wide">
            Contact Us
          </h1>
          <p className="text-xl text-primary-700 dark:text-neutral-300 max-w-2xl mx-auto">
            We'd love to hear from you. Get in touch with our team for any questions about our fragrances or services.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white dark:bg-primary-900 rounded-lg shadow-sm border border-primary-100 dark:border-primary-800 p-8">
            <h2 className="text-2xl font-semibold text-primary-950 dark:text-neutral-100 mb-6">
              Send us a message
            </h2>

            {isSubmitted && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <p className="text-green-700 dark:text-green-400">
                  Thank you for your message! We'll get back to you within 24 hours.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Your Name"
                {...register('name')}
                error={errors.name?.message}
              />

              <Input
                label="Email Address"
                type="email"
                {...register('email')}
                error={errors.email?.message}
              />

              <Input
                label="Subject"
                {...register('subject')}
                error={errors.subject?.message}
              />

              <div>
                <label className="block text-sm font-medium text-primary-900 dark:text-neutral-100 mb-1">
                  Message
                </label>
                <textarea
                  {...register('message')}
                  rows={6}
                  className="w-full px-3 py-2 border border-primary-200 dark:border-primary-800 rounded-md bg-neutral-50 dark:bg-primary-900 text-primary-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors duration-200 resize-vertical"
                  placeholder="Tell us more about your inquiry..."
                />
                {errors.message && (
                  <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-primary-950 dark:text-neutral-100 mb-6">
                Get in touch
              </h2>
              <p className="text-primary-700 dark:text-neutral-300 leading-relaxed mb-8">
                Our customer service team is here to help with any questions about our fragrances, 
                orders, or services. We're committed to providing you with an exceptional experience.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-lg flex items-center justify-center mr-4">
                    <MapPin className="h-6 w-6 text-accent-600 dark:text-accent-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-950 dark:text-neutral-100 mb-1">
                      Visit our boutique
                    </h3>
                    <p className="text-primary-700 dark:text-neutral-300">
                      123 Luxury Lane<br />
                      Beverly Hills, CA 90210<br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-lg flex items-center justify-center mr-4">
                    <Phone className="h-6 w-6 text-accent-600 dark:text-accent-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-950 dark:text-neutral-100 mb-1">
                      Call us
                    </h3>
                    <p className="text-primary-700 dark:text-neutral-300">
                      +1 (555) 123-4567<br />
                      Toll-free: 1-800-AURA-123
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-lg flex items-center justify-center mr-4">
                    <Mail className="h-6 w-6 text-accent-600 dark:text-accent-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-950 dark:text-neutral-100 mb-1">
                      Email us
                    </h3>
                    <p className="text-primary-700 dark:text-neutral-300">
                      hello@aura-essence.com<br />
                      support@aura-essence.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-lg flex items-center justify-center mr-4">
                    <Clock className="h-6 w-6 text-accent-600 dark:text-accent-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-950 dark:text-neutral-100 mb-1">
                      Business hours
                    </h3>
                    <p className="text-primary-700 dark:text-neutral-300">
                      Monday - Friday: 9:00 AM - 7:00 PM PST<br />
                      Saturday: 10:00 AM - 6:00 PM PST<br />
                      Sunday: 12:00 PM - 5:00 PM PST
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-neutral-50 dark:bg-primary-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary-950 dark:text-neutral-100 mb-4">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-primary-900 dark:text-neutral-100 mb-1">
                    How long do your fragrances last?
                  </h4>
                  <p className="text-sm text-primary-600 dark:text-neutral-400">
                    Our fragrances typically last 6-12+ hours depending on the concentration and your skin type.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-primary-900 dark:text-neutral-100 mb-1">
                    Do you offer samples?
                  </h4>
                  <p className="text-sm text-primary-600 dark:text-neutral-400">
                    Yes, we offer sample sets so you can try our fragrances before committing to a full bottle.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-primary-900 dark:text-neutral-100 mb-1">
                    What is your return policy?
                  </h4>
                  <p className="text-sm text-primary-600 dark:text-neutral-400">
                    We offer a 30-day return policy for unopened items in original packaging.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}