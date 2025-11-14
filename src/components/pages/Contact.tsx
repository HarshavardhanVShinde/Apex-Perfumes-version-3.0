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
      // console.log('Contact form submitted:', data);
      setIsSubmitted(true);
      reset();
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Premium Hero Section - Mobile Optimized */}
      <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-amber-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6">
          <div className="mb-4 sm:mb-6 inline-block">
            <span className="text-amber-400 text-xs sm:text-sm font-semibold tracking-widest">GET IN TOUCH</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-wider text-white mb-4 sm:mb-6 leading-tight">
            Contact Us
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-100 tracking-wide font-light max-w-2xl mx-auto leading-relaxed">
            We'd love to hear from you. Get in touch with our team for any questions about our fragrances or services.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
          {/* Contact Form - Mobile Enhanced */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white mb-5 sm:mb-6">
              Send us a message
            </h2>

            {isSubmitted && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-700 dark:text-green-400 font-medium">
                  Thank you for your message! We'll get back to you within 24 hours.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
              <Input
                label="Your Name"
                {...register('name')}
                error={errors.name?.message}
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 min-h-[48px] text-base"
              />

              <Input
                label="Email Address"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 min-h-[48px] text-base"
              />

              <Input
                label="Subject"
                {...register('subject')}
                error={errors.subject?.message}
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 min-h-[48px] text-base"
              />

              <div>
                <label className="block text-sm sm:text-base font-medium text-slate-900 dark:text-white mb-2">
                  Message
                </label>
                <textarea
                  {...register('message')}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 resize-vertical text-base shadow-sm"
                  placeholder="Tell us more about your inquiry..."
                />
                {errors.message && (
                  <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-xl hover:shadow-2xl min-h-[56px] text-base sm:text-lg font-semibold rounded-xl"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>

          {/* Contact Information - Mobile Enhanced */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white mb-4 sm:mb-6">
                Get in touch
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-gray-300 leading-relaxed mb-6 sm:mb-8">
                Our customer service team is here to help with any questions about our fragrances, 
                orders, or services. We're committed to providing you with an exceptional experience.
              </p>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start bg-slate-50 dark:bg-slate-900 p-5 sm:p-6 rounded-xl hover:shadow-lg transition-all border border-slate-200 dark:border-slate-800">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <MapPin className="h-6 w-6 sm:h-7 sm:w-7 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1 text-base sm:text-lg">
                      Visit our boutique
                    </h3>
                    <p className="text-slate-600 dark:text-gray-300">
                      123 Luxury Lane<br />
                      Beverly Hills, CA 90210<br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="flex items-start bg-slate-50 dark:bg-slate-900 p-6 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mr-4">
                    <Phone className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1 text-lg">
                      Call us
                    </h3>
                    <p className="text-slate-600 dark:text-gray-300">
                      +1 (555) 123-4567<br />
                      Toll-free: 1-800-AURA-123
                    </p>
                  </div>
                </div>

                <div className="flex items-start bg-slate-50 dark:bg-slate-900 p-6 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mr-4">
                    <Mail className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1 text-lg">
                      Email us
                    </h3>
                    <p className="text-slate-600 dark:text-gray-300">
                      hello@aura-essence.com<br />
                      support@aura-essence.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start bg-slate-50 dark:bg-slate-900 p-6 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mr-4">
                    <Clock className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1 text-lg">
                      Business hours
                    </h3>
                    <p className="text-slate-600 dark:text-gray-300">
                      Monday - Friday: 9:00 AM - 7:00 PM PST<br />
                      Saturday: 10:00 AM - 6:00 PM PST<br />
                      Sunday: 12:00 PM - 5:00 PM PST
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-semibold text-white mb-6">
                Frequently Asked Questions
              </h3>
              <div className="space-y-5">
                <div>
                  <h4 className="font-medium text-white mb-2">
                    How long do your fragrances last?
                  </h4>
                  <p className="text-sm text-gray-300">
                    Our fragrances typically last 6-12+ hours depending on the concentration and your skin type.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">
                    Do you offer samples?
                  </h4>
                  <p className="text-sm text-gray-300">
                    Yes, we offer sample sets so you can try our fragrances before committing to a full bottle.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">
                    What is your return policy?
                  </h4>
                  <p className="text-sm text-gray-300">
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