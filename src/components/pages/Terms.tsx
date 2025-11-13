"use client";
import React from 'react';

export function Terms() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-950 dark:text-neutral-100 mb-8 tracking-wide">
          Terms of Service
        </h1>
        
        <div className="prose prose-lg max-w-none text-primary-700 dark:text-neutral-300">
          <p className="text-sm text-primary-600 dark:text-neutral-400 mb-8">
            Last updated: January 15, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-950 dark:text-neutral-100 mb-4">
              Agreement to Terms
            </h2>
            <p className="mb-4">
              These Terms of Service ("Terms") govern your use of the Aura Essence website and 
              services. By accessing or using our services, you agree to be bound by these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-950 dark:text-neutral-100 mb-4">
              Use of Our Services
            </h2>
            <h3 className="text-xl font-medium text-primary-900 dark:text-neutral-200 mb-3">
              Eligibility
            </h3>
            <p className="mb-4">
              You must be at least 18 years old to use our services. By using our services, 
              you represent that you meet this requirement.
            </p>
            
            <h3 className="text-xl font-medium text-primary-900 dark:text-neutral-200 mb-3">
              Account Registration
            </h3>
            <p className="mb-4">
              You may need to create an account to access certain features. You are responsible 
              for maintaining the confidentiality of your account credentials.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-950 dark:text-neutral-100 mb-4">
              Orders and Purchases
            </h2>
            <h3 className="text-xl font-medium text-primary-900 dark:text-neutral-200 mb-3">
              Product Information
            </h3>
            <p className="mb-4">
              We strive to provide accurate product descriptions and images. However, we do not 
              warrant that product descriptions are accurate, complete, reliable, or error-free.
            </p>
            
            <h3 className="text-xl font-medium text-primary-900 dark:text-neutral-200 mb-3">
              Pricing and Payment
            </h3>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>All prices are in USD and subject to change without notice</li>
              <li>Payment is due at the time of purchase</li>
              <li>We accept major credit cards and other payment methods as displayed</li>
              <li>Sales tax will be added where applicable</li>
            </ul>
            
            <h3 className="text-xl font-medium text-primary-900 dark:text-neutral-200 mb-3">
              Order Acceptance
            </h3>
            <p className="mb-4">
              We reserve the right to refuse or cancel orders at our discretion, including orders 
              that appear fraudulent or violate these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-950 dark:text-neutral-100 mb-4">
              Shipping and Delivery
            </h2>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Delivery times are estimates and may vary</li>
              <li>Risk of loss passes to you upon delivery</li>
              <li>International shipping may be subject to customs duties and taxes</li>
              <li>We are not responsible for delivery delays beyond our control</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-950 dark:text-neutral-100 mb-4">
              Returns and Refunds
            </h2>
            <h3 className="text-xl font-medium text-primary-900 dark:text-neutral-200 mb-3">
              Return Policy
            </h3>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Returns accepted within 30 days of delivery</li>
              <li>Items must be unopened and in original packaging</li>
              <li>Custom or personalized items are not returnable</li>
              <li>Customer is responsible for return shipping costs</li>
            </ul>
            
            <h3 className="text-xl font-medium text-primary-900 dark:text-neutral-200 mb-3">
              Refund Process
            </h3>
            <p className="mb-4">
              Refunds will be processed to the original payment method within 5-10 business days 
              after we receive and inspect the returned item.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-950 dark:text-neutral-100 mb-4">
              Intellectual Property
            </h2>
            <p className="mb-4">
              All content on our website, including text, graphics, logos, and images, is owned by 
              Aura Essence and protected by intellectual property laws. You may not use our 
              content without written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-950 dark:text-neutral-100 mb-4">
              Prohibited Uses
            </h2>
            <p className="mb-4">You may not use our services:</p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>For any unlawful purpose or to solicit unlawful activity</li>
              <li>To violate any international, federal, provincial, or state regulations or laws</li>
              <li>To transmit or procure viruses, worms, or other computer code</li>
              <li>To infringe upon or violate our intellectual property rights</li>
              <li>To harass, abuse, insult, harm, defame, slander, or intimidate</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-950 dark:text-neutral-100 mb-4">
              Disclaimers and Limitation of Liability
            </h2>
            <p className="mb-4">
              Our services are provided "as is" without any warranties. To the maximum extent 
              permitted by law, we disclaim all warranties and limit our liability for damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-950 dark:text-neutral-100 mb-4">
              Privacy Policy
            </h2>
            <p className="mb-4">
              Your privacy is important to us. Please review our Privacy Policy, which also governs 
              your use of our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-950 dark:text-neutral-100 mb-4">
              Changes to Terms
            </h2>
            <p className="mb-4">
              We reserve the right to update these Terms at any time. Changes will be effective 
              immediately upon posting. Your continued use constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-950 dark:text-neutral-100 mb-4">
              Governing Law
            </h2>
            <p className="mb-4">
              These Terms are governed by the laws of California, United States, without regard to 
              conflict of law principles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-950 dark:text-neutral-100 mb-4">
              Contact Information
            </h2>
            <p className="mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="bg-neutral-50 dark:bg-primary-900 p-4 rounded-lg">
              <p className="mb-2">Email: legal@aura-essence.com</p>
              <p className="mb-2">Phone: +1 (555) 123-4567</p>
              <p>Address: 123 Luxury Lane, Beverly Hills, CA 90210</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}