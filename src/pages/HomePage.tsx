import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, PlayCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BookCoverArt } from '../components/BookCoverArt';
import { CourseCoverArt } from '../components/CourseCoverArt';
import { SAMPLE_DEMO_REVIEWS, FAQ_ITEMS } from '../data/catalogData';

const SUBJECT_CARDS = [
  { name: 'Python', desc: 'Data model, async TaskGroups, and systems scripting', link: '/courses?subject=Python' },
  { name: 'Django', desc: 'ORM internals, REST APIs, and atomic transactions', link: '/courses?subject=Django' },
  { name: 'React', desc: 'Concurrent UI, TypeScript state machines, and WCAG design', link: '/courses?subject=React' },
  { name: 'SQL', desc: 'PostgreSQL B-Tree indexes, MVCC, and window functions', link: '/courses?subject=SQL' },
  { name: 'Generative AI', desc: 'Gemini SDK, structured JSON schemas, and hybrid RAG', link: '/courses?subject=Generative+AI' },
  { name: 'Agentic AI', desc: 'Function calling, tool loops, and human-in-the-loop safety', link: '/courses?subject=Agentic+AI' },
  { name: 'Technology Books', desc: '20 rigorous engineering texts in print and e-book', link: '/books?category=Technology' },
  { name: 'Stories & Literature', desc: '20 anthologies of wisdom fables, history, and sci-fi', link: '/books?category=Stories+%26+Literature' },
];

export const HomePage: React.FC = () => {
  const { books, courses, progressMap, addToCart } = useApp();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const featuredCourses = courses.filter((c) => !c.archived && c.featured).slice(0, 4);
  const bestsellingBooks = books.filter((b) => !b.archived && b.bestseller).slice(0, 8);

  // Check if user has any active lesson in progress
  const activeProgressList = Object.values(progressMap).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
  const latestProgress = activeProgressList[0];
  const continueCourse = latestProgress
    ? courses.find((c) => c.id === latestProgress.courseId)
    : undefined;

  return (
    <div className="space-y-20">
      {/* 1. Hero Section */}
      <section className="relative bg-[#0B192C] text-[#FAF8F5] overflow-hidden border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <p className="text-xs sm:text-sm font-mono-tabular tracking-wider uppercase text-[#C59B27]">
              Satya’s Education · Books · Online Courses · Recorded Classes
            </p>
            <h1
              className="font-serif-display font-bold tracking-tight text-[#FAF8F5] leading-[1.12]"
              style={{ fontSize: 'clamp(2.25rem, 4vw, 3.75rem)' }}
            >
              Learn Today. Build Your Tomorrow.
            </h1>
            <p className="text-base sm:text-lg text-[#FAF8F5]/80 max-w-2xl leading-relaxed">
              Thoughtfully crafted engineering courses, prerecorded video lessons with interactive code slides, and 40 curated books spanning modern software architecture and timeless literary stories.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/courses"
                className="px-6 py-3.5 rounded-xl bg-[#0D6E6E] text-white font-semibold text-sm hover:bg-[#0F8282] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/books"
                className="px-6 py-3.5 rounded-xl bg-[#FAF8F5] text-[#0B192C] font-semibold text-sm hover:bg-[#E6C775] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <BookOpen className="w-4 h-4" />
                <span>Shop Books (40 Titles)</span>
              </Link>
              <Link
                to="/recorded-classes"
                className="px-5 py-3.5 rounded-xl border border-white/20 text-[#FAF8F5] font-medium text-sm hover:bg-white/10 transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <PlayCircle className="w-4 h-4 text-[#C59B27]" />
                <span>Watch Free Previews</span>
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[#FAF8F5]/70 font-mono-tabular">
              <span>20 Technology Books</span>
              <span aria-hidden="true">·</span>
              <span>20 Stories & Literature Books</span>
              <span aria-hidden="true">·</span>
              <span>8 Flagship Courses</span>
              <span aria-hidden="true">·</span>
              <span>Instant E-Book & Video Access</span>
            </div>
          </div>

          {/* Right Editorial Book & Course Showcase */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-2xl bg-[#132640] border border-white/10 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between text-xs text-[#FAF8F5]/75 border-b border-white/10 pb-3">
                <span className="flex items-center gap-2.5 font-semibold text-[#C59B27]">
                  <img
                    src="/assets/aistudio/image_42ebc6e4.png"
                    alt="Satya's Education"
                    className="w-7 h-7 rounded-md bg-white p-0.5 object-contain"
                  />
                  <span>Curated Study Shelf</span>
                </span>
                <span className="font-mono-tabular">INR Pricing · Print & Digital</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {bestsellingBooks.slice(0, 2).map((book) => (
                  <Link
                    key={book.id}
                    to={`/books/${book.id}`}
                    className="group block transition-transform hover:-translate-y-1"
                  >
                    <BookCoverArt book={book} className="h-56 w-full" compact />
                    <p className="mt-2 text-xs font-medium text-[#FAF8F5] truncate group-hover:text-[#C59B27]">
                      {book.title}
                    </p>
                    <p className="text-[11px] font-mono-tabular text-[#FAF8F5]/65">
                      E-Book ₹{book.ebookPriceInr} · Print ₹{book.priceInr}
                    </p>
                  </Link>
                ))}
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[#FAF8F5]/75">Free preview lessons available in all courses</span>
                <Link to="/recorded-classes" className="text-[#C59B27] font-semibold hover:underline">
                  Open Player →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Optional Continue Learning Banner if user has saved progress */}
      {latestProgress && continueCourse && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 rounded-2xl bg-white border border-[#0B192C]/15 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-mono-tabular uppercase text-[#0D6E6E]">
                Continue Learning · Saved Playback Position
              </p>
              <h2 className="font-serif-display text-lg font-semibold text-[#0B192C] mt-0.5">
                {continueCourse.title}
              </h2>
              <p className="text-xs text-[#0B192C]/70 mt-1">
                Resume at {Math.floor(latestProgress.playbackSeconds / 60)}m{' '}
                {latestProgress.playbackSeconds % 60}s
              </p>
            </div>
            <Link
              to={`/learn/${latestProgress.courseId}/${latestProgress.lessonId}`}
              className="px-5 py-2.5 rounded-xl bg-[#0B192C] text-white text-xs sm:text-sm font-semibold hover:bg-[#0D6E6E] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Resume Recorded Lesson</span>
            </Link>
          </div>
        </section>
      )}

      {/* 2. Browse by Subject */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#0B192C]/10 pb-4">
          <div>
            <p className="text-xs font-mono-tabular uppercase text-[#0D6E6E]">Structured Disciplines</p>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#0B192C] mt-1">
              Browse by Subject
            </h2>
          </div>
          <Link to="/courses" className="text-sm font-semibold text-[#0D6E6E] hover:underline">
            View all subjects →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SUBJECT_CARDS.map((subj) => (
            <Link
              key={subj.name}
              to={subj.link}
              className="p-5 rounded-xl bg-white border border-[#0B192C]/10 hover:border-[#0D6E6E] transition-all hover:-translate-y-0.5 flex flex-col justify-between gap-3"
            >
              <div>
                <h3 className="font-serif-display text-lg font-semibold text-[#0B192C]">
                  {subj.name}
                </h3>
                <p className="text-xs text-[#0B192C]/70 mt-1 leading-relaxed">{subj.desc}</p>
              </div>
              <span className="text-xs font-semibold text-[#0D6E6E]">Explore {subj.name} →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#0B192C]/10 pb-4">
          <div>
            <p className="text-xs font-mono-tabular uppercase text-[#0D6E6E]">
              Practical Engineering & Recorded Lessons
            </p>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#0B192C] mt-1">
              Featured Online Courses
            </h2>
          </div>
          <Link to="/courses" className="text-sm font-semibold text-[#0D6E6E] hover:underline">
            Explore all {courses.filter((c) => !c.archived).length} courses →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredCourses.map((course) => {
            const firstLesson = course.modules[0]?.lessons[0];
            return (
              <div
                key={course.id}
                className="rounded-2xl bg-white border border-[#0B192C]/10 overflow-hidden flex flex-col justify-between transition-transform hover:-translate-y-0.5"
              >
                <div>
                  <Link to={`/courses/${course.id}`}>
                    <CourseCoverArt course={course} className="h-48" />
                  </Link>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-[#0B192C]/60 font-mono-tabular">
                      <span>{course.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span>{course.level}</span>
                      <span aria-hidden="true">·</span>
                      <span>{course.duration}</span>
                      <span aria-hidden="true">·</span>
                      <span>{course.language}</span>
                    </div>
                    <Link to={`/courses/${course.id}`} className="block">
                      <h3 className="font-serif-display text-xl font-semibold text-[#0B192C] hover:text-[#0D6E6E] transition-colors">
                        {course.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-[#0B192C]/75 line-clamp-2 leading-relaxed">
                      {course.subtitle}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#0B192C]/10 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-lg font-bold font-mono-tabular text-[#0B192C]">
                      ₹{course.priceInr.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[11px] text-[#0B192C]/60">
                      Lifetime access to recorded classes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {firstLesson && (
                      <button
                        type="button"
                        onClick={() => navigate(`/learn/${course.id}/${firstLesson.id}`)}
                        className="px-3 py-2 rounded-lg border border-[#0B192C]/20 text-xs font-medium text-[#0B192C] hover:bg-white transition-colors whitespace-nowrap shrink-0"
                      >
                        Free Preview
                      </button>
                    )}
                    <Link
                      to={`/courses/${course.id}`}
                      className="px-4 py-2 rounded-lg bg-[#0B192C] text-white text-xs font-semibold hover:bg-[#0D6E6E] transition-colors whitespace-nowrap shrink-0"
                    >
                      View Curriculum
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Bestselling Technology & Stories Books */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#0B192C]/10 pb-4">
          <div>
            <p className="text-xs font-mono-tabular uppercase text-[#0D6E6E]">
              Hardcover Print & Instant E-Books
            </p>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#0B192C] mt-1">
              Bestselling Technology & Story Books
            </h2>
          </div>
          <Link to="/books" className="text-sm font-semibold text-[#0D6E6E] hover:underline">
            Browse all 40 books →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellingBooks.map((book) => (
            <div
              key={book.id}
              className="rounded-xl bg-white border border-[#0B192C]/10 p-4 flex flex-col justify-between transition-transform hover:-translate-y-0.5"
            >
              <div>
                <Link to={`/books/${book.id}`} className="block mb-4">
                  <BookCoverArt book={book} className="h-64 w-full" />
                </Link>
                <div className="text-xs text-[#0B192C]/60 font-mono-tabular mb-1">
                  {book.category} · {book.subcategory}
                </div>
                <Link to={`/books/${book.id}`}>
                  <h3 className="font-serif-display text-base font-semibold text-[#0B192C] hover:text-[#0D6E6E] line-clamp-2">
                    {book.title}
                  </h3>
                </Link>
                <p className="text-xs text-[#0B192C]/70 mt-1">{book.author}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#0B192C]/10 flex items-center justify-between gap-2">
                <div>
                  <span className="text-sm font-bold font-mono-tabular text-[#0B192C]">
                    ₹{book.ebookPriceInr}
                  </span>
                  <span className="text-[11px] text-[#0B192C]/60 block">
                    E-Book · Print ₹{book.priceInr}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    addToCart({
                      cartItemId: `${book.id}_E-Book`,
                      itemId: book.id,
                      itemType: 'ebook',
                      title: `${book.title} (E-Book)`,
                      subtitleOrAuthor: book.author,
                      unitPriceInr: book.ebookPriceInr,
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-[#0B192C] text-white text-xs font-medium hover:bg-[#0D6E6E] transition-colors whitespace-nowrap shrink-0"
                >
                  Add E-Book
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Benefits of Learning with Satya's Education */}
      <section className="bg-[#F3EDE0] border-y border-[#0B192C]/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-mono-tabular uppercase text-[#0D6E6E]">
              Why Satya’s Education
            </p>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#0B192C]">
              Designed for Deep Understanding, Not Passive Watching
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#0B192C]/10 space-y-3">
              <CheckCircle2 className="w-6 h-6 text-[#0D6E6E]" />
              <h3 className="font-serif-display text-lg font-semibold text-[#0B192C]">
                01. First-Principles Engineering & Literature
              </h3>
              <p className="text-sm text-[#0B192C]/75 leading-relaxed">
                Pair deep technical mastery in Python, Django, React, SQL, and AI with thoughtful literary stories that sharpen observation and ethical reasoning.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#0B192C]/10 space-y-3">
              <CheckCircle2 className="w-6 h-6 text-[#0D6E6E]" />
              <h3 className="font-serif-display text-lg font-semibold text-[#0B192C]">
                02. Interactive Recorded Classes & Resume Sync
              </h3>
              <p className="text-sm text-[#0B192C]/75 leading-relaxed">
                Our prerecorded lessons include synchronized code walkthroughs, closed captions, playback speed controls, personal notes, and automatic timestamp resume.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#0B192C]/10 space-y-3">
              <CheckCircle2 className="w-6 h-6 text-[#0D6E6E]" />
              <h3 className="font-serif-display text-lg font-semibold text-[#0B192C]">
                03. Transparent INR Pricing & Instant Digital Delivery
              </h3>
              <p className="text-sm text-[#0B192C]/75 leading-relaxed">
                Purchase downloadable e-books, clothbound print editions, or full courses in a single unified cart with server-verified Razorpay checkout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Sample Student Reviews (Clearly Identified as Demo Content) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-[#0B192C]/10 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <p className="text-xs font-mono-tabular uppercase text-[#B48327]">
              Sample Student Feedback (Demo Content)
            </p>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#0B192C] mt-1">
              What Learners Experience
            </h2>
          </div>
          <span className="text-xs text-[#0B192C]/60">
            Illustrative reviews for demonstration purposes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_DEMO_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-xl bg-white border border-[#0B192C]/10 flex flex-col justify-between space-y-4"
            >
              <p className="text-sm text-[#0B192C]/80 leading-relaxed">“{rev.quote}”</p>
              <div className="pt-3 border-t border-[#0B192C]/10">
                <p className="text-sm font-semibold text-[#0B192C]">{rev.name}</p>
                <p className="text-xs text-[#0B192C]/60">{rev.role}</p>
                <p className="text-xs text-[#0D6E6E] mt-1 font-medium">{rev.program}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs font-mono-tabular uppercase text-[#0D6E6E]">Clarity & Trust</p>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#0B192C]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={item.question}
                className="rounded-xl bg-white border border-[#0B192C]/10 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#0B192C] hover:bg-[#FAF8F5] transition-colors"
                >
                  <span>{item.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#0D6E6E] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#0B192C]/50 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-[#0B192C]/75 leading-relaxed border-t border-[#0B192C]/5 pt-3">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
