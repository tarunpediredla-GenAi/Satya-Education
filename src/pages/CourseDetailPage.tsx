import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  PlayCircle,
  Lock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CourseCoverArt } from '../components/CourseCoverArt';

export const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { courses, hasCourseAccess, addToCart, progressMap } = useApp();
  const navigate = useNavigate();

  const course = courses.find((c) => c.id === courseId);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    [course?.modules[0]?.id || '']: true,
    [course?.modules[1]?.id || '']: true,
  });

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-serif-display text-2xl font-bold text-[#0B192C]">Course Not Found</h1>
        <Link to="/courses" className="text-sm font-semibold text-[#0D6E6E] hover:underline">
          ← Back to Courses
        </Link>
      </div>
    );
  }

  const enrolled = hasCourseAccess(course.id);
  const firstLesson = course.modules[0]?.lessons[0];

  const handleEnrollNow = () => {
    addToCart({
      cartItemId: course.id,
      itemId: course.id,
      itemType: 'course',
      title: course.title,
      subtitleOrAuthor: course.instructor,
      unitPriceInr: course.priceInr,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <Link
        to="/courses"
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#0B192C]/70 hover:text-[#0B192C]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Courses</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left 8 Cols: Course Overview, Outcomes, Curriculum */}
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-3 border-b border-[#0B192C]/10 pb-6">
            <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#0D6E6E]">
              <span>{course.subject}</span>
              <span aria-hidden="true">·</span>
              <span>{course.level}</span>
              <span aria-hidden="true">·</span>
              <span>{course.duration}</span>
              <span aria-hidden="true">·</span>
              <span>{course.language}</span>
            </div>
            <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#0B192C]">
              {course.title}
            </h1>
            <p className="text-base sm:text-lg text-[#0B192C]/75 leading-relaxed">
              {course.subtitle}
            </p>
            <p className="text-sm text-[#0B192C]">
              Taught by <strong>{course.instructor}</strong> ({course.instructorRole})
            </p>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h2 className="font-serif-display text-xl font-semibold text-[#0B192C]">
              Course Overview
            </h2>
            <p className="text-sm sm:text-base text-[#0B192C]/80 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Learning Outcomes */}
          <div className="p-6 rounded-2xl bg-white border border-[#0B192C]/10 space-y-4">
            <h2 className="font-serif-display text-xl font-semibold text-[#0B192C]">
              What You Will Learn
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {course.outcomes.map((outcome) => (
                <div key={outcome} className="flex items-start gap-2.5 text-sm text-[#0B192C]/80">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6E6E] shrink-0 mt-1" />
                  <span>{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expandable Curriculum Modules & Recorded Lessons */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-display text-2xl font-bold text-[#0B192C]">
                Curriculum & Recorded Classes
              </h2>
              <span className="text-xs font-mono-tabular text-[#0B192C]/65">
                {course.modules.length} Modules ·{' '}
                {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons
              </span>
            </div>

            {course.modules.map((mod) => {
              const isOpen = Boolean(expandedModules[mod.id]);
              return (
                <div
                  key={mod.id}
                  className="rounded-2xl bg-white border border-[#0B192C]/10 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedModules((prev) => ({ ...prev, [mod.id]: !prev[mod.id] }))
                    }
                    aria-expanded={isOpen}
                    className="w-full px-6 py-4 bg-[#FAF8F5] flex items-center justify-between text-left hover:bg-[#F3EDE0] transition-colors"
                  >
                    <div>
                      <h3 className="font-serif-display text-base sm:text-lg font-semibold text-[#0B192C]">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-[#0B192C]/65 mt-0.5">{mod.description}</p>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#0D6E6E] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#0B192C]/50 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="divide-y divide-[#0B192C]/10">
                      {mod.lessons.map((lesson) => {
                        const canWatch = enrolled || lesson.isFreePreview;
                        const prog = progressMap[lesson.id];
                        return (
                          <div
                            key={lesson.id}
                            className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5]/60"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {prog?.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-[#0D6E6E] shrink-0" />
                                ) : canWatch ? (
                                  <PlayCircle className="w-4 h-4 text-[#0D6E6E] shrink-0" />
                                ) : (
                                  <Lock className="w-4 h-4 text-[#0B192C]/40 shrink-0" />
                                )}
                                <span className="text-sm font-semibold text-[#0B192C]">
                                  {lesson.title}
                                </span>
                              </div>
                              <p className="text-xs text-[#0B192C]/65 pl-6">{lesson.summary}</p>
                            </div>

                            <div className="flex items-center gap-3 pl-6 sm:pl-0 shrink-0">
                              <span className="text-xs font-mono-tabular text-[#0B192C]/60">
                                {lesson.durationMinutes} min
                              </span>
                              {canWatch ? (
                                <Link
                                  to={`/learn/${course.id}/${lesson.id}`}
                                  className="px-3 py-1.5 rounded-lg bg-[#0D6E6E]/10 text-[#0D6E6E] hover:bg-[#0D6E6E] hover:text-white text-xs font-semibold transition-colors whitespace-nowrap"
                                >
                                  {lesson.isFreePreview && !enrolled ? 'Free Preview' : 'Watch Class'}
                                </Link>
                              ) : (
                                <span className="text-xs text-[#0B192C]/50 font-mono-tabular">
                                  Enrolled Only
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Prerequisites */}
          <div className="p-6 rounded-2xl bg-[#F3EDE0] border border-[#0B192C]/10 space-y-2">
            <h3 className="font-serif-display text-lg font-semibold text-[#0B192C]">
              Prerequisites
            </h3>
            <ul className="list-disc list-inside text-sm text-[#0B192C]/80 space-y-1">
              {course.prerequisites.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right 4 Cols: Sticky Enrollment Module */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="rounded-2xl bg-white border border-[#0B192C]/15 overflow-hidden shadow-sm">
            <CourseCoverArt course={course} className="h-44" />
            <div className="p-6 space-y-5">
              <div>
                <span className="text-xs text-[#0B192C]/60 uppercase font-mono-tabular">
                  Full Course Enrollment
                </span>
                <div className="text-3xl font-bold font-mono-tabular text-[#0B192C] mt-1">
                  ₹{course.priceInr.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-[#0B192C]/65 mt-1">
                  One-time payment · Lifetime access to all recorded classes, captions, and code notes
                </p>
              </div>

              {enrolled ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#0D6E6E]/10 text-[#0D6E6E] text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>You are enrolled in this course</span>
                  </div>
                  {firstLesson && (
                    <Link
                      to={`/learn/${course.id}/${firstLesson.id}`}
                      className="w-full py-3 px-4 rounded-xl bg-[#0B192C] text-white text-sm font-semibold hover:bg-[#0D6E6E] transition-colors flex items-center justify-center gap-2"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Continue Recorded Classes</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleEnrollNow();
                      navigate('/checkout');
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-[#0B192C] text-white text-sm font-semibold hover:bg-[#0D6E6E] transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Enroll Now — ₹{course.priceInr.toLocaleString('en-IN')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEnrollNow}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#0B192C]/20 text-[#0B192C] text-xs font-semibold hover:bg-[#FAF8F5] transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add Course to Bag</span>
                  </button>

                  {firstLesson && (
                    <Link
                      to={`/learn/${course.id}/${firstLesson.id}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#FAF8F5] text-[#0D6E6E] text-xs font-semibold hover:underline flex items-center justify-center gap-1.5"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Watch Lesson 1 Free Preview</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
