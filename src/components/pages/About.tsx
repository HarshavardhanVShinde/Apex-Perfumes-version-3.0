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
    <div className="min-h-screen">
      {/* Premium Hero Section - Mobile Optimized */}
      <section className="relative min-h-[50vh] sm:min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-amber-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl py-12 sm:py-0">
          <div className="mb-4 sm:mb-6 inline-block">
            <span className="text-amber-400 text-xs sm:text-sm font-semibold tracking-widest">OUR STORY</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-wider text-white mb-4 sm:mb-6 leading-tight">
            The Aura Élixir Story
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-100 tracking-wide font-light max-w-3xl mx-auto leading-relaxed">
            Born from a passion for extraordinary fragrance and an unwavering commitment to excellence, 
            Aura Élixir represents the pinnacle of luxury perfumery.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Story Section - Mobile Enhanced */}
        <section className="py-12 sm:py-16 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
          <div>
            <span className="text-amber-600 text-xs sm:text-sm font-semibold tracking-widest">SINCE 2020</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 mt-3 sm:mt-4">
              Our Beginning
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-gray-300 mb-4 leading-relaxed">
              Aura Élixir was founded in 2020 by a team of fragrance enthusiasts who believed that luxury 
              perfumery had lost touch with its artisanal roots. We set out to create a brand that 
              would honor the traditional craftsmanship of perfume-making while embracing modern 
              innovation and sustainability.
            </p>
            <p className="text-slate-600 dark:text-gray-300 mb-4 leading-relaxed text-lg">
              Our journey began in a small atelier in Grasse, France, the historic heart of perfumery. 
              Working closely with master perfumers and sourcing the finest raw materials from around 
              the world, we developed our first collection of distinctive fragrances.
            </p>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed text-lg">
              Today, Aura Élixir has grown into a globally recognized luxury fragrance house, but we remain 
              true to our founding principles: uncompromising quality, artistic integrity, and the 
              belief that fragrance is the ultimate form of personal expression.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/1191710/pexels-photo-1191710.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Aura Élixir atelier"
              className="rounded-lg shadow-2xl"
            />
          </div>
        </section>

        {/* Values Section - Mobile Enhanced */}
        <section className="py-12 sm:py-16 md:py-20 bg-slate-50 dark:bg-slate-900 -mx-4 sm:-mx-6 px-4 sm:px-6 lg:-mx-[calc((100vw-1280px)/2)] lg:px-[calc((100vw-1280px)/2)]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <span className="text-amber-600 text-xs sm:text-sm font-semibold tracking-widest">WHAT DRIVES US</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mt-3 sm:mt-4 mb-3 sm:mb-4 px-4">
                Our Values
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-slate-200 dark:border-slate-700 hover:scale-105">
                  <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10 rounded-full mb-4 sm:mb-6 shadow-md">
                    <value.icon className="h-7 w-7 sm:h-8 sm:w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3">
                    {value.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Fragrance creation process"
                className="rounded-lg shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-amber-600 text-sm font-semibold tracking-widest">CRAFTSMANSHIP</span>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 mt-4">
                Our Process
              </h2>
              <p className="text-slate-600 dark:text-gray-300 mb-4 leading-relaxed text-lg">
                Each Aura Élixir fragrance begins with a concept—a moment, emotion, or memory that we want 
                to capture in scent. Our master perfumers then embark on a journey of discovery, 
                selecting and blending the finest ingredients to bring that vision to life.
              </p>
              <p className="text-slate-600 dark:text-gray-300 mb-4 leading-relaxed text-lg">
                We source our ingredients from the world's most prestigious suppliers: Bulgarian rose, 
                Indian sandalwood, Italian bergamot, and Madagascar vanilla. Each ingredient is 
                carefully evaluated for quality and character before being incorporated into our formulations.
              </p>
              <p className="text-slate-600 dark:text-gray-300 leading-relaxed text-lg">
                The creation process can take months or even years, with countless iterations and 
                refinements until we achieve the perfect balance and complexity that defines an Aura Élixir fragrance.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="text-center mb-16">
            <span className="text-amber-600 text-sm font-semibold tracking-widest">THE PEOPLE BEHIND THE SCENTS</span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 mt-4">
              Our Team
            </h2>
            <p className="text-slate-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed text-lg">
              Behind every Aura Élixir fragrance is a team of passionate individuals dedicated to the art of 
              perfumery. From our master perfumers to our sustainability experts, each team member 
              brings unique expertise and creativity to our mission.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-slate-50 dark:bg-slate-900 p-8 rounded-lg">
              <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Master Perfumers
              </h3>
              <p className="text-slate-600 dark:text-gray-400">
                Artists who transform raw materials into olfactory masterpieces
              </p>
            </div>
            
            <div className="text-center bg-slate-50 dark:bg-slate-900 p-8 rounded-lg">
              <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Globe className="h-12 w-12 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Sourcing Specialists
              </h3>
              <p className="text-slate-600 dark:text-gray-400">
                Experts who seek out the world's finest and most sustainable ingredients
              </p>
            </div>
            
            <div className="text-center bg-slate-50 dark:bg-slate-900 p-8 rounded-lg">
              <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Award className="h-12 w-12 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Quality Artisans
              </h3>
              <p className="text-slate-600 dark:text-gray-400">
                Craftspeople who ensure every bottle meets our exacting standards
              </p>
            </div>
          </div>
        </section>

        {/* Future Section */}
        <section className="py-20">
          <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-12 text-center shadow-2xl">
            <span className="text-amber-400 text-sm font-semibold tracking-widest">THE FUTURE</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 mt-4">
              Looking Forward
            </h2>
            <p className="text-gray-100 max-w-3xl mx-auto leading-relaxed text-lg">
              As we continue to grow, Aura Élixir remains committed to pushing the boundaries of luxury 
              fragrance while staying true to our core values. We're excited about expanding our 
              collections, exploring new sustainable practices, and continuing to create fragrances 
              that inspire and delight fragrance lovers around the world.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}