"use client";
import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border-t border-purple-600/30">
      {/* Decorative gradient blob */}
      <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-8 mb-8 sm:mb-10">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="text-2xl sm:text-3xl font-bold tracking-widest text-purple-400 hover:text-purple-300 mb-3 inline-block transition-colors duration-300">
              Aura Élixir
            </Link>
            <p className="mt-3 text-gray-300 text-sm leading-relaxed mb-4 sm:mb-6">
              Luxury fragrances crafted for the discerning individual. Experience the art of scent with our premium collection.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-purple-400 transition-all duration-300 p-2 hover:bg-purple-500/20 rounded-lg backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/50"
                title="Facebook"
              >
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-purple-400 transition-all duration-300 p-2 hover:bg-purple-500/20 rounded-lg backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/50"
                title="Instagram"
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-purple-400 transition-all duration-300 p-2 hover:bg-purple-500/20 rounded-lg backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/50"
                title="Twitter"
              >
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest text-purple-400 relative pb-2">
              Collections
              <span className="absolute bottom-0 left-0 w-6 h-0.5 bg-gradient-to-r from-purple-400 to-transparent"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  href="/collections/men" 
                  className="text-gray-300 hover:text-purple-400 transition-all duration-300 inline-flex items-center group text-sm"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> Men's Fragrances
                </Link>
              </li>
              <li>
                <Link 
                  href="/collections/women" 
                  className="text-gray-300 hover:text-purple-400 transition-all duration-300 inline-flex items-center group text-sm"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> Women's Fragrances
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest text-purple-400 relative pb-2">
              Support
              <span className="absolute bottom-0 left-0 w-6 h-0.5 bg-gradient-to-r from-purple-400 to-transparent"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-300 hover:text-purple-400 transition-all duration-300 inline-flex items-center group"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-300 hover:text-purple-400 transition-all duration-300 inline-flex items-center group"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> About Aura Élixir
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-purple-400 transition-all duration-300 inline-flex items-center group"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> Shipping Info
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-purple-400 transition-all duration-300 inline-flex items-center group"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> Returns & Exchanges
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest text-purple-400 relative pb-2">
              Legal
              <span className="absolute bottom-0 left-0 w-6 h-0.5 bg-gradient-to-r from-purple-400 to-transparent"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-gray-300 hover:text-purple-400 transition-all duration-300 inline-flex items-center group"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-gray-300 hover:text-purple-400 transition-all duration-300 inline-flex items-center group"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> Terms of Service
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-purple-400 transition-all duration-300 inline-flex items-center group"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span> FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 sm:mt-10 pt-6 sm:pt-8">
          <div className="text-center text-sm text-gray-400 space-y-1">
            <p>&copy; {new Date().getFullYear()} Aura Élixir. All rights reserved.</p>
            <p className="text-xs text-gray-500">Crafted with luxury and sophistication in every bottle.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}