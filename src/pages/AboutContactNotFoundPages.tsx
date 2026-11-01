import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Mail, MapPin, Server, ShieldCheck, Terminal } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 border-b border-[#0B192C]/10 pb-8">
        <img
          src="/assets/aistudio/image_42ebc6e4.png"
          alt="Satya's Education Official Logo"
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-contain bg-white p-2 border border-[#0B192C]/10 shadow-sm shrink-0"
        />
        <div className="space-y-3">
          <p className="text-xs font-mono-tabular uppercase text-[#0D6E6E]">
            About Satya’s Education · Mission & Technical Architecture
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#0B192C]">
            Bridging Rigorous Engineering and Humanist Literature
          </h1>
          <p className="text-base text-[#0B192C]/80 leading-relaxed max-w-3xl">
            Satya’s Education was founded on a simple conviction: the best technologists are also thoughtful readers, and the best learning combines structured recorded lessons with enduring books. Our catalog unites 20 first-principles technology books, 20 literary story anthologies, and 8 practical online courses.
          </p>
        </div>
      </div>

      {/* Setup & Full-Stack Architecture Documentation (React + Django + Firebase + Razorpay) */}
      <div className="space-y-6">
        <h2 className="font-serif-display text-2xl font-bold text-[#0B192C]">
          Platform Setup, Security & React + Django Architecture Guide
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#0B192C]/10 space-y-3">
            <div className="flex items-center gap-2 text-[#0D6E6E] font-semibold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>1. Firebase Auth, Firestore & Storage Rules</span>
            </div>
            <p className="text-xs sm:text-sm text-[#0B192C]/75 leading-relaxed">
              Google Sign-In is powered by Firebase Authentication (<code>signInWithPopup</code>). User profiles, catalog overrides, orders, enrollments, and video timestamps are stored in Cloud Firestore and protected by zero-trust ABAC rules in <code>/firestore.rules</code> and <code>/storage.rules</code>.
            </p>
            <p className="text-xs font-mono-tabular text-[#0B192C]/65">
              First Admin Assignment: Add a document at <code>/admins/&lt;USER_UID&gt;</code> in the Firebase Console or configure the verified admin email in <code>firestore.rules</code>.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#0B192C]/10 space-y-3">
            <div className="flex items-center gap-2 text-[#0D6E6E] font-semibold text-sm">
              <Server className="w-5 h-5" />
              <span>2. Razorpay INR Payments & Idempotent Webhooks</span>
            </div>
            <p className="text-xs sm:text-sm text-[#0B192C]/75 leading-relaxed">
              All cart prices, coupon discounts (<code>SATYA10</code>, <code>LEARN20</code>), and shipping thresholds are calculated exclusively on the backend. When <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> are provided on the server, live/test Razorpay orders are created and verified via HMAC-SHA256 signatures.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#0B192C]/10 space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-[#0D6E6E] font-semibold text-sm">
              <Terminal className="w-5 h-5" />
              <span>3. Dual Backend Support: Live Node/Express Server + Django 5 REST Backend</span>
            </div>
            <p className="text-xs sm:text-sm text-[#0B192C]/75 leading-relaxed">
              In the live preview environment, <code>server.ts</code> serves the REST endpoints (<code>/api/chat</code>, <code>/api/payments/create-order</code>, <code>/api/payments/verify</code>, <code>/api/payments/webhook</code>, <code>/api/access/media</code>) on Port 3000. A complete Django 5 + Django REST Framework implementation with identical endpoints, atomic PostgreSQL transactions, and Razorpay verification is also included in <code>/django_backend/</code> for Python backend deployments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Course & Curriculum Question');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-2 border-b border-[#0B192C]/10 pb-6">
        <p className="text-xs font-mono-tabular uppercase text-[#0D6E6E]">
          Student & Bookstore Support
        </p>
        <h1 className="font-serif-display text-3xl font-bold text-[#0B192C]">
          Contact Satya’s Education
        </h1>
        <p className="text-sm text-[#0B192C]/75">
          Have a question about a book order, bulk institutional licensing, or a course curriculum? Send us a note below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-5 space-y-4 p-6 rounded-2xl bg-[#F3EDE0] border border-[#0B192C]/10">
          <h2 className="font-serif-display text-lg font-semibold text-[#0B192C]">
            Academic & Editorial Office
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-[#0B192C]/80">
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#0D6E6E]" />
              <span>support@satyaseducation.in</span>
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#0D6E6E] shrink-0 mt-1" />
              <span>Satya Press & Learning Studio, Madhapur, Hyderabad, Telangana 500081</span>
            </p>
          </div>
        </div>

        <div className="md:col-span-7 p-6 rounded-2xl bg-white border border-[#0B192C]/10">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#0D6E6E] mx-auto" />
              <h3 className="font-serif-display text-xl font-semibold text-[#0B192C]">
                Message Received
              </h3>
              <p className="text-sm text-[#0B192C]/75">
                Thank you, {name}. Our student support team will respond to {email} within one business day.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                }}
                className="text-xs font-semibold text-[#0D6E6E] hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-semibold mb-1">
                  Your Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-semibold mb-1">
                  Email Address *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label htmlFor="contact-topic" className="block text-xs font-semibold mb-1">
                  Topic
                </label>
                <select
                  id="contact-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                >
                  <option>Course & Curriculum Question</option>
                  <option>Physical Book Shipping & Order Support</option>
                  <option>E-Book Download Assistance</option>
                  <option>University / Team Bulk Licensing</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-msg" className="block text-xs font-semibold mb-1">
                  Message *
                </label>
                <textarea
                  id="contact-msg"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0B192C] text-white text-sm font-semibold hover:bg-[#0D6E6E] transition-colors"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
      <p className="text-xs font-mono-tabular uppercase text-[#B48327]">Error 404</p>
      <h1 className="font-serif-display text-3xl font-bold text-[#0B192C]">
        Page Not Found in Our Library
      </h1>
      <p className="text-sm text-[#0B192C]/75">
        The page you requested may have moved or does not exist. Explore our books, courses, or recorded lessons below.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-[#0B192C] text-white text-xs font-semibold hover:bg-[#0D6E6E]"
        >
          Return Home
        </Link>
        <Link
          to="/books"
          className="px-5 py-2.5 rounded-xl border border-[#0B192C]/20 text-xs font-semibold text-[#0B192C]"
        >
          Browse 40 Books
        </Link>
        <Link
          to="/courses"
          className="px-5 py-2.5 rounded-xl border border-[#0B192C]/20 text-xs font-semibold text-[#0B192C]"
        >
          Explore Courses
        </Link>
      </div>
    </div>
  );
};
