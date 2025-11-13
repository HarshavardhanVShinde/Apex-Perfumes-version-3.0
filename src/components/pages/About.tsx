"use client";
import React from 'react';
import { Award, Users, Globe, Heart } from 'lucide-react';

export function About() {
  const values = [
    {
      icon: Award,
      title: 'Excellence',
      description: 'We source only the finest ingredients and employ master perfumers to create exceptional fragrances.'
    },
    {
      icon: Users,
      title: 'Craftsmanship',
      description: 'Each fragrance is meticulously crafted with attention to detail and passion for the art of perfumery.'
    },
    {
      icon: Globe,
      title: 'Sustainability',
      description: 'We are committed to sustainable practices and ethical sourcing in our fragrance production.'
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'Our love for fragrance drives us to create scents that inspire and connect with people emotionally.'
    }
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-950 dark:text-neutral-100 mb-6 tracking-wide">
            The Aura Essence Story
          </h1>
          <p className="text-xl text-primary-700 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            Born from a passion for extraordinary fragrance and an unwavering commitment to excellence, 
            Aura Essence represents the pinnacle of luxury perfumery.
          </p>
        </section>

        {/* Story Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-primary-950 dark:text-neutral-100 mb-6">
              Our Beginning
            </h2>
            <p className="text-primary-700 dark:text-neutral-300 mb-4 leading-relaxed">
              Aura Essence was founded in 2020 by a team of fragrance enthusiasts who believed that luxury 
              perfumery had lost touch with its artisanal roots. We set out to create a brand that 
              would honor the traditional craftsmanship of perfume-making while embracing modern 
              innovation and sustainability.
            </p>
            <p className="text-primary-700 dark:text-neutral-300 mb-4 leading-relaxed">
              Our journey began in a small atelier in Grasse, France, the historic heart of perfumery. 
              Working closely with master perfumers and sourcing the finest raw materials from around 
              the world, we developed our first collection of distinctive fragrances.
            </p>
            <p className="text-primary-700 dark:text-neutral-300 leading-relaxed">
              Today, Aura Essence has grown into a globally recognized luxury fragrance house, but we remain 
              true to our founding principles: uncompromising quality, artistic integrity, and the 
              belief that fragrance is the ultimate form of personal expression.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/1191710/pexels-photo-1191710.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Aura Essence atelier"
              className="rounded-lg shadow-lg"
            />
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-primary-950 dark:text-neutral-100 text-center mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 dark:bg-accent-900 rounded-full mb-4">
                  <value.icon className="h-8 w-8 text-accent-600 dark:text-accent-400" />
                </div>
                <h3 className="text-xl font-semibold text-primary-950 dark:text-neutral-100 mb-3">
                  {value.title}
                </h3>
                <p className="text-primary-600 dark:text-neutral-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Process Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Fragrance creation process"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-primary-950 dark:text-neutral-100 mb-6">
                Our Process
              </h2>
              <p className="text-primary-700 dark:text-neutral-300 mb-4 leading-relaxed">
                Each Aura Essence fragrance begins with a concept—a moment, emotion, or memory that we want 
                to capture in scent. Our master perfumers then embark on a journey of discovery, 
                selecting and blending the finest ingredients to bring that vision to life.
              </p>
              <p className="text-primary-700 dark:text-neutral-300 mb-4 leading-relaxed">
                We source our ingredients from the world's most prestigious suppliers: Bulgarian rose, 
                Indian sandalwood, Italian bergamot, and Madagascar vanilla. Each ingredient is 
                carefully evaluated for quality and character before being incorporated into our formulations.
              </p>
              <p className="text-primary-700 dark:text-neutral-300 leading-relaxed">
                The creation process can take months or even years, with countless iterations and 
                refinements until we achieve the perfect balance and complexity that defines an Aura Essence fragrance.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold text-primary-950 dark:text-neutral-100 mb-6">
            Our Team
          </h2>
          <p className="text-primary-700 dark:text-neutral-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Behind every Aura Essence fragrance is a team of passionate individuals dedicated to the art of 
            perfumery. From our master perfumers to our sustainability experts, each team member 
            brings unique expertise and creativity to our mission.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary-100 dark:bg-primary-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary-950 dark:text-neutral-100 mb-2">
                Master Perfumers
              </h3>
              <p className="text-primary-600 dark:text-neutral-400">
                Artists who transform raw materials into olfactory masterpieces
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-primary-100 dark:bg-primary-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Globe className="h-12 w-12 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary-950 dark:text-neutral-100 mb-2">
                Sourcing Specialists
              </h3>
              <p className="text-primary-600 dark:text-neutral-400">
                Experts who seek out the world's finest and most sustainable ingredients
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-primary-100 dark:bg-primary-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Award className="h-12 w-12 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary-950 dark:text-neutral-100 mb-2">
                Quality Artisans
              </h3>
              <p className="text-primary-600 dark:text-neutral-400">
                Craftspeople who ensure every bottle meets our exacting standards
              </p>
            </div>
          </div>
        </section>

        {/* Future Section */}
        <section className="bg-neutral-50 dark:bg-primary-900 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-primary-950 dark:text-neutral-100 mb-6">
            Looking Forward
          </h2>
          <p className="text-primary-700 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            As we continue to grow, Aura Essence remains committed to pushing the boundaries of luxury 
            fragrance while staying true to our core values. We're excited about expanding our 
            collections, exploring new sustainable practices, and continuing to create fragrances 
            that inspire and delight fragrance lovers around the world.
          </p>
        </section>
      </div>
    </div>
  );
}