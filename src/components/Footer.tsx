import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B192C] text-[#FAF8F5] border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-3 font-serif-display text-xl font-bold text-[#FAF8F5]">
              <img
                src="/assets/aistudio/image_42ebc6e4.png"
                alt="Satya's Education Logo"
                className="h-12 w-12 rounded-xl object-contain bg-white p-1 shadow-sm"
              />
              <span>Satya’s Education</span>
            </Link>
            <p className="text-sm text-[#FAF8F5]/75 leading-relaxed">
              Learn Today. Build Your Tomorrow. Curated technology and literary books, structured engineering courses, and prerecorded video lessons.
            </p>
          </div>

          {/* Col 2: Catalog */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-[#C59B27]">Catalog & Learning</h3>
            <ul className="space-y-2 text-sm text-[#FAF8F5]/75">
              <li>
                <Link to="/books?category=Technology" className="hover:text-white transition-colors">
                  Technology Books (20 Titles)
                </Link>
              </li>
              <li>
                <Link
                  to="/books?category=Stories+%26+Literature"
                  className="hover:text-white transition-colors"
                >
                  Stories & Literature (20 Titles)
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">
                  Online Engineering Courses
                </Link>
              </li>
              <li>
                <Link to="/recorded-classes" className="hover:text-white transition-colors">
                  Recorded Classes & Free Previews
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Subjects */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-[#C59B27]">Subjects</h3>
            <ul className="space-y-2 text-sm text-[#FAF8F5]/75">
              <li>
                <Link to="/courses?subject=Python" className="hover:text-white transition-colors">
                  Python & Async Systems
                </Link>
              </li>
              <li>
                <Link to="/courses?subject=Django" className="hover:text-white transition-colors">
                  Full-Stack Django & React
                </Link>
              </li>
              <li>
                <Link
                  to="/courses?subject=Generative+AI"
                  className="hover:text-white transition-colors"
                >
                  Generative AI & Agentic Systems
                </Link>
              </li>
              <li>
                <Link to="/courses?subject=SQL" className="hover:text-white transition-colors">
                  SQL & Database Internals
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Setup */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-[#C59B27]">Platform & Architecture</h3>
            <ul className="space-y-2 text-sm text-[#FAF8F5]/75">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Satya’s Education & Setup Guide
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact & Student Support
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Student Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF8F5]/60">
          <p>© {new Date().getFullYear()} Satya’s Education. All prices in Indian Rupees (INR).</p>
          <p>Built with React, TypeScript, Django REST Architecture, Firebase & Razorpay.</p>
        </div>
      </div>
    </footer>
  );
};
