import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Lock, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RecordedClassesPage: React.FC = () => {
  const { courses, hasCourseAccess, progressMap } = useApp();
  const activeCourses = courses.filter((c) => !c.archived);

  const progressEntries = Object.values(progressMap).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="border-b border-[#0B192C]/10 pb-6 space-y-2">
        <p className="text-xs font-mono-tabular uppercase text-[#0D6E6E]">
          Prerecorded Video Curriculum · Interactive Code Walkthroughs
        </p>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#0B192C]">
          Recorded Classes Library
        </h1>
        <p className="text-sm text-[#0B192C]/75 max-w-2xl leading-relaxed">
          Watch uploaded, studio-recorded engineering classes with variable playback speed, closed captions, synchronized code slides, downloadable notes, and automatic timestamp resume.
        </p>
      </div>

      {/* Continue Learning Section */}
      {progressEntries.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-serif-display text-xl font-bold text-[#0B192C]">
            Continue Learning
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {progressEntries.slice(0, 3).map((entry) => {
              const course = courses.find((c) => c.id === entry.courseId);
              const lesson = course?.modules
                .flatMap((m) => m.lessons)
                .find((l) => l.id === entry.lessonId);
              if (!course || !lesson) return null;

              return (
                <Link
                  key={entry.id}
                  to={`/learn/${course.id}/${lesson.id}`}
                  className="p-5 rounded-xl bg-white border border-[#0B192C]/15 hover:border-[#0D6E6E] transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono-tabular text-[#0D6E6E]">
                      <span>{course.subject}</span>
                      <span>
                        {entry.completed
                          ? 'Completed'
                          : `Saved at ${Math.floor(entry.playbackSeconds / 60)}m ${
                              entry.playbackSeconds % 60
                            }s`}
                      </span>
                    </div>
                    <h3 className="font-serif-display text-base font-semibold text-[#0B192C]">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-[#0B192C]/65 truncate">{course.title}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0B192C]">
                    <PlayCircle className="w-4 h-4 text-[#0D6E6E]" />
                    <span>Resume Lesson →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* All Course Recorded Class Trackers */}
      <section className="space-y-8">
        {activeCourses.map((course) => {
          const enrolled = hasCourseAccess(course.id);
          const allLessons = course.modules.flatMap((m) => m.lessons);
          const completedCount = allLessons.filter((l) => progressMap[l.id]?.completed).length;
          const pct =
            allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

          return (
            <div
              key={course.id}
              className="rounded-2xl bg-white border border-[#0B192C]/10 overflow-hidden"
            >
              <div className="p-6 bg-[#FAF8F5] border-b border-[#0B192C]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono-tabular text-[#0D6E6E]">
                    {course.subject} · {course.level} · Instructor: {course.instructor}
                  </div>
                  <h2 className="font-serif-display text-xl font-bold text-[#0B192C]">
                    {course.title}
                  </h2>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs font-mono-tabular text-[#0B192C]/70 block">
                      Progress: {completedCount}/{allLessons.length} ({pct}%)
                    </span>
                    <div className="w-32 h-2 bg-[#0B192C]/10 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-[#0D6E6E] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  {!enrolled && (
                    <Link
                      to={`/courses/${course.id}`}
                      className="px-4 py-2 rounded-lg bg-[#0B192C] text-white text-xs font-semibold hover:bg-[#0D6E6E] transition-colors whitespace-nowrap shrink-0"
                    >
                      Unlock Full Course (₹{course.priceInr.toLocaleString('en-IN')})
                    </Link>
                  )}
                </div>
              </div>

              <div className="divide-y divide-[#0B192C]/10">
                {allLessons.map((lesson) => {
                  const canWatch = enrolled || lesson.isFreePreview;
                  const saved = progressMap[lesson.id];

                  return (
                    <div
                      key={lesson.id}
                      className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF8F5]/50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          {saved?.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#0D6E6E] shrink-0" />
                          ) : canWatch ? (
                            <PlayCircle className="w-4 h-4 text-[#0D6E6E] shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 text-[#0B192C]/40 shrink-0" />
                          )}
                          <h3 className="text-sm font-semibold text-[#0B192C]">{lesson.title}</h3>
                          <span className="text-xs font-mono-tabular text-[#0B192C]/55">
                            · {lesson.isFreePreview ? 'Free Preview' : enrolled ? 'Unlocked' : 'Paid Lesson'}
                          </span>
                        </div>
                        <p className="text-xs text-[#0B192C]/70 pl-6.5">{lesson.summary}</p>
                      </div>

                      <div className="flex items-center gap-4 pl-6.5 sm:pl-0 shrink-0">
                        <span className="inline-flex items-center gap-1 text-xs font-mono-tabular text-[#0B192C]/60">
                          <Clock className="w-3.5 h-3.5" />
                          {lesson.durationMinutes}m
                        </span>

                        {canWatch ? (
                          <Link
                            to={`/learn/${course.id}/${lesson.id}`}
                            className="px-4 py-2 rounded-lg bg-[#0D6E6E] text-white text-xs font-semibold hover:bg-[#0B192C] transition-colors whitespace-nowrap"
                          >
                            {saved && saved.playbackSeconds > 0 ? 'Resume Class' : 'Open Player'}
                          </Link>
                        ) : (
                          <Link
                            to={`/courses/${course.id}`}
                            className="px-3.5 py-2 rounded-lg border border-[#0B192C]/20 text-[#0B192C]/70 hover:text-[#0B192C] text-xs font-medium whitespace-nowrap"
                          >
                            Enroll to Unlock
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
