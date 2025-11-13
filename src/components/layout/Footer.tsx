"use client";
import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border-t border-amber-600/30">
      {/* Decorative gradient blob */}
      <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="text-3xl font-bold tracking-widest text-amber-400 hover:text-amber-300 mb-4 inline-block transition-colors duration-300">
              AURA
            </Link>
            <p className="mt-4 text-gray-300 text-sm leading-relaxed">
              Luxury fragrances crafted for the discerning individual. Experience the art of scent with our premium collection.
            </p>
            <div className="flex space-x-4 mt-8">
              <a 
                href="#" 
                className="text-gray-400 hover:text-amber-400 transition-all duration-300 p-3 hover:bg-amber-500/20 rounded-lg backdrop-blur-sm border border-amber-500/20 hover:border-amber-400/50"
                title="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-amber-400 transition-all duration-300 p-3 hover:bg-amber-500/20 rounded-lg backdrop-blur-sm border border-amber-500/20 hover:border-amber-400/50"
                title="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-amber-400 transition-all duration-300 p-3 hover:bg-amber-500/20 rounded-lg backdrop-blur-sm border border-amber-500/20 hover:border-amber-400/50"
                title="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-widest text-amber-400 relative pb-3">
              Collections
              <span className="absolute bottom-0 left-0 w-8 h-1 bg-gradient-to-r from-amber-400 to-transparent"></span>
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link 
                  href="/collections/men" 
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 inline-flex items-center group"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> Men's Fragrances
                </Link>
              </li>
              <li>
                <Link 
                  href="/collections/women" 
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 inline-flex items-center group"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> Women's Fragrances
                </Link>
              </li>
              <li>
                <Link 
                  href="/collections/unisex" 
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 inline-flex items-center group"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> Unisex Collection
                </Link>
              </li>
              <li>
                <Link 
                  href="/collections/inspired" 
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 inline-flex items-center group"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> Inspired Perfumes
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-widest text-amber-400 relative pb-3">
              Support
              <span className="absolute bottom-0 left-0 w-8 h-1 bg-gradient-to-r from-amber-400 to-transparent"></span>
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 inline-flex items-center group"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 inline-flex items-center group"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> About Aura Essence
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 inline-flex items-center group"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> Shipping Info
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 inline-flex items-center group"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> Returns & Exchanges
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-widest text-amber-400 relative pb-3">
              Legal
              <span className="absolute bottom-0 left-0 w-8 h-1 bg-gradient-to-r from-amber-400 to-transparent"></span>
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 inline-flex items-center group"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 inline-flex items-center group"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> Terms of Service
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 inline-flex items-center group"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 rounded-lg hover:bg-amber-500/10 transition-colors duration-300">
              <p className="text-amber-400 font-semibold mb-1 text-lg">✓ Premium Quality</p>
              <p className="text-sm text-gray-400">100% authentic fragrances</p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-amber-500/10 transition-colors duration-300">
              <p className="text-amber-400 font-semibold mb-1 text-lg">✓ Free Shipping</p>
              <p className="text-sm text-gray-400">On orders over $100</p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-amber-500/10 transition-colors duration-300">
              <p className="text-amber-400 font-semibold mb-1 text-lg">✓ 30-Day Returns</p>
              <p className="text-sm text-gray-400">Satisfaction guaranteed</p>
            </div>
          </div>

          <div className="text-center text-sm text-gray-400 space-y-2">
            <p>&copy; {new Date().getFullYear()} Aura Essence Fragrances. All rights reserved.</p>
            <p className="text-xs text-gray-500">Crafted with luxury and sophistication in every bottle.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}