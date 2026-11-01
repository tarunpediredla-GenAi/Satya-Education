import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, PlayCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CourseCoverArt } from '../components/CourseCoverArt';

const SUBJECT_OPTIONS = [
  'All',
  'Python',
  'Django',
  'React',
  'SQL',
  'Generative AI',
  'Agentic AI',
  'System Design',
  'Algorithms',
];

export const CoursesPage: React.FC = () => {
  const { courses, hasCourseAccess, addToCart } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialSubj = searchParams.get('subject') || 'All';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(initialSubj);
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [maxPriceInr, setMaxPriceInr] = useState(5000);

  useEffect(() => {
    const s = searchParams.get('subject');
    if (s) setSelectedSubject(s);
  }, [searchParams]);

  const activeCourses = useMemo(() => courses.filter((c) => !c.archived), [courses]);

  const filteredCourses = useMemo(() => {
    return activeCourses.filter((course) => {
      if (selectedSubject !== 'All' && course.subject !== selectedSubject) return false;
      if (selectedLevel !== 'All' && course.level !== selectedLevel) return false;
      if (course.priceInr > maxPriceInr) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          course.title.toLowerCase().includes(q) ||
          course.subtitle.toLowerCase().includes(q) ||
          course.instructor.toLowerCase().includes(q) ||
          course.subject.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [activeCourses, selectedSubject, selectedLevel, maxPriceInr, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#0B192C]/10 pb-6">
        <p className="text-xs font-mono-tabular uppercase text-[#0D6E6E]">
          Structured Engineering Curricula · Lifetime Recorded Access
        </p>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#0B192C] mt-1">
          Online Courses
        </h1>
        <p className="text-sm text-[#0B192C]/75 mt-2 max-w-2xl">
          Practical, self-paced engineering courses taught with prerecorded HD video classes, interactive code walkthroughs, and downloadable project blueprints.
        </p>
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#EAE4D7] rounded-xl">
        {SUBJECT_OPTIONS.map((subj) => (
          <button
            key={subj}
            type="button"
            onClick={() => {
              setSelectedSubject(subj);
              if (subj === 'All') searchParams.delete('subject');
              else searchParams.set('subject', subj);
              setSearchParams(searchParams);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              selectedSubject === subj
                ? 'bg-[#0B192C] text-[#FAF8F5] shadow-xs'
                : 'text-[#0B192C]/75 hover:text-[#0B192C]'
            }`}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* Search & Level / Price Filters */}
      <div className="p-5 rounded-2xl bg-white border border-[#0B192C]/10 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-5">
          <label htmlFor="course-search" className="block text-xs font-semibold text-[#0B192C] mb-1.5">
            Search Courses
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#0B192C]/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="course-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Python, Django, React, SQL, Generative AI..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
            />
          </div>
        </div>

        <div className="md:col-span-4">
          <label htmlFor="course-level" className="block text-xs font-semibold text-[#0B192C] mb-1.5">
            Difficulty Level
          </label>
          <select
            id="course-level"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
          >
            <option value="All">All Levels (Beginner to Advanced)</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label
            htmlFor="course-price"
            className="block text-xs font-semibold text-[#0B192C] mb-1.5 font-mono-tabular"
          >
            Max Price: ₹{maxPriceInr.toLocaleString('en-IN')}
          </label>
          <input
            id="course-price"
            type="range"
            min={1500}
            max={5000}
            step={250}
            value={maxPriceInr}
            onChange={(e) => setMaxPriceInr(Number(e.target.value))}
            className="w-full accent-[#0D6E6E]"
          />
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredCourses.map((course) => {
          const enrolled = hasCourseAccess(course.id);
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

                  <Link to={`/courses/${course.id}`}>
                    <h2 className="font-serif-display text-xl font-semibold text-[#0B192C] hover:text-[#0D6E6E]">
                      {course.title}
                    </h2>
                  </Link>

                  <p className="text-sm text-[#0B192C]/75 leading-relaxed">{course.subtitle}</p>
                  <p className="text-xs text-[#0B192C]/65">
                    Instructor: <strong className="text-[#0B192C]">{course.instructor}</strong>
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#0B192C]/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  {enrolled ? (
                    <span className="text-sm font-semibold text-[#0D6E6E]">Enrolled · Full Access</span>
                  ) : (
                    <>
                      <span className="text-lg font-bold font-mono-tabular text-[#0B192C]">
                        ₹{course.priceInr.toLocaleString('en-IN')}
                      </span>
                      <span className="block text-[11px] text-[#0B192C]/60">
                        Includes all recorded video classes
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {firstLesson && (
                    <button
                      type="button"
                      onClick={() => navigate(`/learn/${course.id}/${firstLesson.id}`)}
                      className="px-3.5 py-2 rounded-lg border border-[#0B192C]/20 text-xs font-semibold text-[#0B192C] hover:bg-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-[#0D6E6E]" />
                      <span>{enrolled ? 'Open Player' : 'Free Preview'}</span>
                    </button>
                  )}

                  {enrolled ? (
                    <Link
                      to={`/courses/${course.id}`}
                      className="px-4 py-2 rounded-lg bg-[#0D6E6E] text-white text-xs font-semibold hover:bg-[#0B192C] transition-colors whitespace-nowrap shrink-0"
                    >
                      Course Syllabus
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        addToCart({
                          cartItemId: course.id,
                          itemId: course.id,
                          itemType: 'course',
                          title: course.title,
                          subtitleOrAuthor: course.instructor,
                          unitPriceInr: course.priceInr,
                        })
                      }
                      className="px-4 py-2 rounded-lg bg-[#0B192C] text-white text-xs font-semibold hover:bg-[#0D6E6E] transition-colors whitespace-nowrap shrink-0"
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
