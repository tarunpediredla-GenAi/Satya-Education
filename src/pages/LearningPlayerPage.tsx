import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  CheckCircle2,
  Lock,
  Download,
  PanelRightClose,
  PanelRightOpen,
  Subtitles,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LearningPlayerPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const {
    courses,
    user,
    authToken,
    hasCourseAccess,
    progressMap,
    saveLessonProgress,
    addToCart,
    showToast,
  } = useApp();
  const navigate = useNavigate();

  const course = courses.find((c) => c.id === courseId);
  const allLessons = course ? course.modules.flatMap((m) => m.lessons) : [];
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const lesson = currentIndex >= 0 ? allLessons[currentIndex] : allLessons[0];

  const enrolled = course ? hasCourseAccess(course.id) : false;
  const canAccessLesson = Boolean(lesson && (lesson.isFreePreview || enrolled));

  // Backend media verification state
  const [backendAuthorized, setBackendAuthorized] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [signedMediaStreamId, setSignedMediaStreamId] = useState<string>('');
  const [authorizedRecordingUrl, setAuthorizedRecordingUrl] = useState<string>('');

  // Player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load saved progress when switching lessons
  useEffect(() => {
    if (!lesson) return;
    setIsPlaying(false);
    const saved = progressMap[lesson.id];
    if (saved) {
      setCurrentTime(saved.playbackSeconds < lesson.durationSeconds ? saved.playbackSeconds : 0);
      setNotes(saved.notes || '');
      setIsCompleted(Boolean(saved.completed));
    } else {
      setCurrentTime(0);
      setNotes('');
      setIsCompleted(false);
    }
  }, [lesson?.id]);

  // Verify access on backend (/api/access/media) using server Bearer token
  useEffect(() => {
    let active = true;
    const verifyAccess = async () => {
      if (!course || !lesson) return;
      setAuthChecking(true);
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authToken) headers.Authorization = `Bearer ${authToken}`;
        const res = await fetch('/api/access/media', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            itemId: course.id,
            lessonId: lesson.id,
            itemType: 'course',
          }),
        });
        const data = await res.json();
        if (active) {
          if (res.ok && data.authorized) {
            setBackendAuthorized(true);
            setSignedMediaStreamId(data.signedToken || 'verified-stream');
            setAuthorizedRecordingUrl(data.recordingUrl || lesson.recordingUrl || '');
          } else {
            setBackendAuthorized(false);
            setAuthorizedRecordingUrl('');
          }
        }
      } catch {
        if (active) {
          setBackendAuthorized(false);
          setAuthorizedRecordingUrl('');
        }
      } finally {
        if (active) setAuthChecking(false);
      }
    };
    verifyAccess();
    return () => {
      active = false;
    };
  }, [course?.id, lesson?.id, enrolled, user?.uid, authToken]);

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying || !lesson || !backendAuthorized) return;

    const intervalMs = 250;
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + (intervalMs / 1000) * playbackSpeed;
        if (next >= lesson.durationSeconds) {
          setIsPlaying(false);
          return lesson.durationSeconds;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, lesson, backendAuthorized]);

  // Periodic auto-save of playback position every 5 seconds while playing
  useEffect(() => {
    if (!course || !lesson || !backendAuthorized) return;
    if (!isPlaying) return;
    const saveTimer = setTimeout(() => {
      saveLessonProgress(course.id, lesson.id, Math.floor(currentTime), isCompleted, notes);
    }, 5000);
    return () => clearTimeout(saveTimer);
  }, [Math.floor(currentTime / 5), isPlaying]);

  if (!course || !lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-serif-display text-2xl font-bold text-[#0B192C]">Lesson Not Found</h1>
        <Link to="/recorded-classes" className="text-sm font-semibold text-[#0D6E6E] hover:underline">
          ← Back to Recorded Classes
        </Link>
      </div>
    );
  }

  // Play subtle studio chime when starting lecture playback
  const togglePlay = () => {
    if (!backendAuthorized) return;
    if (!isPlaying && !isMuted && volume > 0) {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          if (!audioCtxRef.current) {
            audioCtxRef.current = new AudioContextClass();
          }
          const ctx = audioCtxRef.current;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          gain.gain.setValueAtTime(0.015 * volume, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        }
      } catch {
        // Ignore audio context autoplay restriction
      }
    } else if (isPlaying) {
      // Save progress immediately on pause
      saveLessonProgress(course.id, lesson.id, Math.floor(currentTime), isCompleted, notes);
    }
    setIsPlaying((prev) => !prev);
  };

  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleMarkComplete = async () => {
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    await saveLessonProgress(course.id, lesson.id, Math.floor(currentTime), nextState, notes);
    showToast(nextState ? 'Marked lesson as completed' : 'Marked lesson as incomplete');
  };

  const handleSaveNotes = async () => {
    await saveLessonProgress(course.id, lesson.id, Math.floor(currentTime), isCompleted, notes);
    showToast('Saved lesson notes');
  };

  const handleDownloadResource = (title: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = title.replace(/\s+/g, '_');
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${title}`);
  };

  // Determine current active slide & caption
  const activeSlide =
    [...lesson.slides].reverse().find((s) => currentTime >= s.timestampSeconds) ||
    lesson.slides[0];
  const activeCaption = lesson.captions.find(
    (c) => currentTime >= c.startSeconds && currentTime <= c.endSeconds
  );

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const completedCount = allLessons.filter((l) => progressMap[l.id]?.completed).length;
  const courseProgressPct =
    allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  const formatTime = (sec: number) => {
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Course Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#0B192C]/10">
        <div>
          <Link
            to={`/courses/${course.id}`}
            className="text-xs font-mono-tabular text-[#0D6E6E] hover:underline"
          >
            ← {course.title}
          </Link>
          <h1 className="font-serif-display text-xl sm:text-2xl font-bold text-[#0B192C] mt-0.5">
            {lesson.title}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs font-mono-tabular text-[#0B192C]/70">
              Course Progress: {completedCount}/{allLessons.length} ({courseProgressPct}%)
            </span>
            <div className="w-36 h-2 bg-[#0B192C]/10 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-[#0D6E6E] transition-all"
                style={{ width: `${courseProgressPct}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle curriculum sidebar"
            className="p-2 rounded-lg border border-[#0B192C]/15 text-[#0B192C] hover:bg-white transition-colors"
          >
            {sidebarOpen ? (
              <PanelRightClose className="w-5 h-5" />
            ) : (
              <PanelRightOpen className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Split Layout: Video Player + Collapsible Curriculum Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className={sidebarOpen ? 'lg:col-span-8 space-y-6' : 'lg:col-span-12 space-y-6'}>
          {/* Video Stage */}
          <div
            ref={playerContainerRef}
            className="rounded-2xl overflow-hidden bg-[#0B192C] text-[#FAF8F5] shadow-xl border border-white/10 flex flex-col justify-between min-h-[420px] sm:min-h-[480px] relative"
          >
            {authChecking ? (
              <div className="m-auto text-center p-12 space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#C59B27] border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-mono-tabular text-[#FAF8F5]/70">
                  Verifying enrollment & media stream authorization...
                </p>
              </div>
            ) : !backendAuthorized ? (
              /* Locked Paid Lesson State (Enforced by Backend & Access Control) */
              <div className="m-auto max-w-md text-center p-8 space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-[#C59B27]">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-mono-tabular uppercase text-[#C59B27]">
                    Protected Paid Lesson
                  </p>
                  <h2 className="font-serif-display text-2xl font-bold text-white">
                    Enroll to Unlock This Recorded Class
                  </h2>
                  <p className="text-xs sm:text-sm text-[#FAF8F5]/75 leading-relaxed">
                    Paid lessons and study resources are protected on the backend. Enroll in{' '}
                    <strong>{course.title}</strong> to unlock all modules, interactive code walkthroughs, and lifetime access.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      addToCart({
                        cartItemId: course.id,
                        itemId: course.id,
                        itemType: 'course',
                        title: course.title,
                        subtitleOrAuthor: course.instructor,
                        unitPriceInr: course.priceInr,
                      });
                      navigate('/checkout');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#0D6E6E] text-white text-xs sm:text-sm font-semibold hover:bg-[#0F8282] transition-colors"
                  >
                    Enroll Now — ₹{course.priceInr.toLocaleString('en-IN')}
                  </button>
                  <Link
                    to={`/learn/${course.id}/${allLessons[0]?.id}`}
                    className="px-4 py-2.5 rounded-xl border border-white/20 text-xs sm:text-sm font-medium text-white hover:bg-white/10"
                  >
                    Watch Lesson 1 Free Preview
                  </Link>
                </div>
              </div>
            ) : (
              /* Authorized Interactive Recorded Lecture Player */
              <>
                {/* Top Lecture Slide Header */}
                <div className="px-6 py-4 bg-black/30 border-b border-white/10 flex items-center justify-between text-xs font-mono-tabular">
                  <span className="text-[#C59B27]">
                    {course.subject} · {lesson.isFreePreview ? 'Free Preview Class' : 'Enrolled Class'}
                  </span>
                  <span className="text-[#FAF8F5]/60">
                    Stream ID: {signedMediaStreamId.slice(0, 16)}
                  </span>
                </div>

                {/* Center Slide & Code Walkthrough Canvas */}
                <div
                  onClick={authorizedRecordingUrl ? undefined : togglePlay}
                  className="flex-1 p-6 sm:p-10 flex flex-col justify-center cursor-pointer select-none space-y-6"
                >
                  {authorizedRecordingUrl && (
                    <div className="rounded-xl overflow-hidden bg-black border border-white/15">
                      <video
                        src={authorizedRecordingUrl}
                        controls
                        className="w-full max-h-[340px] object-contain"
                      >
                        <track kind="captions" />
                      </video>
                    </div>
                  )}

                  {activeSlide && (
                    <div className="space-y-4 max-w-3xl">
                      <p className="text-xs font-mono-tabular uppercase tracking-wider text-[#5EEAD4]">
                        Recorded Lecture Slide · {course.instructor}
                      </p>
                      <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-white">
                        {activeSlide.heading}
                      </h2>
                      <ul className="space-y-2 text-sm sm:text-base text-[#FAF8F5]/85 list-disc list-inside">
                        {activeSlide.bulletPoints.map((bp) => (
                          <li key={bp}>{bp}</li>
                        ))}
                      </ul>
                      {activeSlide.codeHighlight && (
                        <pre className="p-4 rounded-xl bg-black/60 border border-white/15 text-xs sm:text-sm font-mono-tabular text-[#E6C775] overflow-x-auto">
                          <code>{activeSlide.codeHighlight}</code>
                        </pre>
                      )}
                    </div>
                  )}

                  {/* Closed Captions Overlay */}
                  {showCaptions && activeCaption && (
                    <div className="mt-auto pt-4">
                      <div className="inline-block px-4 py-2 rounded-lg bg-black/80 text-white text-xs sm:text-sm leading-relaxed border border-white/10">
                        {activeCaption.text}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Player Controls Bar */}
                <div className="p-4 bg-black/50 border-t border-white/10 space-y-3">
                  {/* Scrubber Bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono-tabular text-[#FAF8F5]/80 w-12">
                      {formatTime(currentTime)}
                    </span>
                    <label htmlFor="video-scrubber" className="sr-only">
                      Seek playback position
                    </label>
                    <input
                      id="video-scrubber"
                      type="range"
                      min={0}
                      max={lesson.durationSeconds}
                      step={1}
                      value={Math.floor(currentTime)}
                      onChange={(e) => {
                        const sec = Number(e.target.value);
                        setCurrentTime(sec);
                        saveLessonProgress(course.id, lesson.id, sec, isCompleted, notes);
                      }}
                      className="flex-1 accent-[#0D6E6E] cursor-pointer"
                    />
                    <span className="text-xs font-mono-tabular text-[#FAF8F5]/80 w-12 text-right">
                      {formatTime(lesson.durationSeconds)}
                    </span>
                  </div>

                  {/* Transport & Speed Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={togglePlay}
                        aria-label={isPlaying ? 'Pause lesson' : 'Play lesson'}
                        className="px-3.5 py-2 rounded-lg bg-[#0D6E6E] text-white hover:bg-[#0F8282] transition-colors flex items-center gap-1.5 text-xs font-semibold"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{isPlaying ? 'Pause' : 'Play'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={!prevLesson}
                        onClick={() => prevLesson && navigate(`/learn/${course.id}/${prevLesson.id}`)}
                        aria-label="Previous lesson"
                        className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        disabled={!nextLesson}
                        onClick={() => nextLesson && navigate(`/learn/${course.id}/${nextLesson.id}`)}
                        aria-label="Next lesson"
                        className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>

                      {/* Volume */}
                      <div className="flex items-center gap-1.5 pl-2">
                        <button
                          type="button"
                          onClick={() => setIsMuted((m) => !m)}
                          aria-label={isMuted ? 'Unmute' : 'Mute'}
                          className="p-1.5 rounded hover:bg-white/10"
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                        <label htmlFor="player-volume" className="sr-only">
                          Audio Volume
                        </label>
                        <input
                          id="player-volume"
                          type="range"
                          min={0}
                          max={1}
                          step={0.1}
                          value={isMuted ? 0 : volume}
                          onChange={(e) => {
                            setVolume(Number(e.target.value));
                            setIsMuted(false);
                          }}
                          className="w-16 accent-[#C59B27] hidden sm:block"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Playback Speed Selector */}
                      <label htmlFor="playback-speed" className="sr-only">
                        Playback Speed
                      </label>
                      <select
                        id="playback-speed"
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                        className="px-2.5 py-1.5 rounded-lg bg-white/10 text-white text-xs font-mono-tabular border border-white/15"
                      >
                        <option value={0.75} className="text-black">0.75x</option>
                        <option value={1} className="text-black">1.0x</option>
                        <option value={1.25} className="text-black">1.25x</option>
                        <option value={1.5} className="text-black">1.5x</option>
                        <option value={2} className="text-black">2.0x</option>
                      </select>

                      {/* Captions Toggle */}
                      <button
                        type="button"
                        onClick={() => setShowCaptions((c) => !c)}
                        aria-label="Toggle closed captions"
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                          showCaptions ? 'bg-[#C59B27] text-[#0B192C]' : 'bg-white/10 text-white'
                        }`}
                      >
                        <Subtitles className="w-4 h-4" />
                        <span>CC</span>
                      </button>

                      {/* Fullscreen */}
                      <button
                        type="button"
                        onClick={handleToggleFullscreen}
                        aria-label="Toggle fullscreen"
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                      >
                        <Maximize className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Lesson Actions Bar (Mark Complete + Prev/Next) */}
          <div className="p-4 rounded-xl bg-white border border-[#0B192C]/10 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleMarkComplete}
              disabled={!backendAuthorized}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors ${
                isCompleted
                  ? 'bg-[#0D6E6E] text-white'
                  : 'border border-[#0B192C]/20 text-[#0B192C] hover:bg-[#FAF8F5]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'Completed' : 'Mark Lesson Complete'}</span>
            </button>

            <div className="flex items-center gap-2">
              {prevLesson && (
                <Link
                  to={`/learn/${course.id}/${prevLesson.id}`}
                  className="px-3.5 py-2 rounded-lg border border-[#0B192C]/15 text-xs font-semibold text-[#0B192C] hover:bg-[#FAF8F5]"
                >
                  ← Previous Lesson
                </Link>
              )}
              {nextLesson && (
                <Link
                  to={`/learn/${course.id}/${nextLesson.id}`}
                  className="px-3.5 py-2 rounded-lg bg-[#0B192C] text-white text-xs font-semibold hover:bg-[#0D6E6E]"
                >
                  Next Lesson →
                </Link>
              )}
            </div>
          </div>

          {/* Key Takeaways & Code Walkthrough */}
          {backendAuthorized && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-[#0B192C]/10 space-y-4">
                <h3 className="font-serif-display text-lg font-semibold text-[#0B192C]">
                  Lesson Summary & Key Takeaways
                </h3>
                <p className="text-sm text-[#0B192C]/75 leading-relaxed">{lesson.summary}</p>
                <ul className="space-y-2 text-xs sm:text-sm text-[#0B192C]/85 list-disc list-inside">
                  {lesson.keyTakeaways.map((kt) => (
                    <li key={kt}>{kt}</li>
                  ))}
                </ul>

                {lesson.resources.length > 0 && (
                  <div className="pt-4 border-t border-[#0B192C]/10 space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-[#0B192C]/60">
                      Downloadable Lesson Resources
                    </h4>
                    {lesson.resources.map((res) => (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => handleDownloadResource(res.title, res.content)}
                        className="w-full p-2.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F3EDE0] border border-[#0B192C]/10 flex items-center justify-between text-xs font-medium text-[#0B192C]"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Download className="w-3.5 h-3.5 text-[#0D6E6E] shrink-0" />
                          <span className="truncate">{res.title}</span>
                        </span>
                        <span className="font-mono-tabular text-[#0B192C]/60">{res.sizeLabel}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Personal Study Notes */}
              <div className="p-6 rounded-2xl bg-white border border-[#0B192C]/10 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="lesson-notes-textarea"
                      className="font-serif-display text-lg font-semibold text-[#0B192C] flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-[#0D6E6E]" />
                      <span>Personal Lesson Notes</span>
                    </label>
                    <span className="text-[11px] font-mono-tabular text-[#0B192C]/60">
                      {user ? 'Synced to Cloud Firestore' : 'Saved locally'}
                    </span>
                  </div>
                  <textarea
                    id="lesson-notes-textarea"
                    rows={6}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write down timestamps, questions, or code insights for this lesson..."
                    className="w-full p-3 rounded-xl border border-[#0B192C]/20 bg-[#FAF8F5] text-sm text-[#0B192C]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="self-end px-4 py-2 rounded-lg bg-[#0B192C] text-white text-xs font-semibold hover:bg-[#0D6E6E] transition-colors"
                >
                  Save Notes
                </button>
              </div>
            </div>
          )}

          {/* Reference Code Block */}
          {backendAuthorized && lesson.codeSnippet && (
            <div className="p-6 rounded-2xl bg-[#0B192C] text-[#FAF8F5] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono-tabular text-[#C59B27]">
                <span>Reference Implementation Code</span>
                <span>{course.subject}</span>
              </div>
              <pre className="text-xs sm:text-sm font-mono-tabular overflow-x-auto leading-relaxed text-[#FAF8F5]/90">
                <code>{lesson.codeSnippet}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Collapsible Curriculum Sidebar */}
        {sidebarOpen && (
          <aside className="lg:col-span-4 rounded-2xl bg-white border border-[#0B192C]/10 overflow-hidden">
            <div className="p-4 bg-[#FAF8F5] border-b border-[#0B192C]/10">
              <h2 className="font-serif-display text-base font-semibold text-[#0B192C]">
                Course Curriculum
              </h2>
              <p className="text-xs text-[#0B192C]/60 mt-0.5">
                {enrolled ? 'Full Course Unlocked' : 'Free Preview Mode'}
              </p>
            </div>

            <div className="divide-y divide-[#0B192C]/10 max-h-[600px] overflow-y-auto">
              {course.modules.map((mod) => (
                <div key={mod.id}>
                  <div className="px-4 py-2.5 bg-[#F3EDE0]/60 text-xs font-semibold text-[#0B192C]">
                    {mod.title}
                  </div>
                  <div className="divide-y divide-[#0B192C]/5">
                    {mod.lessons.map((item) => {
                      const isCurrent = item.id === lesson.id;
                      const unlockedItem = enrolled || item.isFreePreview;
                      const done = progressMap[item.id]?.completed;

                      return (
                        <Link
                          key={item.id}
                          to={`/learn/${course.id}/${item.id}`}
                          className={`px-4 py-3 flex items-start justify-between gap-3 text-xs transition-colors ${
                            isCurrent
                              ? 'bg-[#0D6E6E]/10 font-semibold text-[#0B192C]'
                              : 'hover:bg-[#FAF8F5] text-[#0B192C]/80'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {done ? (
                              <CheckCircle2 className="w-4 h-4 text-[#0D6E6E] shrink-0 mt-0.5" />
                            ) : unlockedItem ? (
                              <Play className="w-3.5 h-3.5 text-[#0D6E6E] shrink-0 mt-0.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-[#0B192C]/40 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className="block">{item.title}</span>
                              <span className="text-[11px] text-[#0B192C]/55 font-mono-tabular">
                                {item.durationMinutes}m ·{' '}
                                {item.isFreePreview ? 'Free Preview' : enrolled ? 'Unlocked' : 'Locked'}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
