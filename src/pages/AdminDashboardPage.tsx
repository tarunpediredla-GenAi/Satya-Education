import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Plus,
  Upload,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  PlayCircle,
  Package,
  Users,
  LayoutDashboard,
  Eye,
  EyeOff,
  LogOut,
  ArrowUp,
  ArrowDown,
  Video,
  IndianRupee,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BookItem, CourseItem, CourseLesson } from '../types';

type AdminSection = 'overview' | 'books' | 'courses_recordings' | 'customers' | 'orders';

export const AdminDashboardPage: React.FC = () => {
  const {
    user,
    authLoading,
    signOut,
    allBooksAdmin,
    allCoursesAdmin,
    allOrdersAdmin,
    allEnrollmentsAdmin,
    adminCustomers,
    verifiedRevenueAdmin,
    refreshAdminOverview,
    upsertBookAdmin,
    upsertCourseAdmin,
    updateOrderShippingAdmin,
    showToast,
  } = useApp();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<AdminSection>('overview');

  // Book Form State
  const [editingBook, setEditingBook] = useState<BookItem>({
    id: `book-custom-${Date.now()}`,
    title: '',
    subtitle: 'Satya Press Edition',
    author: 'Satya Narayana',
    category: 'Technology',
    subcategory: 'Python',
    priceInr: 799,
    ebookPriceInr: 449,
    format: 'Both',
    stock: 25,
    description: '',
    previewExcerpt: '',
    tableOfContents: ['01. Foundations', '02. Architecture'],
    isbn: '978-81-948210-9-0',
    pages: 360,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'navy',
    coverMotif: 'circuit',
    imageUrl: '',
    published: true,
    archived: false,
  });

  // Course Form State
  const [editingCourse, setEditingCourse] = useState<CourseItem>({
    id: `course-custom-${Date.now()}`,
    title: '',
    subtitle: 'Comprehensive Recorded Program',
    instructor: 'Satya Narayana',
    instructorRole: 'Principal Educator',
    subject: 'Python',
    level: 'Intermediate',
    priceInr: 2999,
    language: 'English',
    duration: '18h 00m',
    totalLessons: 4,
    description: '',
    outcomes: ['Master production patterns'],
    prerequisites: ['Basic programming literacy'],
    accentTheme: 'teal',
    imageUrl: '',
    published: true,
    archived: false,
    modules: allCoursesAdmin[0]?.modules || [],
  });

  // Lesson & Recording Organiser State
  const [selectedCourseIdForLessons, setSelectedCourseIdForLessons] = useState<string>(
    allCoursesAdmin[0]?.id || 'course-python-mastery'
  );
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [newModuleTitle, setNewModuleTitle] = useState<string>('');
  const [lessonTitle, setLessonTitle] = useState<string>('');
  const [lessonDurationMin, setLessonDurationMin] = useState<number>(22);
  const [lessonIsPreview, setLessonIsPreview] = useState<boolean>(false);
  const [lessonRecordingUrl, setLessonRecordingUrl] = useState<string>('');
  const [lessonSummary, setLessonSummary] = useState<string>('');
  const [lessonCodeSnippet, setLessonCodeSnippet] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      refreshAdminOverview();
    }
  }, [user?.role, refreshAdminOverview]);

  const activeCourseForLessons =
    allCoursesAdmin.find((c) => c.id === selectedCourseIdForLessons) || allCoursesAdmin[0];

  useEffect(() => {
    if (
      activeCourseForLessons &&
      activeCourseForLessons.modules.length > 0 &&
      !activeCourseForLessons.modules.some((m) => m.id === selectedModuleId)
    ) {
      setSelectedModuleId(activeCourseForLessons.modules[0].id);
    }
  }, [activeCourseForLessons, selectedModuleId]);

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-sm">
        Verifying Administrator Session...
      </div>
    );
  }

  // Strict Access Gate: Non-admins are directed to /admin/login
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="p-8 rounded-2xl bg-white border border-red-200 text-center space-y-5 shadow-xs">
          <ShieldAlert className="w-11 h-11 text-red-600 mx-auto" />
          <div className="space-y-2">
            <p className="text-xs font-mono-tabular uppercase text-red-700">
              HTTP 403 · Backend Role Enforcement Active
            </p>
            <h1 className="font-serif-display text-2xl font-bold text-[#0B192C]">
              Administrator Access Required
            </h1>
            <p className="text-sm text-[#0B192C]/75 leading-relaxed">
              The Admin Panel (<code>/admin</code>) is protected on the backend by cryptographic token verification and role checks. Standard student accounts cannot access or perform administrator actions.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/admin/login"
              className="px-6 py-3 rounded-xl bg-[#0B192C] text-white text-xs sm:text-sm font-semibold hover:bg-[#0D6E6E]"
            >
              Go to Admin Login (/admin/login)
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className="px-5 py-3 rounded-xl border border-[#0B192C]/20 text-xs sm:text-sm font-semibold text-[#0B192C]"
              >
                Return to User Panel (/dashboard)
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const paidOrdersCount = allOrdersAdmin.filter((o) => o.status === 'paid').length;
  const pendingOrdersCount = allOrdersAdmin.filter((o) => o.status === 'pending').length;
  const failedOrdersCount = allOrdersAdmin.filter((o) => o.status === 'failed').length;

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook.title.trim() || !editingBook.description.trim()) return;
    await upsertBookAdmin({
      ...editingBook,
      archived: !editingBook.published,
    });
    setEditingBook({
      ...editingBook,
      id: `book-custom-${Date.now()}`,
      title: '',
      description: '',
      imageUrl: '',
    });
  };

  const handleToggleBookPublish = async (book: BookItem) => {
    const nextPublished = book.published === false || Boolean(book.archived);
    await upsertBookAdmin({
      ...book,
      published: nextPublished,
      archived: !nextPublished,
    });
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse.title.trim() || !editingCourse.description.trim()) return;
    await upsertCourseAdmin({
      ...editingCourse,
      archived: !editingCourse.published,
    });
    setEditingCourse({
      ...editingCourse,
      id: `course-custom-${Date.now()}`,
      title: '',
      description: '',
      imageUrl: '',
    });
  };

  const handleToggleCoursePublish = async (course: CourseItem) => {
    const nextPublished = course.published === false || Boolean(course.archived);
    await upsertCourseAdmin({
      ...course,
      published: nextPublished,
      archived: !nextPublished,
    });
  };

  const handleAddModuleToCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourseForLessons || !newModuleTitle.trim()) return;
    const newModId = `mod_${Date.now()}`;
    const updatedModules = [
      ...activeCourseForLessons.modules,
      {
        id: newModId,
        title: newModuleTitle.trim(),
        description: 'Structured recorded lessons module',
        lessons: [],
      },
    ];
    await upsertCourseAdmin({
      ...activeCourseForLessons,
      modules: updatedModules,
    });
    setNewModuleTitle('');
    setSelectedModuleId(newModId);
  };

  const handleRecordingFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const lower = file.name.toLowerCase();
    const valid = ['.mp4', '.webm', '.mov'].some((ext) => lower.endsWith(ext));
    if (!valid) {
      setUploadError('Invalid recording format. Please select an .mp4, .webm, or .mov video file.');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setUploadError('Video file exceeds the 500 MB limit.');
      return;
    }

    setUploadProgress(25);
    const objectUrl = URL.createObjectURL(file);
    setTimeout(() => {
      setUploadProgress(100);
      setLessonRecordingUrl(objectUrl);
      showToast(`Attached recording file "${file.name}"`);
    }, 350);
  };

  const handleAddLessonToModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourseForLessons || !lessonTitle.trim()) return;
    const targetModId = selectedModuleId || activeCourseForLessons.modules[0]?.id;
    if (!targetModId) return;

    const newLesson: CourseLesson = {
      id: `les_${Date.now()}`,
      courseId: activeCourseForLessons.id,
      moduleId: targetModId,
      title: lessonTitle.trim(),
      durationMinutes: Math.max(1, Number(lessonDurationMin) || 15),
      durationSeconds: Math.max(60, (Number(lessonDurationMin) || 15) * 60),
      isFreePreview: lessonIsPreview,
      recordingUrl: lessonRecordingUrl.trim(),
      summary:
        lessonSummary.trim() ||
        'Prerecorded studio lecture with architecture slides and implementation walkthrough.',
      keyTakeaways: [
        `Core concepts and implementation patterns for ${lessonTitle.trim()}`,
        'Production debugging and verification workflow',
      ],
      codeSnippet:
        lessonCodeSnippet.trim() ||
        `# ${lessonTitle.trim()}\ndef verify_lesson_architecture() -> bool:\n    return True`,
      slides: [
        {
          timestampSeconds: 0,
          heading: lessonTitle.trim(),
          bulletPoints: [
            lessonSummary.trim() || 'Architectural overview and core engineering trade-offs',
            'Step-by-step code walkthrough and verification',
          ],
          codeHighlight: lessonCodeSnippet.trim() || undefined,
        },
      ],
      captions: [
        {
          startSeconds: 0,
          endSeconds: 60,
          text: `Welcome to "${lessonTitle.trim()}" in ${activeCourseForLessons.title}.`,
        },
      ],
      resources: [],
    };

    const updatedModules = activeCourseForLessons.modules.map((mod) =>
      mod.id === targetModId ? { ...mod, lessons: [...mod.lessons, newLesson] } : mod
    );

    await upsertCourseAdmin({
      ...activeCourseForLessons,
      modules: updatedModules,
      totalLessons: updatedModules.reduce((acc, m) => acc + m.lessons.length, 0),
    });

    setLessonTitle('');
    setLessonSummary('');
    setLessonRecordingUrl('');
    setLessonCodeSnippet('');
    setUploadProgress(0);
  };

  const handleMoveLesson = async (moduleId: string, lessonIndex: number, direction: -1 | 1) => {
    if (!activeCourseForLessons) return;
    const updatedModules = activeCourseForLessons.modules.map((mod) => {
      if (mod.id !== moduleId) return mod;
      const list = [...mod.lessons];
      const targetIndex = lessonIndex + direction;
      if (targetIndex < 0 || targetIndex >= list.length) return mod;
      const temp = list[lessonIndex];
      list[lessonIndex] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...mod, lessons: list };
    });

    await upsertCourseAdmin({
      ...activeCourseForLessons,
      modules: updatedModules,
    });
  };

  const handleToggleLessonPreview = async (moduleId: string, lessonId: string) => {
    if (!activeCourseForLessons) return;
    const updatedModules = activeCourseForLessons.modules.map((mod) => {
      if (mod.id !== moduleId) return mod;
      return {
        ...mod,
        lessons: mod.lessons.map((l) =>
          l.id === lessonId ? { ...l, isFreePreview: !l.isFreePreview } : l
        ),
      };
    });

    await upsertCourseAdmin({
      ...activeCourseForLessons,
      modules: updatedModules,
    });
  };

  const navItems: { id: AdminSection; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'overview', label: 'Revenue & Overview', icon: LayoutDashboard },
    { id: 'books', label: 'Books & Stock Manager', icon: BookOpen, badge: String(allBooksAdmin.length) },
    {
      id: 'courses_recordings',
      label: 'Courses & Recordings',
      icon: PlayCircle,
      badge: String(allCoursesAdmin.length),
    },
    {
      id: 'customers',
      label: 'Customers Directory',
      icon: Users,
      badge: String(adminCustomers.length),
    },
    {
      id: 'orders',
      label: 'Orders & Cashfree Status',
      icon: Package,
      badge: String(allOrdersAdmin.length),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* DEDICATED ADMIN PANEL SIDEBAR */}
        <aside className="lg:col-span-3 rounded-2xl bg-[#0B192C] text-[#FAF8F5] border border-[#0B192C] overflow-hidden shadow-lg">
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <img
              src="/assets/aistudio/image_42ebc6e4.png"
              alt="Satya's Education Logo"
              className="w-11 h-11 rounded-lg bg-white p-0.5 object-contain shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-mono-tabular uppercase text-[#C59B27]">
                Admin Panel · /admin
              </p>
              <h1 className="font-serif-display text-base font-bold text-white truncate">
                {user.displayName}
              </h1>
              <p className="text-xs text-[#FAF8F5]/65 truncate">{user.email}</p>
            </div>
          </div>

          <nav aria-label="Admin Panel Navigation" className="p-2.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-colors ${
                    active
                      ? 'bg-[#C59B27] text-[#0B192C] font-bold'
                      : 'text-[#FAF8F5]/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span
                      className={`text-xs font-mono-tabular ${
                        active ? 'text-[#0B192C]' : 'text-[#C59B27]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-white/10 space-y-2 bg-black/20">
            <Link
              to="/dashboard"
              className="w-full px-3.5 py-2 rounded-xl border border-white/20 text-xs font-semibold text-[#FAF8F5] hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <span>View User Panel (/dashboard)</span>
            </Link>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate('/admin/login');
              }}
              className="w-full px-3.5 py-2 rounded-xl bg-red-950/60 border border-red-400/30 text-xs font-semibold text-red-200 hover:bg-red-900/80 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Admin Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ADMIN PANEL MAIN WORKSPACE */}
        <div className="lg:col-span-9 space-y-8">
          {/* SECTION 1: OVERVIEW (CUSTOMERS, ORDERS & VERIFIED REVENUE) */}
          {activeSection === 'overview' && (
            <div className="space-y-8">
              <div className="border-b border-[#0B192C]/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-mono-tabular uppercase text-[#B48327]">
                    Executive Operations · Server-Enforced RBAC
                  </p>
                  <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#0B192C]">
                    Customers, Orders & Verified Revenue
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => refreshAdminOverview()}
                  className="px-4 py-2 rounded-xl border border-[#0B192C]/20 text-xs font-semibold text-[#0B192C] hover:bg-white"
                >
                  Refresh Live Metrics
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-[#0B192C]/12 space-y-1">
                  <span className="text-xs font-mono-tabular uppercase text-[#0D6E6E] flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>Verified Revenue (PAID)</span>
                  </span>
                  <p className="font-serif-display text-2xl font-bold text-[#0B192C] font-mono-tabular">
                    ₹{verifiedRevenueAdmin.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-[#0B192C]/60">
                    From {paidOrdersCount} verified paid orders
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#0B192C]/12 space-y-1">
                  <span className="text-xs font-mono-tabular uppercase text-[#0B192C]/60">
                    Total Customers
                  </span>
                  <p className="font-serif-display text-2xl font-bold text-[#0B192C] font-mono-tabular">
                    {adminCustomers.length}
                  </p>
                  <p className="text-[11px] text-[#0B192C]/60">
                    {allEnrollmentsAdmin.length} active course/book unlocks
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#0B192C]/12 space-y-1">
                  <span className="text-xs font-mono-tabular uppercase text-[#0B192C]/60">
                    Orders Breakdown
                  </span>
                  <p className="font-serif-display text-2xl font-bold text-[#0B192C] font-mono-tabular">
                    {allOrdersAdmin.length}
                  </p>
                  <p className="text-[11px] font-mono-tabular text-[#0B192C]/65">
                    {paidOrdersCount} Paid · {pendingOrdersCount} Pending · {failedOrdersCount} Failed
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#0B192C]/12 space-y-1">
                  <span className="text-xs font-mono-tabular uppercase text-[#0B192C]/60">
                    Published Catalog
                  </span>
                  <p className="font-serif-display text-2xl font-bold text-[#0B192C] font-mono-tabular">
                    {allBooksAdmin.filter((b) => b.published !== false && !b.archived).length} Books ·{' '}
                    {allCoursesAdmin.filter((c) => c.published !== false && !c.archived).length} Courses
                  </p>
                  <p className="text-[11px] text-[#0B192C]/60">
                    {allBooksAdmin.length} total books in DB
                  </p>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="rounded-2xl bg-white border border-[#0B192C]/10 overflow-hidden">
                <div className="px-5 py-4 bg-[#FAF8F5] border-b border-[#0B192C]/10 flex items-center justify-between">
                  <h3 className="font-serif-display text-base font-semibold text-[#0B192C]">
                    Recent Orders & Cashfree Payment Verification
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSection('orders')}
                    className="text-xs font-semibold text-[#0D6E6E] hover:underline"
                  >
                    Manage All Orders →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#0B192C]/10 text-[#0B192C]/70 font-mono-tabular">
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Payment Status</th>
                        <th className="py-3 px-4">Shipping</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0B192C]/10">
                      {allOrdersAdmin.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-[#0B192C]/60">
                            No orders placed yet. Test Cashfree checkout to see live orders here.
                          </td>
                        </tr>
                      ) : (
                        allOrdersAdmin.slice(0, 6).map((ord) => (
                          <tr key={ord.id}>
                            <td className="py-3 px-4 font-mono-tabular font-semibold">{ord.id}</td>
                            <td className="py-3 px-4">{ord.userEmail}</td>
                            <td className="py-3 px-4 font-mono-tabular font-semibold">
                              ₹{ord.totalInr.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-4 font-mono-tabular uppercase font-semibold">
                              <span
                                className={
                                  ord.status === 'paid'
                                    ? 'text-[#0D6E6E]'
                                    : ord.status === 'pending'
                                    ? 'text-amber-700'
                                    : 'text-red-700'
                                }
                              >
                                {ord.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 capitalize">
                              {ord.shippingStatus.replace('_', ' ')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: BOOKS & INVENTORY (ADD, EDIT, PUBLISH/UNPUBLISH, PRICE, IMAGE, STOCK) */}
          {activeSection === 'books' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <form
                onSubmit={handleBookSubmit}
                className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#0B192C]/10 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-serif-display text-lg font-semibold text-[#0B192C] flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#0D6E6E]" />
                    <span>Add / Edit Book</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingBook({
                        id: `book-custom-${Date.now()}`,
                        title: '',
                        subtitle: 'Satya Press Edition',
                        author: 'Satya Narayana',
                        category: 'Technology',
                        subcategory: 'Python',
                        priceInr: 799,
                        ebookPriceInr: 449,
                        format: 'Both',
                        stock: 25,
                        description: '',
                        previewExcerpt: '',
                        tableOfContents: ['01. Foundations', '02. Architecture'],
                        isbn: '978-81-948210-9-0',
                        pages: 360,
                        language: 'English',
                        publishYear: 2026,
                        coverTheme: 'navy',
                        coverMotif: 'circuit',
                        imageUrl: '',
                        published: true,
                        archived: false,
                      })
                    }
                    className="text-xs font-semibold text-[#0D6E6E] hover:underline"
                  >
                    + New Blank Book
                  </button>
                </div>

                <div>
                  <label htmlFor="adm-book-title" className="block text-xs font-semibold mb-1">
                    Book Title *
                  </label>
                  <input
                    id="adm-book-title"
                    type="text"
                    required
                    value={editingBook.title}
                    onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="adm-book-author" className="block text-xs font-semibold mb-1">
                      Author *
                    </label>
                    <input
                      id="adm-book-author"
                      type="text"
                      required
                      value={editingBook.author}
                      onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                    />
                  </div>
                  <div>
                    <label htmlFor="adm-book-cat" className="block text-xs font-semibold mb-1">
                      Category
                    </label>
                    <select
                      id="adm-book-cat"
                      value={editingBook.category}
                      onChange={(e) =>
                        setEditingBook({
                          ...editingBook,
                          category: e.target.value as BookItem['category'],
                        })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Stories & Literature">Stories & Literature</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="adm-book-print" className="block text-xs font-semibold mb-1">
                      Hardcover (₹)
                    </label>
                    <input
                      id="adm-book-print"
                      type="number"
                      min={0}
                      value={editingBook.priceInr}
                      onChange={(e) =>
                        setEditingBook({ ...editingBook, priceInr: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5] font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label htmlFor="adm-book-ebook" className="block text-xs font-semibold mb-1">
                      E-Book (₹)
                    </label>
                    <input
                      id="adm-book-ebook"
                      type="number"
                      min={0}
                      value={editingBook.ebookPriceInr}
                      onChange={(e) =>
                        setEditingBook({ ...editingBook, ebookPriceInr: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5] font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label htmlFor="adm-book-stock" className="block text-xs font-semibold mb-1">
                      Book Stock
                    </label>
                    <input
                      id="adm-book-stock"
                      type="number"
                      min={0}
                      value={editingBook.stock}
                      onChange={(e) =>
                        setEditingBook({ ...editingBook, stock: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5] font-mono-tabular"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="adm-book-img" className="block text-xs font-semibold mb-1">
                    Cover Image URL (Optional — uses clothbound SVG art if blank)
                  </label>
                  <input
                    id="adm-book-img"
                    type="url"
                    value={editingBook.imageUrl || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, imageUrl: e.target.value })}
                    placeholder="https://example.com/book-cover.jpg"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label htmlFor="adm-book-desc" className="block text-xs font-semibold mb-1">
                    Description *
                  </label>
                  <textarea
                    id="adm-book-desc"
                    rows={3}
                    required
                    value={editingBook.description}
                    onChange={(e) =>
                      setEditingBook({ ...editingBook, description: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-[#0B192C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingBook.published !== false && !editingBook.archived}
                    onChange={(e) =>
                      setEditingBook({
                        ...editingBook,
                        published: e.target.checked,
                        archived: !e.target.checked,
                      })
                    }
                    className="accent-[#0D6E6E]"
                  />
                  <span>Published (visible in public store and User Panel)</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0B192C] text-white text-xs font-semibold hover:bg-[#0D6E6E] transition-colors"
                >
                  Save Book Changes
                </button>
              </form>

              <div className="lg:col-span-7 rounded-2xl bg-white border border-[#0B192C]/10 overflow-hidden">
                <div className="px-5 py-4 bg-[#FAF8F5] border-b border-[#0B192C]/10 flex items-center justify-between">
                  <h3 className="font-serif-display text-base font-semibold text-[#0B192C]">
                    All Books ({allBooksAdmin.length})
                  </h3>
                  <span className="text-xs text-[#0B192C]/60">
                    Publish / Unpublish or Edit Stock & Prices
                  </span>
                </div>
                <div className="divide-y divide-[#0B192C]/10 max-h-[580px] overflow-y-auto">
                  {allBooksAdmin.map((b) => {
                    const isPublished = b.published !== false && !b.archived;
                    return (
                      <div
                        key={b.id}
                        className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-[#FAF8F5]/60"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-[#0B192C] truncate">
                            {b.title}{' '}
                            <span
                              className={`font-mono-tabular text-[11px] ${
                                isPublished ? 'text-[#0D6E6E]' : 'text-red-600'
                              }`}
                            >
                              · {isPublished ? 'Published' : 'Unpublished'}
                            </span>
                          </p>
                          <p className="text-[#0B192C]/60 font-mono-tabular">
                            {b.category} · E-Book ₹{b.ebookPriceInr} · Print ₹{b.priceInr} · Stock:{' '}
                            {b.stock}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingBook({
                                ...b,
                                published: isPublished,
                              })
                            }
                            className="px-2.5 py-1.5 rounded border border-[#0B192C]/20 font-semibold hover:bg-[#FAF8F5]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleBookPublish(b)}
                            className={`px-2.5 py-1.5 rounded border text-xs font-semibold flex items-center gap-1 ${
                              isPublished
                                ? 'border-amber-300 text-amber-800 hover:bg-amber-50'
                                : 'border-[#0D6E6E] text-[#0D6E6E] hover:bg-[#0D6E6E]/10'
                            }`}
                          >
                            {isPublished ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Unpublish</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Publish</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: COURSES, MODULES & RECORDINGS ORGANISER */}
          {activeSection === 'courses_recordings' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Course Metadata & Publish Form */}
                <form
                  onSubmit={handleCourseSubmit}
                  className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#0B192C]/10 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif-display text-lg font-semibold text-[#0B192C] flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#0D6E6E]" />
                      <span>Add / Edit Course</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingCourse({
                          id: `course-custom-${Date.now()}`,
                          title: '',
                          subtitle: 'Comprehensive Recorded Program',
                          instructor: 'Satya Narayana',
                          instructorRole: 'Principal Educator',
                          subject: 'Python',
                          level: 'Intermediate',
                          priceInr: 2999,
                          language: 'English',
                          duration: '18h 00m',
                          totalLessons: 4,
                          description: '',
                          outcomes: ['Master production patterns'],
                          prerequisites: ['Basic programming literacy'],
                          accentTheme: 'teal',
                          imageUrl: '',
                          published: true,
                          archived: false,
                          modules: allCoursesAdmin[0]?.modules || [],
                        })
                      }
                      className="text-xs font-semibold text-[#0D6E6E] hover:underline"
                    >
                      + New Course
                    </button>
                  </div>

                  <div>
                    <label htmlFor="adm-course-title" className="block text-xs font-semibold mb-1">
                      Course Title *
                    </label>
                    <input
                      id="adm-course-title"
                      type="text"
                      required
                      value={editingCourse.title}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, title: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="adm-course-subj" className="block text-xs font-semibold mb-1">
                        Subject
                      </label>
                      <select
                        id="adm-course-subj"
                        value={editingCourse.subject}
                        onChange={(e) =>
                          setEditingCourse({
                            ...editingCourse,
                            subject: e.target.value as CourseItem['subject'],
                          })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                      >
                        <option value="Python">Python</option>
                        <option value="Django">Django</option>
                        <option value="React">React</option>
                        <option value="SQL">SQL</option>
                        <option value="Generative AI">Generative AI</option>
                        <option value="Agentic AI">Agentic AI</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="adm-course-level" className="block text-xs font-semibold mb-1">
                        Level
                      </label>
                      <select
                        id="adm-course-level"
                        value={editingCourse.level}
                        onChange={(e) =>
                          setEditingCourse({
                            ...editingCourse,
                            level: e.target.value as CourseItem['level'],
                          })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="adm-course-price" className="block text-xs font-semibold mb-1">
                        Price (INR)
                      </label>
                      <input
                        id="adm-course-price"
                        type="number"
                        min={0}
                        value={editingCourse.priceInr}
                        onChange={(e) =>
                          setEditingCourse({ ...editingCourse, priceInr: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5] font-mono-tabular"
                      />
                    </div>
                    <div>
                      <label htmlFor="adm-course-dur" className="block text-xs font-semibold mb-1">
                        Duration
                      </label>
                      <input
                        id="adm-course-dur"
                        type="text"
                        value={editingCourse.duration}
                        onChange={(e) =>
                          setEditingCourse({ ...editingCourse, duration: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="adm-course-img" className="block text-xs font-semibold mb-1">
                      Course Image URL (Optional)
                    </label>
                    <input
                      id="adm-course-img"
                      type="url"
                      value={editingCourse.imageUrl || ''}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, imageUrl: e.target.value })
                      }
                      placeholder="https://example.com/course-banner.jpg"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                    />
                  </div>

                  <div>
                    <label htmlFor="adm-course-desc" className="block text-xs font-semibold mb-1">
                      Description *
                    </label>
                    <textarea
                      id="adm-course-desc"
                      rows={3}
                      required
                      value={editingCourse.description}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, description: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold text-[#0B192C] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingCourse.published !== false && !editingCourse.archived}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          published: e.target.checked,
                          archived: !e.target.checked,
                        })
                      }
                      className="accent-[#0D6E6E]"
                    />
                    <span>Published (visible in public store and User Panel)</span>
                  </label>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0B192C] text-white text-xs font-semibold hover:bg-[#0D6E6E] transition-colors"
                  >
                    Save Course Metadata
                  </button>
                </form>

                {/* Active Courses List */}
                <div className="lg:col-span-7 rounded-2xl bg-white border border-[#0B192C]/10 overflow-hidden">
                  <div className="px-5 py-4 bg-[#FAF8F5] border-b border-[#0B192C]/10 flex items-center justify-between">
                    <h3 className="font-serif-display text-base font-semibold text-[#0B192C]">
                      All Courses ({allCoursesAdmin.length})
                    </h3>
                    <span className="text-xs text-[#0B192C]/60">
                      Publish, Unpublish, or Organise Lessons below
                    </span>
                  </div>
                  <div className="divide-y divide-[#0B192C]/10">
                    {allCoursesAdmin.map((c) => {
                      const isPublished = c.published !== false && !c.archived;
                      const lessonsCount = c.modules.reduce((acc, m) => acc + m.lessons.length, 0);
                      return (
                        <div
                          key={c.id}
                          className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-[#FAF8F5]/60"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-[#0B192C] truncate">
                              {c.title}{' '}
                              <span
                                className={`font-mono-tabular text-[11px] ${
                                  isPublished ? 'text-[#0D6E6E]' : 'text-red-600'
                                }`}
                              >
                                · {isPublished ? 'Published' : 'Unpublished'}
                              </span>
                            </p>
                            <p className="text-[#0B192C]/60 font-mono-tabular">
                              {c.subject} · {c.level} · ₹{c.priceInr} · {c.modules.length} Modules ·{' '}
                              {lessonsCount} Recordings
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCourse({ ...c, published: isPublished });
                                setSelectedCourseIdForLessons(c.id);
                              }}
                              className="px-2.5 py-1.5 rounded border border-[#0B192C]/20 font-semibold hover:bg-[#FAF8F5]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleCoursePublish(c)}
                              className={`px-2.5 py-1.5 rounded border text-xs font-semibold flex items-center gap-1 ${
                                isPublished
                                  ? 'border-amber-300 text-amber-800 hover:bg-amber-50'
                                  : 'border-[#0D6E6E] text-[#0D6E6E] hover:bg-[#0D6E6E]/10'
                              }`}
                            >
                              {isPublished ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>Unpublish</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Publish</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* UPLOAD & ORGANISE COURSE LESSONS AND RECORDINGS */}
              {activeCourseForLessons && (
                <div className="p-6 rounded-2xl bg-white border border-[#0B192C]/12 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0B192C]/10 pb-4">
                    <div>
                      <p className="text-xs font-mono-tabular uppercase text-[#0D6E6E]">
                        Curriculum & Prerecorded Video Manager
                      </p>
                      <h3 className="font-serif-display text-xl font-bold text-[#0B192C]">
                        Upload & Organise Lessons and Recordings
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <label htmlFor="select-course-lessons" className="text-xs font-semibold">
                        Target Course:
                      </label>
                      <select
                        id="select-course-lessons"
                        value={activeCourseForLessons.id}
                        onChange={(e) => setSelectedCourseIdForLessons(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5] text-xs font-semibold"
                      >
                        {allCoursesAdmin.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Add Module + Add Lesson / Upload Recording Form */}
                    <div className="lg:col-span-5 space-y-6">
                      <form
                        onSubmit={handleAddModuleToCourse}
                        className="p-4 rounded-xl bg-[#FAF8F5] border border-[#0B192C]/10 space-y-2.5"
                      >
                        <label htmlFor="new-mod-title" className="block text-xs font-semibold">
                          1. Create New Curriculum Module
                        </label>
                        <div className="flex gap-2">
                          <input
                            id="new-mod-title"
                            type="text"
                            value={newModuleTitle}
                            onChange={(e) => setNewModuleTitle(e.target.value)}
                            placeholder="e.g., Module 3: Production Deployment"
                            className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#0B192C]/20 bg-white"
                          />
                          <button
                            type="submit"
                            className="px-3.5 py-2 rounded-lg bg-[#0B192C] text-white text-xs font-semibold hover:bg-[#0D6E6E]"
                          >
                            + Add Module
                          </button>
                        </div>
                      </form>

                      <form
                        onSubmit={handleAddLessonToModule}
                        className="p-5 rounded-xl bg-[#FAF8F5] border border-[#0B192C]/10 space-y-3.5"
                      >
                        <h4 className="text-xs font-bold uppercase text-[#0B192C] flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-[#0D6E6E]" />
                          <span>2. Upload & Attach New Lesson Recording</span>
                        </h4>

                        <div>
                          <label htmlFor="les-mod-select" className="block text-xs font-semibold mb-1">
                            Select Module *
                          </label>
                          <select
                            id="les-mod-select"
                            value={selectedModuleId}
                            onChange={(e) => setSelectedModuleId(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-[#0B192C]/20 bg-white"
                          >
                            {activeCourseForLessons.modules.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.title} ({m.lessons.length} lessons)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                          <div className="col-span-2">
                            <label htmlFor="les-title" className="block text-xs font-semibold mb-1">
                              Lesson Title *
                            </label>
                            <input
                              id="les-title"
                              type="text"
                              required
                              value={lessonTitle}
                              onChange={(e) => setLessonTitle(e.target.value)}
                              placeholder="Async Task Queues in Production"
                              className="w-full px-3 py-2 text-xs rounded-lg border border-[#0B192C]/20 bg-white"
                            />
                          </div>
                          <div>
                            <label htmlFor="les-dur" className="block text-xs font-semibold mb-1">
                              Minutes
                            </label>
                            <input
                              id="les-dur"
                              type="number"
                              min={1}
                              value={lessonDurationMin}
                              onChange={(e) => setLessonDurationMin(Number(e.target.value))}
                              className="w-full px-3 py-2 text-xs rounded-lg border border-[#0B192C]/20 bg-white font-mono-tabular"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="les-rec-url" className="block text-xs font-semibold mb-1">
                            Recording Video URL (.mp4 / .webm) or Upload File Below
                          </label>
                          <input
                            id="les-rec-url"
                            type="text"
                            value={lessonRecordingUrl}
                            onChange={(e) => setLessonRecordingUrl(e.target.value)}
                            placeholder="https://example.com/lecture-recording.mp4"
                            className="w-full px-3 py-2 text-xs rounded-lg border border-[#0B192C]/20 bg-white font-mono-tabular"
                          />
                        </div>

                        <div className="p-3 rounded-lg border border-dashed border-[#0B192C]/25 bg-white flex items-center justify-between gap-2">
                          <label
                            htmlFor="recording-file-upload"
                            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D6E6E] text-white text-xs font-semibold hover:bg-[#0B192C]"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Video File (.mp4/.webm)</span>
                          </label>
                          <input
                            id="recording-file-upload"
                            type="file"
                            accept=".mp4,.webm,.mov"
                            onChange={handleRecordingFileSelect}
                            className="sr-only"
                          />
                          {uploadProgress > 0 && (
                            <span className="text-[11px] font-mono-tabular text-[#0D6E6E] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> {uploadProgress}% Ready
                            </span>
                          )}
                        </div>

                        {uploadError && (
                          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{uploadError}</span>
                          </div>
                        )}

                        <div>
                          <label htmlFor="les-summary" className="block text-xs font-semibold mb-1">
                            Lesson Summary & Notes
                          </label>
                          <textarea
                            id="les-summary"
                            rows={2}
                            value={lessonSummary}
                            onChange={(e) => setLessonSummary(e.target.value)}
                            placeholder="Key concepts covered in this recorded session..."
                            className="w-full px-3 py-2 text-xs rounded-lg border border-[#0B192C]/20 bg-white"
                          />
                        </div>

                        <label className="flex items-center gap-2 text-xs font-semibold text-[#0B192C] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={lessonIsPreview}
                            onChange={(e) => setLessonIsPreview(e.target.checked)}
                            className="accent-[#0D6E6E]"
                          />
                          <span>Free Preview Lesson (unchecked = Protected Paid Recording)</span>
                        </label>

                        <button
                          type="submit"
                          className="w-full py-2.5 px-4 rounded-xl bg-[#0B192C] text-white text-xs font-semibold hover:bg-[#0D6E6E]"
                        >
                          Save Lesson & Recording to Course
                        </button>
                      </form>
                    </div>

                    {/* Organise Existing Modules & Lessons Order */}
                    <div className="lg:col-span-7 space-y-4">
                      {activeCourseForLessons.modules.map((mod) => (
                        <div
                          key={mod.id}
                          className="rounded-xl border border-[#0B192C]/12 overflow-hidden bg-white"
                        >
                          <div className="px-4 py-3 bg-[#F3EDE0] border-b border-[#0B192C]/10 flex items-center justify-between">
                            <span className="font-serif-display text-sm font-bold text-[#0B192C]">
                              {mod.title}
                            </span>
                            <span className="text-xs font-mono-tabular text-[#0B192C]/65">
                              {mod.lessons.length} Lessons
                            </span>
                          </div>

                          <div className="divide-y divide-[#0B192C]/10">
                            {mod.lessons.map((les, idx) => (
                              <div
                                key={les.id}
                                className="p-3.5 flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="min-w-0">
                                  <p className="font-semibold text-[#0B192C] truncate">
                                    {idx + 1}. {les.title}
                                  </p>
                                  <p className="text-[11px] font-mono-tabular text-[#0B192C]/60">
                                    {les.durationMinutes}m ·{' '}
                                    {les.isFreePreview ? 'Free Preview' : 'Protected Paid Recording'}
                                    {les.recordingUrl ? ' · Custom Video Attached' : ''}
                                  </p>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleLessonPreview(mod.id, les.id)}
                                    className="px-2 py-1 rounded border border-[#0B192C]/20 text-[11px] font-semibold hover:bg-[#FAF8F5]"
                                  >
                                    {les.isFreePreview ? 'Lock Paid' : 'Make Free'}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveLesson(mod.id, idx, -1)}
                                    aria-label="Move lesson up"
                                    className="p-1.5 rounded border border-[#0B192C]/15 hover:bg-[#FAF8F5] disabled:opacity-30"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === mod.lessons.length - 1}
                                    onClick={() => handleMoveLesson(mod.id, idx, 1)}
                                    aria-label="Move lesson down"
                                    className="p-1.5 rounded border border-[#0B192C]/15 hover:bg-[#FAF8F5] disabled:opacity-30"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: CUSTOMERS DIRECTORY */}
          {activeSection === 'customers' && (
            <div className="space-y-4">
              <div className="border-b border-[#0B192C]/10 pb-4">
                <p className="text-xs font-mono-tabular uppercase text-[#B48327]">
                  Registered Accounts & Verified Spend
                </p>
                <h2 className="font-serif-display text-2xl font-bold text-[#0B192C]">
                  Customers Directory ({adminCustomers.length})
                </h2>
              </div>

              <div className="rounded-2xl bg-white border border-[#0B192C]/10 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#0B192C]/10 font-semibold text-[#0B192C]">
                      <th className="py-3.5 px-4">Customer Name & Email</th>
                      <th className="py-3.5 px-4">Phone</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Orders</th>
                      <th className="py-3.5 px-4">Verified Paid Spend</th>
                      <th className="py-3.5 px-4">Unlocked Items</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0B192C]/10">
                    {adminCustomers.map((c) => (
                      <tr key={c.uid}>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#0B192C] block">{c.displayName}</span>
                          <span className="text-xs font-mono-tabular text-[#0B192C]/65">
                            {c.email}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono-tabular text-xs">
                          {c.phone || '—'}
                        </td>
                        <td className="py-3.5 px-4 font-mono-tabular uppercase text-xs font-semibold">
                          <span
                            className={
                              c.role === 'admin' ? 'text-[#B48327]' : 'text-[#0D6E6E]'
                            }
                          >
                            {c.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono-tabular">{c.ordersCount}</td>
                        <td className="py-3.5 px-4 font-mono-tabular font-semibold text-[#0B192C]">
                          ₹{c.paidSpendInr.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-mono-tabular">{c.enrollmentsCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 5: ORDERS & CASHFREE PAYMENT STATUS MANAGEMENT */}
          {activeSection === 'orders' && (
            <div className="space-y-4">
              <div className="border-b border-[#0B192C]/10 pb-4">
                <p className="text-xs font-mono-tabular uppercase text-[#B48327]">
                  Cashfree Order Verification & Fulfillment
                </p>
                <h2 className="font-serif-display text-2xl font-bold text-[#0B192C]">
                  All Customer Orders ({allOrdersAdmin.length})
                </h2>
              </div>

              <div className="rounded-2xl bg-white border border-[#0B192C]/10 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#0B192C]/10 font-semibold text-[#0B192C]">
                      <th className="py-3.5 px-4">Order ID & Customer</th>
                      <th className="py-3.5 px-4">Items & Delivery Address</th>
                      <th className="py-3.5 px-4">Total (INR)</th>
                      <th className="py-3.5 px-4">Cashfree Payment Status</th>
                      <th className="py-3.5 px-4">Shipping Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0B192C]/10">
                    {allOrdersAdmin.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#0B192C]/60">
                          No customer orders stored yet. Place a test order via Cashfree Checkout to manage it here.
                        </td>
                      </tr>
                    ) : (
                      allOrdersAdmin.map((ord) => (
                        <tr key={ord.id}>
                          <td className="py-3.5 px-4 font-mono-tabular">
                            <span className="font-semibold text-[#0B192C]">{ord.id}</span>
                            <span className="block text-[11px] text-[#0B192C]/65">
                              {ord.userEmail}
                            </span>
                            {ord.cashfreeOrderId && (
                              <span className="block text-[10px] text-[#0D6E6E]">
                                CF: {ord.cashfreeOrderId}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 max-w-xs text-xs text-[#0B192C]/80">
                            {ord.itemsSummary}
                            <span className="block text-[11px] text-[#0B192C]/55 mt-0.5">
                              Ship to: {ord.shippingAddressSummary}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono-tabular font-semibold">
                            ₹{ord.totalInr.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              aria-label={`Payment status for order ${ord.id}`}
                              value={ord.status}
                              onChange={(e) =>
                                updateOrderShippingAdmin(
                                  ord.id,
                                  ord.shippingStatus,
                                  e.target.value as typeof ord.status
                                )
                              }
                              className="px-2.5 py-1.5 rounded border border-[#0B192C]/20 bg-[#FAF8F5] text-xs font-mono-tabular font-semibold"
                            >
                              <option value="paid">paid (Verified & Unlocked)</option>
                              <option value="pending">pending (Locked)</option>
                              <option value="failed">failed (Locked)</option>
                              <option value="refunded">refunded (Revoked)</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              aria-label={`Shipping status for order ${ord.id}`}
                              value={ord.shippingStatus}
                              onChange={(e) =>
                                updateOrderShippingAdmin(
                                  ord.id,
                                  e.target.value as typeof ord.shippingStatus,
                                  ord.status
                                )
                              }
                              className="px-2.5 py-1.5 rounded border border-[#0B192C]/20 bg-[#FAF8F5] text-xs font-mono-tabular"
                            >
                              <option value="not_applicable">not_applicable</option>
                              <option value="processing">processing</option>
                              <option value="shipped">shipped</option>
                              <option value="delivered">delivered</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
