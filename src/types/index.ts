export type BookCategory = 'Technology' | 'Stories & Literature';
export type BookFormatOption = 'Both' | 'Hardcover' | 'E-Book';
export type SelectedBookFormat = 'Hardcover' | 'E-Book';

export interface BookItem {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  category: BookCategory;
  subcategory: string;
  priceInr: number; // Hardcover price
  ebookPriceInr: number; // E-Book price
  format: BookFormatOption;
  stock: number;
  description: string;
  previewExcerpt: string;
  tableOfContents: string[];
  isbn: string;
  pages: number;
  language: string;
  publishYear: number;
  coverTheme: 'navy' | 'teal' | 'ivory' | 'gold' | 'slate' | 'burgundy';
  coverMotif: 'circuit' | 'architecture' | 'neural' | 'database' | 'banyan' | 'constellation' | 'compass' | 'scroll';
  imageUrl?: string;
  bestseller?: boolean;
  archived?: boolean;
  published?: boolean;
  ebookFullChapters?: {
    chapterTitle: string;
    content: string;
  }[];
}

export interface LessonResource {
  id: string;
  title: string;
  type: 'pdf_notes' | 'code_archive' | 'architecture_sheet';
  sizeLabel: string;
  content: string;
}

export interface LessonCaption {
  startSeconds: number;
  endSeconds: number;
  text: string;
}

export interface CourseLesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  durationMinutes: number;
  durationSeconds: number;
  isFreePreview: boolean;
  recordingUrl?: string;
  summary: string;
  keyTakeaways: string[];
  codeSnippet?: string;
  slides: {
    timestampSeconds: number;
    heading: string;
    bulletPoints: string[];
    codeHighlight?: string;
  }[];
  captions: LessonCaption[];
  resources: LessonResource[];
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
}

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface CourseItem {
  id: string;
  title: string;
  subtitle: string;
  instructor: string;
  instructorRole: string;
  subject: 'Python' | 'Django' | 'React' | 'SQL' | 'Generative AI' | 'Agentic AI' | 'System Design' | 'Algorithms';
  level: CourseLevel;
  priceInr: number;
  language: string;
  duration: string;
  totalLessons: number;
  description: string;
  outcomes: string[];
  prerequisites: string[];
  imageUrl?: string;
  featured?: boolean;
  archived?: boolean;
  published?: boolean;
  accentTheme: 'navy' | 'teal' | 'gold' | 'slate';
  modules: CourseModule[];
}

export type CartItemType = 'course' | 'ebook' | 'physical_book';

export interface CartItem {
  cartItemId: string; // e.g., book_id_Hardcover or course_id
  itemId: string;
  itemType: CartItemType;
  title: string;
  subtitleOrAuthor: string;
  unitPriceInr: number;
  quantity: number;
  maxStock?: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface OrderRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  totalInr: number;
  subtotalInr?: number;
  discountInr?: number;
  shippingInr?: number;
  paymentId: string;
  cashfreeOrderId?: string;
  paymentSessionId?: string;
  razorpayOrderId: string;
  paymentMode: 'cashfree_sandbox' | 'cashfree_live' | 'razorpay_live' | 'demo_verified';
  status: 'paid' | 'failed' | 'pending' | 'refunded';
  shippingStatus: 'not_applicable' | 'processing' | 'shipped' | 'delivered';
  shippingAddressSummary: string;
  itemsSummary: string;
  itemIds: string;
  items?: {
    itemId: string;
    itemType: CartItemType;
    title: string;
    unitPriceInr: number;
    quantity: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentRecord {
  id: string;
  userId: string;
  itemId: string;
  itemType: CartItemType;
  orderId: string;
  createdAt: string;
}

export interface LessonProgress {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  playbackSeconds: number;
  completed: boolean;
  notes: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  phone?: string;
  bio?: string;
  role: 'user' | 'student' | 'admin';
  emailVerified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
  updatedAt?: string;
}

export interface CustomerSummary {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  phone?: string;
  role: 'user' | 'student' | 'admin';
  ordersCount: number;
  paidSpendInr: number;
  enrollmentsCount: number;
  createdAt: string;
  lastLoginAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedLinks?: {
    label: string;
    path: string;
  }[];
}
