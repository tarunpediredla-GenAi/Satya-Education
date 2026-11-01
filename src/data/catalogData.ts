import type { BookItem, CourseItem } from '../types/index.ts';

export const INITIAL_BOOKS: BookItem[] = [
  // ==================== 20 TECHNOLOGY BOOKS ====================
  {
    id: 'book-tech-01',
    title: 'Fluent Python Architecture',
    subtitle: 'Writing Expressive, Idiomatic, and High-Concurrency Systems in Python 3.13',
    author: 'Satya Narayana & Dr. Arvind Rao',
    category: 'Technology',
    subcategory: 'Python',
    priceInr: 899,
    ebookPriceInr: 499,
    format: 'Both',
    stock: 28,
    description:
      'A rigorous exploration of Python data models, descriptors, async event loops, memory views, and structural pattern matching. Designed for software engineers transitioning from scripting to production-grade distributed systems.',
    previewExcerpt:
      'Chapter 1: The Python Data Model is not merely magic methods; it is a formal protocol contract between your domain objects and the CPython runtime...',
    tableOfContents: [
      '01. The Python Data Model & Protocol Contracts',
      '02. Memoryviews, Slots, and Object Layout in CPython',
      '03. Coroutines, TaskGroups, and Structured Concurrency',
      '04. Metaprogramming & Descriptors Without Magic',
      '05. Profiling, Free-Threaded Python, and Native Extensions',
    ],
    isbn: '978-81-948210-1-1',
    pages: 540,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'navy',
    coverMotif: 'circuit',
    bestseller: true,
    archived: false,
  },
  {
    id: 'book-tech-02',
    title: 'Django 5 for High-Scale Web Systems',
    subtitle: 'ORM Internals, Async Views, Multi-Tenant Security, and REST Architecture',
    author: 'Satya Narayana',
    category: 'Technology',
    subcategory: 'Django',
    priceInr: 949,
    ebookPriceInr: 549,
    format: 'Both',
    stock: 34,
    description:
      'Master production Django engineering from query plan optimization and database locking to zero-downtime migrations, async ASGI middleware, and React integration patterns.',
    previewExcerpt:
      'Every N+1 query in a Django application is a silent tax on latency. By understanding how QuerySet evaluation caches and select_related joins operate at the SQL layer...',
    tableOfContents: [
      '01. Request Lifecycle: WSGI vs ASGI in Django 5',
      '02. Deep ORM: Subqueries, Window Functions & Locking',
      '03. Authentication, RBAC & Cryptographic Signing',
      '04. Building Resilient APIs with Django REST & Ninja',
      '05. Background Queues, Outbox Pattern & Idempotency',
    ],
    isbn: '978-81-948210-1-2',
    pages: 612,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'teal',
    coverMotif: 'architecture',
    bestseller: true,
    archived: false,
  },
  {
    id: 'book-tech-03',
    title: 'React 19 & Modern Frontend Systems',
    subtitle: 'Concurrent Rendering, Server Actions, Type-Safe State, and Design Systems',
    author: 'Meera Krishnan',
    category: 'Technology',
    subcategory: 'React',
    priceInr: 849,
    ebookPriceInr: 479,
    format: 'Both',
    stock: 19,
    description:
      'Go beneath the surface of React Fiber reconciliation, fine-grained rendering performance, accessible component primitives, and resilient client-server data synchronization.',
    previewExcerpt:
      'UI engineering is state orchestration across time. When we model user intent as deterministic state transitions rather than ad-hoc useEffect chains, bugs vanish...',
    tableOfContents: [
      '01. Fiber Architecture & Concurrent Scheduling',
      '02. Eliminating Waterfall Renders & Stale Closures',
      '03. Accessible Primitives: Keyboard, Focus & ARIA',
      '04. State Machines & Optimistic UI Mutations',
      '05. Bundling, Code Splitting & Core Web Vitals',
    ],
    isbn: '978-81-948210-1-3',
    pages: 480,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'ivory',
    coverMotif: 'circuit',
    bestseller: true,
    archived: false,
  },
  {
    id: 'book-tech-04',
    title: 'Relational Artistry: SQL & PostgreSQL Internals',
    subtitle: 'B-Tree Indexes, MVCC Concurrency, Query Planners, and Analytical SQL',
    author: 'Vikramaditya Sen',
    category: 'Technology',
    subcategory: 'SQL',
    priceInr: 999,
    ebookPriceInr: 599,
    format: 'Both',
    stock: 22,
    description:
      'Understand how relational databases actually store tuples on disk, manage write-ahead logs, resolve lock contention, and execute complex CTEs and window functions at millisecond speeds.',
    previewExcerpt:
      'An index is not a magic wand; it is a secondary data structure with write amplification trade-offs. Reading EXPLAIN (ANALYZE, BUFFERS) output is the superpower of backend engineers...',
    tableOfContents: [
      '01. Heap Files, Pages, and Tuple Visibility (MVCC)',
      '02. B-Tree, GIN, GiST, and BRIN Indexing Strategies',
      '03. Mastering Window Functions & Recursive CTEs',
      '04. Isolation Levels, Deadlocks & Serializable Snapshots',
      '05. Partitioning, Connection Pooling & Zero-Data-Loss Backups',
    ],
    isbn: '978-81-948210-1-4',
    pages: 590,
    language: 'English',
    publishYear: 2025,
    coverTheme: 'slate',
    coverMotif: 'database',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-tech-05',
    title: 'Generative AI Engineering from First Principles',
    subtitle: 'Transformer Mechanics, Structured Outputs, RAG Pipelines, and Evaluation',
    author: 'Satya Narayana & Dr. Priya Nair',
    category: 'Technology',
    subcategory: 'Generative AI',
    priceInr: 1199,
    ebookPriceInr: 699,
    format: 'Both',
    stock: 40,
    description:
      'Bridge the gap between prompt prototypes and reliable production AI systems. Covers tokenization, attention KV-caching, hybrid semantic retrieval, schema-constrained generation, and automated evals.',
    previewExcerpt:
      'A production LLM pipeline succeeds or fails on evaluation rigor. Before tuning prompts or swapping models, build a deterministic golden dataset...',
    tableOfContents: [
      '01. Attention Mechanisms, Tokenization & Context Windows',
      '02. Structured Generation & Deterministic JSON Schemas',
      '03. Hybrid Search: Dense Embeddings + BM25 Lexical Ranking',
      '04. Evaluation Frameworks, Guardrails & Latency Budgets',
      '05. Multimodal Pipelines: Vision, Audio & Document Parsing',
    ],
    isbn: '978-81-948210-1-5',
    pages: 640,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'navy',
    coverMotif: 'neural',
    bestseller: true,
    archived: false,
  },
  {
    id: 'book-tech-06',
    title: 'Agentic AI Systems: Reasoning, Tools & Memory',
    subtitle: 'Designing Autonomous Multi-Step Workflows with Sandboxed Execution',
    author: 'Satya Narayana',
    category: 'Technology',
    subcategory: 'Agentic AI',
    priceInr: 1249,
    ebookPriceInr: 749,
    format: 'Both',
    stock: 31,
    description:
      'A practical treatise on building reliable AI agents: ReAct loops, function calling contracts, episodic and semantic memory stores, human-in-the-loop checkpoints, and error recovery.',
    previewExcerpt:
      'An agent is not a prompt in a while-loop; it is a bounded control system where tool schemas, state checkpoints, and verification gates prevent compounding hallucinations...',
    tableOfContents: [
      '01. Foundations of Agentic Control Loops',
      '02. Designing Self-Healing Tool & Function Interfaces',
      '03. Episodic, Working, and Long-Term Vector Memory',
      '04. Multi-Agent Orchestration & Critic Verification',
      '05. Security Sandboxing, Prompt Injection Defense & Cost Caps',
    ],
    isbn: '978-81-948210-1-6',
    pages: 568,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'gold',
    coverMotif: 'neural',
    bestseller: true,
    archived: false,
  },
  {
    id: 'book-tech-07',
    title: 'Distributed Systems in Practice',
    subtitle: 'Consensus, Replication, Logical Clocks, and Fault-Tolerant Microservices',
    author: 'Rohan Deshmukh',
    category: 'Technology',
    subcategory: 'System Design',
    priceInr: 1099,
    ebookPriceInr: 649,
    format: 'Both',
    stock: 15,
    description:
      'Explore Raft consensus, Lamport timestamps, consistent hashing, idempotent retries, circuit breakers, and distributed tracing through real-world postmortems and implementations.',
    previewExcerpt:
      'In a distributed network, partial failure is the default state. When a timeout occurs, you do not know whether the remote node crashed before or after committing...',
    tableOfContents: [
      '01. Network Partitions, Partial Failures & Time',
      '02. Leader Election & Raft Consensus Explained',
      '03. Partitioning, Consistent Hashing & Rebalancing',
      '04. Saga Patterns, Two-Phase Commit & Outbox Queues',
      '05. Observability, Tail Latency & Chaos Testing',
    ],
    isbn: '978-81-948210-1-7',
    pages: 520,
    language: 'English',
    publishYear: 2025,
    coverTheme: 'slate',
    coverMotif: 'architecture',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-tech-08',
    title: 'TypeScript Type-Level Programming',
    subtitle: 'Conditional Types, Template Literals, Variance, and Zero-Runtime-Cost Safety',
    author: 'Ananya Sharma',
    category: 'Technology',
    subcategory: 'TypeScript',
    priceInr: 799,
    ebookPriceInr: 449,
    format: 'Both',
    stock: 25,
    description:
      'Turn the TypeScript compiler into an automated proof assistant for your domain invariants. Learn branded types, recursive type inference, covariance/contravariance, and AST tooling.',
    previewExcerpt:
      'Make illegal states unrepresentable. When your API client encodes route parameters and payload contracts at the type level, entire classes of integration tests become redundant...',
    tableOfContents: [
      '01. Set Theory Foundations of Structural Typing',
      '02. Branded Primitives & Domain Invariant Modeling',
      '03. Infer, Distributive Conditional Types & Mapped Types',
      '04. Variance, Function Subtyping & Generics',
      '05. Compiler API Diagnostics & Monorepo Project References',
    ],
    isbn: '978-81-948210-1-8',
    pages: 410,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'teal',
    coverMotif: 'circuit',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-tech-09',
    title: 'Algorithms & Graph Theory for Builders',
    subtitle: 'Visualizing Shortest Paths, Network Flows, Dynamic Programming, and Trees',
    author: 'Prof. K. Subramanian',
    category: 'Technology',
    subcategory: 'Algorithms',
    priceInr: 879,
    ebookPriceInr: 499,
    format: 'Both',
    stock: 30,
    description:
      'Learn algorithmic problem solving not as rote memorization, but as a toolkit for routing networks, scheduling tasks, diffing text buffers, and optimizing dependency graphs.',
    previewExcerpt:
      'Every dependency installer, map router, and spreadsheet recalculation engine rests on topological sorting and directed acyclic graphs...',
    tableOfContents: [
      '01. Asymptotic Complexity & Cache-Friendly Data Structures',
      '02. Breadth-First, Dijkstra, and A* Heuristic Search',
      '03. Directed Acyclic Graphs, Tarjan SCC & Topological Sort',
      '04. Dynamic Programming Through Subproblem Lattices',
      '05. Tries, Suffix Arrays & String Matching Engines',
    ],
    isbn: '978-81-948210-1-9',
    pages: 530,
    language: 'English',
    publishYear: 2025,
    coverTheme: 'navy',
    coverMotif: 'constellation',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-tech-10',
    title: 'Linux Systems & Container Internals',
    subtitle: 'Namespaces, Cgroups, eBPF Observability, and Virtual Memory',
    author: 'Siddharth Verma',
    category: 'Technology',
    subcategory: 'Systems',
    priceInr: 929,
    ebookPriceInr: 529,
    format: 'Both',
    stock: 18,
    description:
      'Demystify what happens when a process starts, allocates memory, opens a socket, or runs inside a container. Build your own minimal container runtime in 300 lines of code.',
    previewExcerpt:
      'There is no such thing as a "container" in the Linux kernel—only ordinary processes whose view of the filesystem, PID tree, and network stack is isolated by namespaces...',
    tableOfContents: [
      '01. Syscalls, Process Descriptors & Copy-on-Write Forking',
      '02. Virtual Memory, Page Tables & OOM Killer Mechanics',
      '03. Building Containers with clone(), cgroups v2 & overlayfs',
      '04. TCP/IP Stack, Epoll Event Loops & Zero-Copy I/O',
      '05. Kernel Tracing with eBPF & perf',
    ],
    isbn: '978-81-948210-2-0',
    pages: 495,
    language: 'English',
    publishYear: 2025,
    coverTheme: 'slate',
    coverMotif: 'circuit',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-tech-11',
    title: 'Rust for Python & Web Engineers',
    subtitle: 'Ownership, Lifetimes, Tokio Async, and High-Speed PyO3 Bindings',
    author: 'Karthik Rajagopal',
    category: 'Technology',
    subcategory: 'Rust',
    priceInr: 999,
    ebookPriceInr: 579,
    format: 'Both',
    stock: 21,
    description:
      'A pragmatic guide for Python and TypeScript developers learning Rust. Write fearless concurrent code and accelerate Python bottlenecks 50x using PyO3 and Maturin.',
    previewExcerpt:
      'The borrow checker is not an adversary; it is a compile-time mentor that prevents use-after-free and data races before your code ever reaches production...',
    tableOfContents: [
      '01. Stack vs Heap, Ownership & Move Semantics',
      '02. Borrowing, Lifetimes & Interior Mutability',
      '03. Enums, Pattern Matching & Zero-Cost Traits',
      '04. Async Rust with Tokio & Axum Web Services',
      '05. Writing Native Python Extensions with PyO3',
    ],
    isbn: '978-81-948210-2-1',
    pages: 472,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'burgundy',
    coverMotif: 'architecture',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-tech-12',
    title: 'Web Application Security & Zero-Trust Design',
    subtitle: 'OAuth 2.1, Passkeys, Cryptographic Signatures, and Defensive Coding',
    author: 'Neha Kulkarni',
    category: 'Technology',
    subcategory: 'Security',
    priceInr: 899,
    ebookPriceInr: 499,
    format: 'Both',
    stock: 26,
    description:
      'Protect modern web platforms against IDOR, SSRF, webhook forgery, XSS, and privilege escalation. Includes hands-on security audits for React, Django, and Firestore.',
    previewExcerpt:
      'Client-side UI hiding is convenience, never security. Every API endpoint and database rule must assume the incoming request was crafted by an adversary...',
    tableOfContents: [
      '01. Threat Modeling & Zero-Trust Architecture',
      '02. OAuth 2.1, PKCE, OIDC & Session Hardening',
      '03. Webhook HMAC Verification & Idempotency Keys',
      '04. Attribute-Based Access Control (ABAC) in Practice',
      '05. Content Security Policy, CORS & Supply-Chain Audits',
    ],
    isbn: '978-81-948210-2-2',
    pages: 450,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'navy',
    coverMotif: 'compass',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-tech-13',
    title: 'Crafting Compilers & Interpreters',
    subtitle: 'Lexing, Pratt Parsing, Bytecode Virtual Machines, and Garbage Collection',
    author: 'Dr. Arvind Rao',
    category: 'Technology',
    subcategory: 'Compilers',
    priceInr: 1049,
    ebookPriceInr: 599,
    format: 'Both',
    stock: 14,
    description:
      'Build a complete, dynamically typed scripting language from scratch—starting with a tree-walk AST interpreter and evolving into a stack-based bytecode VM with mark-and-sweep GC.',
    previewExcerpt:
      'Once you build a parser and bytecode compiler, programming languages cease to be mysterious black boxes and become human-engineered artifacts you can shape...',
    tableOfContents: [
      '01. Lexical Scanning & Token Streams',
      '02. Recursive Descent & Pratt Operator Precedence',
      '03. Lexical Scopes, Closures & Upvalues',
      '04. Compiling ASTs to Compact Bytecode',
      '05. Mark-and-Sweep Garbage Collection',
    ],
    isbn: '978-81-948210-2-3',
    pages: 580,
    language: 'English',
    publishYear: 2025,
    coverTheme: 'ivory',
    coverMotif: 'scroll',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-tech-14',
    title: 'Modern Data Engineering & Streaming Pipelines',
    subtitle: 'Event-Driven Lakehouses, Apache Arrow, DuckDB, and Change Data Capture',
    author: 'pranav Menon',
    category: 'Technology',
    subcategory: 'Data Engineering',
    priceInr: 979,
    ebookPriceInr: 549,
    format: 'Both',
    stock: 20,
    description:
      'Design resilient analytical pipelines using columnar formats, Parquet, CDC streams, and embedded analytical engines without over-provisioning massive clusters.',
    previewExcerpt:
      'Before reaching for a 50-node distributed cluster, understand what columnar vectorized execution on a single modern multicore machine can process in seconds...',
    tableOfContents: [
      '01. Row-Oriented OLTP vs Columnar OLAP Storage',
      '02. Change Data Capture (CDC) from PostgreSQL',
      '03. Vectorized Execution with DuckDB & Apache Arrow',
      '04. Data Contracts, Schema Evolution & Idempotent Backfills',
      '05. Real-Time Feature Stores for Machine Learning',
    ],
    isbn: '978-81-948210-2-4',
    pages: 488,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'teal',
    coverMotif: 'database',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-tech-15',
    title: 'Deep Learning Mathematics & PyTorch Internals',
    subtitle: 'Automatic Differentiation, Tensor Strides, Custom Kernels, and Optimization',
    author: 'Dr. Priya Nair',
    category: 'Technology',
    subcategory: 'Generative AI',
    priceInr: 1149,
    ebookPriceInr: 649,
    format: 'Both',
    stock: 17,
    description:
      'Build your own reverse-mode automatic differentiation engine from scratch, then master PyTorch tensor memory layouts, mixed-precision training, and distributed FSDP.',
    previewExcerpt:
      'Backpropagation is simply the chain rule of calculus applied systematically over a directed acyclic computation graph...',
    tableOfContents: [
      '01. Linear Algebra, Eigenvalues & Matrix Calculus',
      '02. Building a Micro-Autograd Engine from Scratch',
      '03. Tensor Strides, Contiguous Memory & GPU Transfers',
      '04. Optimizers: SGD with Momentum, AdamW & Cosine Schedules',
      '05. FlashAttention, Mixed Precision (BF16) & Quantization',
    ],
    isbn: '978-81-948210-2-5',
    pages: 605,
    language: 'English',
    publishYear: 2025,
    coverTheme: 'gold',
    coverMotif: 'neural',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-tech-16',
    title: 'API Design & GraphQL / REST Craftsmanship',
    subtitle: 'Pagination, Rate Limiting, Versioning, Idempotency, and Developer Experience',
    author: 'Satya Narayana',
    category: 'Technology',
    subcategory: 'Django',
    priceInr: 749,
    ebookPriceInr: 399,
    format: 'Both',
    stock: 35,
    description:
      'A field manual for designing APIs that developers love and that survive years of backward-compatible evolution. Covers cursor pagination, RFC 9457 Problem Details, and webhooks.',
    previewExcerpt:
      'An API is a long-lived user interface for programmers. Inconsistent error payloads and offset-pagination drift will haunt your platform for years...',
    tableOfContents: [
      '01. Resource Modeling & Consistent Naming Conventions',
      '02. Keyset (Cursor) Pagination vs Offset Pagination',
      '03. Idempotency-Key Headers & Safe Retries',
      '04. Token Bucket Rate Limiting & Backpressure',
      '05. Webhook Delivery Guarantees & Exponential Backoff',
    ],
    isbn: '978-81-948210-2-6',
    pages: 380,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'ivory',
    coverMotif: 'architecture',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-tech-17',
    title: 'Kubernetes & Cloud-Native Reliability',
    subtitle: 'Pod Scheduling, Service Meshes, Autoscaling, and GitOps Workflows',
    author: 'Siddharth Verma',
    category: 'Technology',
    subcategory: 'Systems',
    priceInr: 969,
    ebookPriceInr: 549,
    format: 'Both',
    stock: 19,
    description:
      'Move beyond copy-pasting YAML files. Understand the Kubernetes control loop, etcd reconciliation, liveness vs readiness probes, and graceful SIGTERM shutdowns.',
    previewExcerpt:
      'Most zero-downtime deployment failures happen because engineers misunderstand the race condition between kube-proxy endpoint removal and application SIGTERM handling...',
    tableOfContents: [
      '01. Control Plane Architecture & Reconciliation Loops',
      '02. Pod Lifecycle, Probes & Graceful Termination',
      '03. CNI Networking, Ingress & DNS Resolution',
      '04. Resource Requests, Limits & HPA Autoscaling',
      '05. Declarative GitOps & Disaster Recovery',
    ],
    isbn: '978-81-948210-2-7',
    pages: 510,
    language: 'English',
    publishYear: 2025,
    coverTheme: 'navy',
    coverMotif: 'compass',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-tech-18',
    title: 'Testing & Software Craftsmanship in Python & React',
    subtitle: 'Property-Based Testing, Contract Tests, Playwright E2E, and Refactoring',
    author: 'Meera Krishnan',
    category: 'Technology',
    subcategory: 'Python',
    priceInr: 799,
    ebookPriceInr: 429,
    format: 'Both',
    stock: 29,
    description:
      'Write test suites that run in seconds and catch real regressions instead of brittle mocks that break on every refactor. Features Hypothesis, Pytest, Vitest, and Playwright.',
    previewExcerpt:
      'Test behavior, not implementation details. When a test mocks five internal helper functions, it ceases to verify system correctness and only tests your choreography...',
    tableOfContents: [
      '01. The Testing Trophy: Unit, Integration & E2E Balance',
      '02. Pytest Fixtures, Factories & Transactional Rollbacks',
      '03. Property-Based Testing with Hypothesis',
      '04. Component & Accessibility Testing in React',
      '05. Deterministic End-to-End Flows with Playwright',
    ],
    isbn: '978-81-948210-2-8',
    pages: 420,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'teal',
    coverMotif: 'circuit',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-tech-19',
    title: 'Vector Databases & Semantic Information Retrieval',
    subtitle: 'HNSW Graphs, Product Quantization, Rerankers, and Multimodal Search',
    author: 'Dr. Priya Nair',
    category: 'Technology',
    subcategory: 'Generative AI',
    priceInr: 949,
    ebookPriceInr: 529,
    format: 'E-Book',
    stock: 0,
    description:
      'An in-depth engineering guide to approximate nearest neighbor (ANN) algorithms, HNSW graph construction, metadata pre-filtering, and cross-encoder reranking.',
    previewExcerpt:
      'Cosine similarity in 1,536 dimensions behaves counterintuitively unless paired with domain-calibrated chunking and reciprocal rank fusion...',
    tableOfContents: [
      '01. Geometry of High-Dimensional Embedding Spaces',
      '02. IVF, Flat, and HNSW Graph Indexing Internals',
      '03. Scalar & Product Quantization for Memory Reduction',
      '04. Hybrid Retrieval & Reciprocal Rank Fusion (RRF)',
      '05. Cross-Encoder Reranking & Retrieval Metrics (NDCG@K)',
    ],
    isbn: '978-81-948210-2-9',
    pages: 395,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'slate',
    coverMotif: 'database',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-tech-20',
    title: 'Human-Centered UI/UX & Design Systems',
    subtitle: 'Typography Scales, Color Contrast Math, Spatial Grids, and Cognitive Load',
    author: 'Satya Narayana',
    category: 'Technology',
    subcategory: 'React',
    priceInr: 899,
    ebookPriceInr: 499,
    format: 'Both',
    stock: 42,
    description:
      'Distills 20 years of product design experience into actionable mathematical rules for layout rhythm, optical typography, accessible contrast, and tactile micro-interactions.',
    previewExcerpt:
      'Great interfaces feel effortless because every margin, font weight, and focus ring follows a quiet structural logic that respects human visual perception...',
    tableOfContents: [
      '01. Visual Hierarchy & Focal Anchor Discipline',
      '02. Typographic Proportions, Measure & Tabular Figures',
      '03. Color Systems: 60-30-10 Budget & WCAG Contrast',
      '04. Spatial Math: Padding Ratios & Optical Alignment',
      '05. Accessible Forms, Keyboard Flows & Reduced Motion',
    ],
    isbn: '978-81-948210-3-0',
    pages: 460,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'gold',
    coverMotif: 'compass',
    bestseller: true,
    archived: false,
  },

  // ==================== 20 STORIES & LITERATURE BOOKS ====================
  {
    id: 'book-story-01',
    title: 'The Banyan Tree of Ujjain',
    subtitle: 'Timeless Tales of Logic, Wit, and Moral Courage from Ancient Scholars',
    author: 'Acharya Vishnusharma (Retold by Satya)',
    category: 'Stories & Literature',
    subcategory: 'Wisdom & Fables',
    priceInr: 499,
    ebookPriceInr: 249,
    format: 'Both',
    stock: 50,
    description:
      'A luminous retelling of classic Indian philosophical stories where young scholars, weavers, astronomers, and travelers solve life’s hardest dilemmas through observation and empathy.',
    previewExcerpt:
      'Beneath the great aerial roots of the eastern banyan, the old astronomer drew three concentric circles in the dust and asked the prince: "Which boundary is real?"...',
    tableOfContents: [
      '01. The Astronomer and the Broken Sundial',
      '02. The Weaver Who Measured the Wind',
      '03. Three Merchants at the Narmada Crossing',
      '04. The Silence of the Royal Librarian',
      '05. Epilogue: Notes on Classical Indian Logic (Nyaya)',
    ],
    isbn: '978-81-948210-4-1',
    pages: 312,
    language: 'English',
    publishYear: 2025,
    coverTheme: 'gold',
    coverMotif: 'banyan',
    bestseller: true,
    archived: false,
  },
  {
    id: 'book-story-02',
    title: 'The Clockmaker of Madras',
    subtitle: 'Historical Stories of Forgotten Inventors, Navigators, and Mathematicians',
    author: 'vasudha Murthy',
    category: 'Stories & Literature',
    subcategory: 'Historical Fiction',
    priceInr: 549,
    ebookPriceInr: 299,
    format: 'Both',
    stock: 38,
    description:
      'Seven richly atmospheric novellas set between 1780 and 1940, celebrating quiet artisans, observatory clerks, and self-taught mathematicians who built marvels with brass and ink.',
    previewExcerpt:
      'In the monsoon of 1894, Damodar spent forty-two nights grinding a six-inch achromatic lens by lantern light while the harbor bells tolled across George Town...',
    tableOfContents: [
      '01. The Brass Chronometer of Fort St. George',
      '02. Letters to the Trigonometric Survey',
      '03. The Glassblower of Firozabad',
      '04. Monsoon Tide Tables',
      '05. The Last Telegraph of Shimla',
    ],
    isbn: '978-81-948210-4-2',
    pages: 348,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'navy',
    coverMotif: 'compass',
    bestseller: true,
    archived: false,
  },
  {
    id: 'book-story-03',
    title: 'Echoes in the Silicon Valley',
    subtitle: 'Speculative Short Stories on Memory, Synthetic Minds, and Human Connection',
    author: 'Kabir Chatterjee',
    category: 'Stories & Literature',
    subcategory: 'Sci-Fi & Speculative',
    priceInr: 599,
    ebookPriceInr: 329,
    format: 'Both',
    stock: 27,
    description:
      'Ten deeply humane speculative fiction stories exploring what happens when artificial intelligence learns to archive human grief, forgotten dialects, and childhood lullabies.',
    previewExcerpt:
      'The model had been trained on four million hours of vanishing folk songs. One Tuesday in November, it began humming a melody no living villager remembered...',
    tableOfContents: [
      '01. The Dialect Archivist',
      '02. Weight Decay and Other Memories',
      '03. A Turing Test for Grandmothers',
      '04. Latency Between Stars',
      '05. The Last Analog Chess Club in Bengaluru',
    ],
    isbn: '978-81-948210-4-3',
    pages: 328,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'teal',
    coverMotif: 'constellation',
    bestseller: true,
    archived: false,
  },
  {
    id: 'book-story-04',
    title: 'Lanterns by the Godavari',
    subtitle: 'Heartwarming Stories of Village Schoolteachers and Lifelong Learners',
    author: 'Satya Narayana',
    category: 'Stories & Literature',
    subcategory: 'Inspirational Fiction',
    priceInr: 449,
    ebookPriceInr: 229,
    format: 'Both',
    stock: 64,
    description:
      'Inspired by real educators across coastal Andhra and Telangana, these gentle, unforgettable stories follow a riverside mobile library boat and the students whose lives it transforms.',
    previewExcerpt:
      'Every Thursday at dusk, Master Gopalam’s wooden boat moored beside the mango grove, its kerosene lantern signaling that new geometry primers and storybooks had arrived...',
    tableOfContents: [
      '01. The Floating Library of Rajahmundry',
      '02. Chalk Dust and Starlight',
      '03. The Girl Who Proved Pythagoras with Paper Folding',
      '04. A Bicycle for the Postmistress',
      '05. The Homecoming Examination',
    ],
    isbn: '978-81-948210-4-4',
    pages: 276,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'ivory',
    coverMotif: 'banyan',
    bestseller: true,
    archived: false,
  },
  {
    id: 'book-story-05',
    title: 'The Infinite Notebook',
    subtitle: 'Biographical Stories of Great Scientists and Their Eureka Moments',
    author: 'Dr. Shashi Deshpande & A. K. Raman',
    category: 'Stories & Literature',
    subcategory: 'Biographical Stories',
    priceInr: 579,
    ebookPriceInr: 299,
    format: 'Both',
    stock: 32,
    description:
      'Narrative portraits of Srinivasa Ramanujan, C. V. Raman, Emmy Noether, Alan Turing, and Janaki Ammal—told through intimate scenes of curiosity, setback, and triumph.',
    previewExcerpt:
      'On the deck of the steamer crossing the Mediterranean, Raman stared at the deep sapphire water and questioned Lord Rayleigh’s explanation of why the sea is blue...',
    tableOfContents: [
      '01. Slate and Soapstone in Kumbakonam',
      '02. Why the Mediterranean Sea is Sapphire',
      '03. Emmy Noether’s Walks in Göttingen',
      '04. Sweet Cane and Chromosomes: Janaki Ammal',
      '05. The Morphogenesis of Daisies',
    ],
    isbn: '978-81-948210-4-5',
    pages: 364,
    language: 'English',
    publishYear: 2025,
    coverTheme: 'navy',
    coverMotif: 'constellation',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-story-06',
    title: 'The Cipher of Nalanda',
    subtitle: 'A Literary Mystery of Ancient Manuscripts and Mathematical Puzzles',
    author: 'Devika Sen',
    category: 'Stories & Literature',
    subcategory: 'Mystery & Adventure',
    priceInr: 529,
    ebookPriceInr: 279,
    format: 'Both',
    stock: 29,
    description:
      'When an epigraphist and a computer scientist uncover a birch-bark manuscript encoded with Pingala’s binary prosody, they are drawn into a centuries-old intellectual quest.',
    previewExcerpt:
      'Long before Leibniz wrote of ones and zeroes, Sanskrit poets classified short and long syllables into Mount Meru’s combinatorial triangle...',
    tableOfContents: [
      '01. The Birch-Bark Folio in Patna',
      '02. Pingala’s Binary Meter (Laghu and Guru)',
      '03. The Monastery of Nine Courtyards',
      '04. The Astronomer’s Water Clock',
      '05. Resolution at Dawn',
    ],
    isbn: '978-81-948210-4-6',
    pages: 390,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'burgundy',
    coverMotif: 'scroll',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-story-07',
    title: 'Monsoon Chai & Midnight Code',
    subtitle: 'Cozy Slice-of-Life Stories of Builders, Bookshops, and Second Chances',
    author: 'Rituja Joshi',
    category: 'Stories & Literature',
    subcategory: 'Contemporary Fiction',
    priceInr: 479,
    ebookPriceInr: 249,
    format: 'Both',
    stock: 41,
    description:
      'Set in a rain-drenched Pune neighborhood where an independent bookshop shares a courtyard with a tiny software cooperative, strangers bond over books, tea, and quiet ambition.',
    previewExcerpt:
      'Outside, the July rain drummed against the corrugated tin awning of Kitab Ghar; inside, the kettle whistled beside a stack of freshly unpacked hardcover novels...',
    tableOfContents: [
      '01. The Courtyard on Fergusson College Road',
      '02. Margin Notes in Pencil',
      '03. Debugging the Bakery Inventory',
      '04. The Sunday Reading Circle',
      '05. Clear Skies Over Sahyadri',
    ],
    isbn: '978-81-948210-4-7',
    pages: 294,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'teal',
    coverMotif: 'banyan',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-story-08',
    title: 'Parables of the Craft',
    subtitle: 'Short Philosophical Fables for Engineers, Designers, and Thinkers',
    author: 'Satya Narayana',
    category: 'Stories & Literature',
    subcategory: 'Wisdom & Fables',
    priceInr: 399,
    ebookPriceInr: 199,
    format: 'Both',
    stock: 55,
    description:
      'Forty concise, meditative fables about stonecutters, bridge builders, calligraphers, and gardeners that illuminate simplicity, patience, and mastery in creative work.',
    previewExcerpt:
      'A young apprentice asked the master bridge-builder why he carved the underside of the keystone where no traveler would ever look. The master smiled...',
    tableOfContents: [
      '01. The Underside of the Keystone',
      '02. The Calligrapher’s Inkstone',
      '03. Two Cathedrals in the Valley',
      '04. The Gardener Who Pruned in Winter',
      '05. The Cathedral of Simple Tools',
    ],
    isbn: '978-81-948210-4-8',
    pages: 220,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'gold',
    coverMotif: 'scroll',
    bestseller: true,
    archived: false,
  },
  {
    id: 'book-story-09',
    title: 'The Star-Navigators of Kutch',
    subtitle: 'Maritime Stories of the Indian Ocean, Monsoons, and Celestial Maps',
    author: 'Harish Kapadia',
    category: 'Stories & Literature',
    subcategory: 'Historical Fiction',
    priceInr: 549,
    ebookPriceInr: 289,
    format: 'Both',
    stock: 23,
    description:
      'Follow traditional dhow navigators of Mandvi who steered across the Arabian Sea without magnetic compasses, reading the kamal star-board, ocean swells, and bioluminescence.',
    previewExcerpt:
      'Holding the wooden kamal between his teeth and sighting Polaris three finger-widths above the horizon, Malam Lakha knew the Malabar coast lay two days south...',
    tableOfContents: [
      '01. The Shipwrights of Mandvi Creek',
      '02. Reading the Seventeen Stars',
      '03. The Cinnamon Winds',
      '04. Storm Over Socotra',
      '05. The Mapmaker’s Return',
    ],
    isbn: '978-81-948210-4-9',
    pages: 336,
    language: 'English',
    publishYear: 2025,
    coverTheme: 'navy',
    coverMotif: 'compass',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-story-10',
    title: 'The Paper Crane Mathematician',
    subtitle: 'Stories of Geometry, Origami, and Wonder for Curious Minds',
    author: 'aparna Sen & Kenji Sato',
    category: 'Stories & Literature',
    subcategory: 'Inspirational Fiction',
    priceInr: 469,
    ebookPriceInr: 249,
    format: 'Both',
    stock: 36,
    description:
      'When a retired geometry professor in Kyoto and an eleven-year-old student in Bengaluru begin exchanging folded paper puzzles by post, an extraordinary mentorship unfolds.',
    previewExcerpt:
      'With three crisp creases, the flat square of washi paper became a hyperbolic paraboloid that could bear twenty times its own weight...',
    tableOfContents: [
      '01. The First Envelope from Kyoto',
      '02. Kawasaki’s Theorem in the Rain',
      '03. Folding a Solar Sail',
      '04. The Tessellation Contest',
      '05. A Thousand Theorems',
    ],
    isbn: '978-81-948210-5-0',
    pages: 268,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'ivory',
    coverMotif: 'constellation',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-story-11',
    title: 'Tales from the Deccan Plateau',
    subtitle: 'Folktales of Resilience, Craft, and Community from Southern India',
    author: 'Lakshmi Narasamma',
    category: 'Stories & Literature',
    subcategory: 'Wisdom & Fables',
    priceInr: 429,
    ebookPriceInr: 219,
    format: 'Both',
    stock: 44,
    description:
      'A curated anthology of oral stories celebrating stepwell architects, Bidriware metalworkers, Pochampally ikat weavers, and village storytellers across the Deccan.',
    previewExcerpt:
      'Before throwing a single shuttle of dyed cotton, the master weaver of Pochampally sang the tie-dye coordinates aloud like an ancient poem...',
    tableOfContents: [
      '01. The Stepwell of Seven Echoes',
      '02. Silver Inlay on Black Earth',
      '03. The Song of the Ikat Loom',
      '04. The Potter’s Wheel at Dawn',
      '05. The Banyan Panchayat',
    ],
    isbn: '978-81-948210-5-1',
    pages: 304,
    language: 'English',
    publishYear: 2025,
    coverTheme: 'burgundy',
    coverMotif: 'banyan',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-story-12',
    title: 'The Quantum Postmaster',
    subtitle: 'Witty Sci-Fi Fables About Entanglement, Time Loops, and Bureaucracy',
    author: 'Kabir Chatterjee',
    category: 'Stories & Literature',
    subcategory: 'Sci-Fi & Speculative',
    priceInr: 519,
    ebookPriceInr: 269,
    format: 'Both',
    stock: 28,
    description:
      'What happens when a small hill-station post office accidentally receives a quantum-entangled sorting machine that delivers letters written tomorrow? A humorous literary delight.',
    previewExcerpt:
      'Postmaster Kulkarni strictly forbade opening tomorrow’s postcards before 4:00 PM, lest the sender change their mind and cause a causal paradox in the tea stall...',
    tableOfContents: [
      '01. Registered Mail from Next Wednesday',
      '02. Schrödinger’s Parcel Inspection',
      '03. The Entropy Tax Collector',
      '04. Superposition at the Railway Crossing',
      '05. Return to Sender',
    ],
    isbn: '978-81-948210-5-2',
    pages: 288,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'teal',
    coverMotif: 'constellation',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-story-13',
    title: 'The Library of Lost Algorithms',
    subtitle: 'A Philosophical Novel of Memory, Order, and Human Choice',
    author: 'Arjun Sengupta',
    category: 'Stories & Literature',
    subcategory: 'Mystery & Adventure',
    priceInr: 589,
    ebookPriceInr: 319,
    format: 'Both',
    stock: 19,
    description:
      'In a subterranean archive beneath an old university town, scholars preserve heuristics and algorithms that humanity abandoned—until one forgotten method is needed again.',
    previewExcerpt:
      'In Hall Four stood the mechanical differential analyzers of the 1930s, their brass gear trains still oiled and waiting for an differential equation...',
    tableOfContents: [
      '01. The Subterranean Stacks',
      '02. The Catalog of Abandoned Heuristics',
      '03. Brass Gears and Paper Tape',
      '04. The Heuristic of Kindness',
      '05. Opening the Vault',
    ],
    isbn: '978-81-948210-5-3',
    pages: 372,
    language: 'English',
    publishYear: 2025,
    coverTheme: 'slate',
    coverMotif: 'scroll',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-story-14',
    title: 'Voices from the Himalayas',
    subtitle: 'Mountain Stories of Solitude, Ecology, and Quiet Perseverance',
    author: 'Tenzin Norbu',
    category: 'Stories & Literature',
    subcategory: 'Contemporary Fiction',
    priceInr: 489,
    ebookPriceInr: 259,
    format: 'Both',
    stock: 33,
    description:
      'Set across Spiti, Ladakh, and Garhwal, these luminous stories follow glaciologists, solar-microgrid engineers, and orchard keepers living in harmony with high altitudes.',
    previewExcerpt:
      'At four thousand meters, when the solar batteries finished charging the village school’s Raspberry Pi server, the children gathered to read encyclopedias by warm LED light...',
    tableOfContents: [
      '01. The Ice Stupa of Phyang',
      '02. Solar Panels on the Monastery Roof',
      '03. The Apricot Harvest of Haldighati',
      '04. Footprints of the Snow Leopard',
      '05. Spring Melt',
    ],
    isbn: '978-81-948210-5-4',
    pages: 310,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'navy',
    coverMotif: 'compass',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-story-15',
    title: 'The Chess Player of Lucknow',
    subtitle: 'Stories of Strategy, Patience, and Grace Under Pressure',
    author: 'Mirzafar Ali',
    category: 'Stories & Literature',
    subcategory: 'Historical Fiction',
    priceInr: 459,
    ebookPriceInr: 239,
    format: 'Both',
    stock: 25,
    description:
      'From 19th-century Shatranj salons in Lucknow to modern youth chess tournaments in Chennai, these linked stories explore how the 64 squares mirror human character.',
    previewExcerpt:
      'Grandmaster Viswanath always told his students: "Never play the board in anger; play the quietest move that improves your worst-placed piece"...',
    tableOfContents: [
      '01. The Carved Ivory Knight',
      '02. Zugzwang in the Monsoon',
      '03. The Chennai Suburban Train Club',
      '04. Endgame with Pawn and King',
      '05. The Handshake',
    ],
    isbn: '978-81-948210-5-5',
    pages: 280,
    language: 'English',
    publishYear: 2025,
    coverTheme: 'gold',
    coverMotif: 'compass',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-story-16',
    title: 'Letters to a Young Builder',
    subtitle: 'Twenty Epistolary Essays on Curiosity, Integrity, and Craftsmanship',
    author: 'Satya Narayana',
    category: 'Stories & Literature',
    subcategory: 'Inspirational Fiction',
    priceInr: 419,
    ebookPriceInr: 199,
    format: 'Both',
    stock: 72,
    description:
      'Written as warm, candid letters from a senior mentor to a first-generation college student entering the world of technology, literature, and ethical leadership.',
    previewExcerpt:
      'Dear Aarav, Do not rush to memorize frameworks that will change in three years. Learn how to read deeply, write clearly, and debug patiently...',
    tableOfContents: [
      '01. On the Courage to Be a Beginner',
      '02. Why Engineers Should Read Literature',
      '03. Building Things That Last',
      '04. Navigating Imposter Syndrome with Grace',
      '05. Teaching What You Learn',
    ],
    isbn: '978-81-948210-5-6',
    pages: 240,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'ivory',
    coverMotif: 'scroll',
    bestseller: true,
    archived: false,
  },
  {
    id: 'book-story-17',
    title: 'The Botanist’s Sketchbook',
    subtitle: 'Illustrated Stories of Sacred Groves, Medicinal Plants, and Biodiversity',
    author: 'Dr. Kavitha Madhavan',
    category: 'Stories & Literature',
    subcategory: 'Biographical Stories',
    priceInr: 559,
    ebookPriceInr: 299,
    format: 'Both',
    stock: 21,
    description:
      'Travel through the Western Ghats and Malabar coast through the field journals of botanical illustrators and indigenous forest guardians across three centuries.',
    previewExcerpt:
      'In the sacred grove of Kasaragod, not a single fallen twig had been disturbed for four hundred years, allowing rare mycorrhizal networks to flourish...',
    tableOfContents: [
      '01. The Hortus Malabaricus Artisans',
      '02. The Sacred Grove of Theyyam',
      '03. Neem, Turmeric, and Rain',
      '04. The Seed Bank in the Hills',
      '05. Field Notes on Wonder',
    ],
    isbn: '978-81-948210-5-7',
    pages: 320,
    language: 'English',
    publishYear: 2025,
    coverTheme: 'teal',
    coverMotif: 'banyan',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-story-18',
    title: 'Orbiting Saraswati',
    subtitle: 'Stories of Women Scientists, Mission Controllers, and Stargazers',
    author: 'Nandini Rao',
    category: 'Stories & Literature',
    subcategory: 'Inspirational Fiction',
    priceInr: 539,
    ebookPriceInr: 279,
    format: 'Both',
    stock: 39,
    description:
      'Inspired by India’s interplanetary space missions, these uplifting stories follow orbital mechanics engineers, telemetry programmers, and village schoolgirls building cubesats.',
    previewExcerpt:
      'With a fuel budget smaller than a Hollywood film, the orbital insertion burn around Mars required trajectory calculations accurate to a fraction of a degree...',
    tableOfContents: [
      '01. Jasmine Flowers in the Telemetry Room',
      '02. The Hohmann Transfer Orbit',
      '03. Building a CubeSat in Tirupati',
      '04. Signal Acquisition from Mangalyaan',
      '05. Looking Up from the Terrace',
    ],
    isbn: '978-81-948210-5-8',
    pages: 308,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'navy',
    coverMotif: 'constellation',
    bestseller: true,
    archived: false,
  },
  {
    id: 'book-story-19',
    title: 'The Typographer of Calcutta',
    subtitle: 'A Novel of Printing Presses, Bengalee Typefoundries, and Literary Awakening',
    author: 'Soumitra Roy',
    category: 'Stories & Literature',
    subcategory: 'Historical Fiction',
    priceInr: 569,
    ebookPriceInr: 299,
    format: 'E-Book',
    stock: 0,
    description:
      'Set in 19th-century Battala and College Street, this vivid historical novel tells the story of punchcutters and printers who democratized books and education.',
    previewExcerpt:
      'Carving a steel punch for a conjunct Bengali letterform required a magnifying glass, a steady breath, and a love for the written word that bordered on devotion...',
    tableOfContents: [
      '01. Lead, Antimony, and Tin',
      '02. The Ink Makers of Serampore',
      '03. College Street Bookstalls',
      '04. The First Primer (Barnaparichay)',
      '05. Impressions on Paper',
    ],
    isbn: '978-81-948210-5-9',
    pages: 356,
    language: 'English',
    publishYear: 2025,
    coverTheme: 'burgundy',
    coverMotif: 'scroll',
    bestseller: false,
    archived: false,
  },
  {
    id: 'book-story-20',
    title: 'Stories for the Curious Mind: Complete Omnibus',
    subtitle: 'Fifty Short Tales Blending Science, Folklore, Ethics, and Imagination',
    author: 'Satya Narayana & Guest Authors',
    category: 'Stories & Literature',
    subcategory: 'Wisdom & Fables',
    priceInr: 699,
    ebookPriceInr: 379,
    format: 'Both',
    stock: 45,
    description:
      'Our flagship literary anthology bringing together fifty beloved short stories for students, parents, and lifelong learners—where scientific curiosity meets timeless storytelling.',
    previewExcerpt:
      'Whether we write a poem or a computer program, we are engaged in the same ancient human act: giving clear form to thought so that another mind may understand...',
    tableOfContents: [
      '01. Part I: Tales of Observation & Logic',
      '02. Part II: Pioneers of the Indian Subcontinent',
      '03. Part III: Fables of the Digital Age',
      '04. Part IV: Rivers, Forests, and Stars',
      '05. Part V: Discussion Questions for Study Circles',
    ],
    isbn: '978-81-948210-6-0',
    pages: 480,
    language: 'English',
    publishYear: 2026,
    coverTheme: 'gold',
    coverMotif: 'banyan',
    bestseller: true,
    archived: false,
  },
];

// ==================== 8 FLAGSHIP COURSES WITH RECORDED CLASSES ====================
export const INITIAL_COURSES: CourseItem[] = [
  {
    id: 'course-python-mastery',
    title: 'Python Engineering from Foundations to Async Systems',
    subtitle: 'Master modern Python 3.13, data structures, OOP protocols, testing, and concurrent pipelines.',
    instructor: 'Satya Narayana',
    instructorRole: 'Principal Systems Architect & Educator',
    subject: 'Python',
    level: 'Beginner',
    priceInr: 2499,
    language: 'English',
    duration: '22h 40m',
    totalLessons: 4,
    description:
      'Designed for both ambitious beginners and working developers, this course takes you from clean Pythonic fundamentals all the way to memory-efficient generators, type annotations, pytest suites, and asyncio task orchestration.',
    outcomes: [
      'Write clean, idiomatic Python using list/dict comprehensions, generators, and context managers.',
      'Model complex domains with dataclasses, Protocols, and strict mypy/pyright type checking.',
      'Build high-throughput concurrent data fetchers and file processors using asyncio TaskGroups.',
      'Structure, test, and package production Python CLI and backend applications.',
    ],
    prerequisites: [
      'Basic familiarity with using a computer and text editor; no prior Python experience required.',
    ],
    featured: true,
    archived: false,
    accentTheme: 'navy',
    modules: [
      {
        id: 'mod-py-1',
        title: 'Module 1: The Python Mental Model & Memory Semantics',
        description: 'Understand how CPython manages names, references, mutability, and iteration protocols.',
        lessons: [
          {
            id: 'les-py-101',
            courseId: 'course-python-mastery',
            moduleId: 'mod-py-1',
            title: '01. Names, Objects, and Mutability Under the Hood',
            durationMinutes: 18,
            durationSeconds: 180,
            isFreePreview: true,
            summary:
              'Explore why Python variables are labels bound to heap objects rather than memory boxes, and how to avoid mutable default argument pitfalls.',
            keyTakeaways: [
              'Variables in Python are object references, not typed memory slots.',
              'Never use mutable defaults like def add_item(item, bucket=[]): in function signatures.',
              'Use id(), is, and == deliberately to distinguish identity from value equality.',
            ],
            codeSnippet: `from typing import Optional

def append_audit_event(event: str, log: Optional[list[str]] = None) -> list[str]:
    # Safe initialization pattern avoiding shared mutable default state
    active_log = [] if log is None else list(log)
    active_log.append(event.strip())
    return active_log

if __name__ == "__main__":
    session_a = append_audit_event("USER_LOGIN")
    session_b = append_audit_event("COURSE_ENROLLED")
    print(f"Session A: {session_a} | Session B: {session_b}")`,
            slides: [
              {
                timestampSeconds: 0,
                heading: 'Variables Are Labels, Not Boxes',
                bulletPoints: [
                  'In CPython, every value is a PyObject struct on the heap with a reference count.',
                  'Assignment binds a symbolic name to a memory reference.',
                  'Understanding reference aliasing prevents subtle state mutation bugs.',
                ],
                codeHighlight: 'x = [10, 20, 30]\ny = x  # Both names point to the exact same list object',
              },
              {
                timestampSeconds: 60,
                heading: 'The Mutable Default Trap',
                bulletPoints: [
                  'Default parameter values are evaluated ONCE when def is executed at import time.',
                  'Always use None as the sentinel default and instantiate inside the function body.',
                ],
                codeHighlight: 'def add_Order(item: str, items: list[str] | None = None):',
              },
              {
                timestampSeconds: 120,
                heading: 'Identity (is) vs Equality (==)',
                bulletPoints: [
                  'Use "is None" and "is not None" for singleton checks.',
                  'Use "==" to invoke __eq__ for structural value comparison.',
                ],
                codeHighlight: 'if current_user is not None and current_user.role == "student":',
              },
            ],
            captions: [
              { startSeconds: 0, endSeconds: 45, text: 'Welcome to Satya’s Education. In this first lesson, we examine how Python binds names to objects in memory.' },
              { startSeconds: 45, endSeconds: 95, text: 'Notice that default arguments in Python functions are evaluated once when the function is defined—never on every call.' },
              { startSeconds: 95, endSeconds: 145, text: 'By using None as a sentinel and creating a fresh list inside the function, we guarantee isolation across requests.' },
              { startSeconds: 145, endSeconds: 180, text: 'Practice this pattern in the attached workbook before moving to Lesson 2 on Generators and Lazy Iteration.' },
            ],
            resources: [
              {
                id: 'res-py-101-notes',
                title: 'Python Memory Model & Mutability Cheat Sheet.md',
                type: 'pdf_notes',
                sizeLabel: '42 KB',
                content: `# Python Memory Model & Mutability — Satya's Education\n\n## Key Rules\n1. Names refer to objects. Assignment never copies data implicitly.\n2. Immutable types: \`int\`, \`float\`, \`str\`, \`tuple\`, \`frozenset\`.\n3. Mutable types: \`list\`, \`dict\`, \`set\`, \`bytearray\`.\n4. Always use \`None\` as the default parameter when accepting mutable collections.`,
              },
            ],
          },
          {
            id: 'les-py-102',
            courseId: 'course-python-mastery',
            moduleId: 'mod-py-1',
            title: '02. Generators, Iterators, and Constant-Memory Streams',
            durationMinutes: 24,
            durationSeconds: 180,
            isFreePreview: false,
            summary:
              'Process multi-gigabyte log files and database streams using lazy generator pipelines with O(1) memory overhead.',
            keyTakeaways: [
              'The Iterator Protocol requires __iter__ and __next__.',
              'Generator functions using yield pause execution and preserve local frame state.',
              'Chain generator expressions for zero-intermediate-list data pipelines.',
            ],
            codeSnippet: `from typing import Iterator

def stream_large_transactions(lines: Iterable[str], min_inr: int) -> Iterator[dict]:
    for raw_line in lines:
        parts = raw_line.strip().split(",")
        if len(parts) == 3 and int(parts[2]) >= min_inr:
            yield {"order_id": parts[0], "user": parts[1], "amount_inr": int(parts[2])}`,
            slides: [
              {
                timestampSeconds: 0,
                heading: 'Why Eager Lists Fail at Scale',
                bulletPoints: [
                  'Loading 10 million rows into a list allocates gigabytes of RAM.',
                  'Lazy iterators compute one item at a time on demand.',
                ],
                codeHighlight: 'valid_rows = (parse(line) for line in file_stream if is_valid(line))',
              },
              {
                timestampSeconds: 90,
                heading: 'State Suspension with yield',
                bulletPoints: [
                  'When a function contains yield, calling it returns a generator object.',
                  'Local variables remain alive between next() invocations.',
                ],
                codeHighlight: 'yield {"order_id": order_id, "amount_inr": amount}',
              },
            ],
            captions: [
              { startSeconds: 0, endSeconds: 60, text: 'In Lesson 2, we replace memory-heavy list accumulations with constant-memory generator pipelines.' },
              { startSeconds: 60, endSeconds: 120, text: 'Each yield statement pauses the function frame and hands a single record downstream.' },
              { startSeconds: 120, endSeconds: 180, text: 'This exact pattern powers streaming responses in Django and AI token streaming.' },
            ],
            resources: [
              {
                id: 'res-py-102-code',
                title: 'Lazy Pipeline Exercises & Benchmarks.py',
                type: 'code_archive',
                sizeLabel: '28 KB',
                content: `# Generator Pipeline Benchmark\nimport sys\n\neager = [x * x for x in range(100_000)]\nlazy = (x * x for x in range(100_000))\nprint("Eager bytes:", sys.getsizeof(eager))\nprint("Lazy bytes:", sys.getsizeof(lazy))`,
              },
            ],
          },
        ],
      },
      {
        id: 'mod-py-2',
        title: 'Module 2: Structured Concurrency & Production Packaging',
        description: 'Write resilient async code with TaskGroups, timeouts, and comprehensive pytest suites.',
        lessons: [
          {
            id: 'les-py-201',
            courseId: 'course-python-mastery',
            moduleId: 'mod-py-2',
            title: '03. AsyncIO TaskGroups and Graceful Cancellation',
            durationMinutes: 28,
            durationSeconds: 180,
            isFreePreview: false,
            summary:
              'Coordinate concurrent network calls safely using Python 3.11+ asyncio.TaskGroup and timeout context managers.',
            keyTakeaways: [
              'Prefer asyncio.TaskGroup() over raw asyncio.gather() for automatic sibling cancellation on error.',
              'Never call blocking time.sleep() or synchronous requests inside an async coroutine.',
            ],
            codeSnippet: `import asyncio

async def fetch_course_progress(course_id: str) -> dict:
    await asyncio.sleep(0.05)
    return {"course_id": course_id, "completed_pct": 85}

async def load_student_dashboard(course_ids: list[str]) -> list[dict]:
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(fetch_course_progress(cid)) for cid in course_ids]
    return [t.result() for t in tasks]`,
            slides: [
              {
                timestampSeconds: 0,
                heading: 'Structured Concurrency in Python',
                bulletPoints: [
                  'Orphaned background tasks cause memory leaks and unhandled exceptions.',
                  'asyncio.TaskGroup guarantees all spawned tasks complete before exiting the async with block.',
                ],
                codeHighlight: 'async with asyncio.TaskGroup() as tg:',
              },
            ],
            captions: [
              { startSeconds: 0, endSeconds: 90, text: 'Structured concurrency ensures that concurrent tasks have a clear lexical lifetime.' },
              { startSeconds: 90, endSeconds: 180, text: 'If one task inside a TaskGroup raises an exception, sibling tasks are cleanly cancelled.' },
            ],
            resources: [],
          },
          {
            id: 'les-py-202',
            courseId: 'course-python-mastery',
            moduleId: 'mod-py-2',
            title: '04. Type-Safe Domain Modeling with Dataclasses & Protocols',
            durationMinutes: 22,
            durationSeconds: 180,
            isFreePreview: false,
            summary:
              'Use frozen dataclasses, structural Protocols, and runtime validation to build self-documenting Python architectures.',
            keyTakeaways: [
              'Use @dataclass(frozen=True, slots=True) for immutable value objects with low memory footprint.',
              'Use typing.Protocol for structural subtyping (static duck typing) without rigid inheritance hierarchies.',
            ],
            codeSnippet: `from dataclasses import dataclass
from typing import Protocol

class PaymentGateway(Protocol):
    def verify_signature(self, order_id: str, payment_id: str, sig: str) -> bool: ...

@dataclass(frozen=True, slots=True)
class VerifiedOrder:
    order_id: str
    user_id: str
    amount_inr: int`,
            slides: [
              {
                timestampSeconds: 0,
                heading: 'Protocols & Immutable Value Objects',
                bulletPoints: [
                  'slots=True eliminates per-instance __dict__ overhead.',
                  'Protocols decouple domain logic from third-party SDK implementations.',
                ],
                codeHighlight: '@dataclass(frozen=True, slots=True)',
              },
            ],
            captions: [
              { startSeconds: 0, endSeconds: 180, text: 'Combining frozen dataclasses with typing.Protocol gives Python the clarity of static architecture.' },
            ],
            resources: [],
          },
        ],
      },
    ],
  },
  {
    id: 'course-django-react-fullstack',
    title: 'Full-Stack Production Engineering with Django 5 & React 19',
    subtitle: 'Architect secure e-commerce & EdTech platforms with Django REST, PostgreSQL, React, and Razorpay.',
    instructor: 'Satya Narayana',
    instructorRole: 'Principal Systems Architect & Educator',
    subject: 'Django',
    level: 'Intermediate',
    priceInr: 3499,
    language: 'English',
    duration: '28h 15m',
    totalLessons: 3,
    description:
      'Build end-to-end web applications uniting Django’s battle-tested ORM, migrations, and security layer with a responsive React + TypeScript frontend. Covers token authentication, Razorpay webhook idempotency, and query optimization.',
    outcomes: [
      'Design normalized PostgreSQL schemas and eliminate N+1 bottlenecks with select_related and prefetch_related.',
      'Implement RBAC permissions, CSRF/CORS protection, and Firebase/JWT token verification in Django.',
      'Build idempotent payment order creation and HMAC webhook verification for Razorpay in INR.',
      'Connect React 19 frontends with optimistic updates, error boundaries, and clean API contracts.',
    ],
    prerequisites: [
      'Working knowledge of Python fundamentals and basic HTML/JavaScript.',
    ],
    featured: true,
    archived: false,
    accentTheme: 'teal',
    modules: [
      {
        id: 'mod-dj-1',
        title: 'Module 1: Django ORM Mastery & Transactional Integrity',
        description: 'Write high-performance database queries and atomic financial transactions.',
        lessons: [
          {
            id: 'les-dj-101',
            courseId: 'course-django-react-fullstack',
            moduleId: 'mod-dj-1',
            title: '01. Eliminating N+1 Queries & Atomic Order Fulfillment',
            durationMinutes: 25,
            durationSeconds: 180,
            isFreePreview: true,
            summary:
              'See how Django evaluates QuerySets lazily and how to wrap payment fulfillment in transaction.atomic() with select_for_update().',
            keyTakeaways: [
              'Use select_related for ForeignKey/OneToOne joins and prefetch_related for ManyToMany relations.',
              'Always wrap inventory deduction and enrollment creation in transaction.atomic().',
              'Use select_for_update() to prevent race conditions on physical book stock.',
            ],
            codeSnippet: `from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Book, Order, Enrollment

@transaction.atomic
def fulfill_paid_order(order_id: str, razorpay_payment_id: str) -> Order:
    order = Order.objects.select_for_update().get(id=order_id)
    if order.status == "paid":
        return order  # Idempotent guard: already fulfilled!
    order.status = "paid"
    order.payment_id = razorpay_payment_id
    order.save(update_fields=["status", "payment_id", "updated_at"])
    return order`,
            slides: [
              {
                timestampSeconds: 0,
                heading: 'Idempotent Order Fulfillment in Django',
                bulletPoints: [
                  'Payment webhooks can arrive multiple times due to network retries.',
                  'select_for_update() acquires a row-level lock inside transaction.atomic().',
                  'Checking if order.status == "paid" prevents duplicate stock deductions.',
                ],
                codeHighlight: 'order = Order.objects.select_for_update().get(id=order_id)',
              },
              {
                timestampSeconds: 90,
                heading: 'QuerySet Optimization Checklist',
                bulletPoints: [
                  'select_related("instructor") performs a single SQL INNER/LEFT JOIN.',
                  'prefetch_related("modules__lessons") executes a separate IN query and joins in Python.',
                ],
                codeHighlight: 'Course.objects.select_related("instructor").prefetch_related("modules__lessons")',
              },
            ],
            captions: [
              { startSeconds: 0, endSeconds: 60, text: 'In production e-commerce, payment verification must be atomic and strictly idempotent.' },
              { startSeconds: 60, endSeconds: 120, text: 'Here we lock the order row using select_for_update inside a Django atomic transaction block.' },
              { startSeconds: 120, endSeconds: 180, text: 'If Razorpay sends both a client callback and a webhook, the second call safely returns without duplicating enrollments.' },
            ],
            resources: [
              {
                id: 'res-dj-101-arch',
                title: 'Django + React + Razorpay Architecture Blueprint.md',
                type: 'architecture_sheet',
                sizeLabel: '56 KB',
                content: `# Full-Stack Django & React Architecture\n\n1. **Client (React + TypeScript)**: Renders catalog, cart, and invokes \`POST /api/payments/create-order\`.\n2. **Server (Django REST / Express)**: Computes cart totals from canonical DB prices, creates Razorpay order in paise (\`amount_inr * 100\`).\n3. **Verification**: Validates \`HMAC-SHA256(order_id + "|" + payment_id, secret)\` before granting course or e-book access.`,
              },
            ],
          },
          {
            id: 'les-dj-102',
            courseId: 'course-django-react-fullstack',
            moduleId: 'mod-dj-1',
            title: '02. Signed Media URLs & Protected Content Delivery',
            durationMinutes: 20,
            durationSeconds: 180,
            isFreePreview: false,
            summary:
              'Protect paid recorded classes and downloadable e-books so unpurchased files are never exposed via public URLs.',
            keyTakeaways: [
              'Never store paid e-books or lecture videos in public static buckets.',
              'Verify Enrollment existence on the backend before issuing a short-lived signed URL.',
            ],
            codeSnippet: `def get_protected_ebook_url(user, book_id: str) -> str:
    has_access = Enrollment.objects.filter(
        user=user, item_id=book_id, item_type="ebook"
    ).exists()
    if not has_access and not user.is_staff:
        raise PermissionDenied("Purchase required to access this e-book.")
    return generate_v4_signed_storage_url(f"protected/ebooks/{book_id}/book.pdf", expires_in=300)`,
            slides: [
              {
                timestampSeconds: 0,
                heading: 'Zero Public URLs for Paid Assets',
                bulletPoints: [
                  'Hiding a download button in React is not security.',
                  'Every media request must validate user enrollment on the server and storage layer.',
                ],
                codeHighlight: 'generate_v4_signed_storage_url(..., expires_in=300)',
              },
            ],
            captions: [
              { startSeconds: 0, endSeconds: 180, text: 'Never expose permanent URLs for paid videos or e-books. Always verify enrollment and issue short-lived signed tokens.' },
            ],
            resources: [],
          },
          {
            id: 'les-dj-103',
            courseId: 'course-django-react-fullstack',
            moduleId: 'mod-dj-1',
            title: '03. React + Django API Integration & Serializer Contracts',
            durationMinutes: 26,
            durationSeconds: 180,
            isFreePreview: false,
            summary:
              'Keep TypeScript interfaces and Django serializers synchronized with strict validation and predictable error envelopes.',
            keyTakeaways: [
              'Validate all incoming request payloads on the backend regardless of frontend form checks.',
              'Return structured field errors so React forms can highlight exact inputs.',
            ],
            codeSnippet: `class CreateOrderSerializer(serializers.Serializer):
    items = CartItemSerializer(many=True, allow_empty=False)
    coupon_code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    shipping_address = ShippingAddressSerializer(required=False)`,
            slides: [
              {
                timestampSeconds: 0,
                heading: 'Server-Authoritative Pricing',
                bulletPoints: [
                  'The client sends only item IDs, formats, and quantities.',
                  'The server looks up canonical INR prices and calculates discounts.',
                ],
                codeHighlight: 'unit_price = book.ebook_price_inr if fmt == "E-Book" else book.price_inr',
              },
            ],
            captions: [
              { startSeconds: 0, endSeconds: 180, text: 'Notice that the client never dictates item prices—the backend computes totals exclusively from catalog records.' },
            ],
            resources: [],
          },
        ],
      },
    ],
  },
  {
    id: 'course-react-architecture',
    title: 'React 19, TypeScript & Accessible Design Systems',
    subtitle: 'Build fast, keyboard-accessible, production-grade web applications with modern React.',
    instructor: 'Meera Krishnan',
    instructorRole: 'Staff Frontend Architect',
    subject: 'React',
    level: 'Intermediate',
    priceInr: 2799,
    language: 'English',
    duration: '19h 30m',
    totalLessons: 2,
    description:
      'Master component composition, custom hooks, performance profiling, WCAG AA accessibility, keyboard navigation, and state management in React 19 and TypeScript.',
    outcomes: [
      'Design composable React components with zero prop-drilling and strict TypeScript generics.',
      'Implement accessible dialogs, focus traps, ARIA live regions, and prefers-reduced-motion support.',
      'Optimize rendering performance and eliminate unnecessary re-renders.',
    ],
    prerequisites: ['Familiarity with JavaScript ES6+ and HTML/CSS fundamentals.'],
    featured: true,
    archived: false,
    accentTheme: 'gold',
    modules: [
      {
        id: 'mod-react-1',
        title: 'Module 1: Component Architecture & Accessibility Primitives',
        description: 'Build resilient UI primitives with full keyboard and screen-reader support.',
        lessons: [
          {
            id: 'les-react-101',
            courseId: 'course-react-architecture',
            moduleId: 'mod-react-1',
            title: '01. Designing State Machines for Complex UI Flows',
            durationMinutes: 21,
            durationSeconds: 180,
            isFreePreview: true,
            summary:
              'Replace tangled boolean flags (isLoading, isError, isSuccess) with discriminated union state machines in TypeScript.',
            keyTakeaways: [
              'Boolean flag explosion creates impossible UI states.',
              'Discriminated unions guarantee exhaustive rendering in TypeScript.',
            ],
            codeSnippet: `type CheckoutState =
  | { status: 'idle' }
  | { status: 'creating_order' }
  | { status: 'awaiting_payment'; razorpayOrderId: string }
  | { status: 'succeeded'; orderId: string }
  | { status: 'failed'; reason: string };`,
            slides: [
              {
                timestampSeconds: 0,
                heading: 'Eliminating Impossible States',
                bulletPoints: [
                  '4 boolean flags create 16 combinations, most of which are invalid.',
                  'A single status union allows only valid transitions.',
                ],
                codeHighlight: "type CheckoutState = { status: 'idle' } | { status: 'succeeded'; orderId: string }",
              },
            ],
            captions: [
              { startSeconds: 0, endSeconds: 180, text: 'By modeling checkout state as a discriminated union, TypeScript prevents us from ever rendering both a spinner and an error banner simultaneously.' },
            ],
            resources: [],
          },
          {
            id: 'les-react-102',
            courseId: 'course-react-architecture',
            moduleId: 'mod-react-1',
            title: '02. Keyboard Navigation, Focus Management & Reduced Motion',
            durationMinutes: 19,
            durationSeconds: 180,
            isFreePreview: false,
            summary:
              'Ensure every interactive drawer, video control, and form works seamlessly with keyboard-only navigation.',
            keyTakeaways: [
              'Always provide visible :focus-visible outlines with high contrast.',
              'Respect @media (prefers-reduced-motion: reduce) for vestibular accessibility.',
            ],
            codeSnippet: `useEffect(() => {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}, [onClose]);`,
            slides: [
              {
                timestampSeconds: 0,
                heading: 'Inclusive Interaction Design',
                bulletPoints: [
                  'Every control must be reachable via Tab and operable via Enter/Space.',
                  'Escape key should reliably dismiss modals and drawers.',
                ],
                codeHighlight: "if (e.key === 'Escape') onClose();",
              },
            ],
            captions: [
              { startSeconds: 0, endSeconds: 180, text: 'Accessibility is not an afterthought; it is the foundation of high-craft user interfaces.' },
            ],
            resources: [],
          },
        ],
      },
    ],
  },
  {
    id: 'course-sql-database-engineering',
    title: 'Production SQL & PostgreSQL Performance Engineering',
    subtitle: 'Write analytical queries, optimize B-Tree/GIN indexes, and design high-concurrency schemas.',
    instructor: 'Vikramaditya Sen',
    instructorRole: 'Principal Database Architect',
    subject: 'SQL',
    level: 'Intermediate',
    priceInr: 2299,
    language: 'English',
    duration: '16h 50m',
    totalLessons: 2,
    description:
      'Go from basic SELECT statements to mastering window functions, recursive CTEs, EXPLAIN ANALYZE query plans, MVCC locking, and zero-downtime schema migrations.',
    outcomes: [
      'Read EXPLAIN (ANALYZE, BUFFERS) output to turn 2-second sequential scans into 1ms index-only scans.',
      'Write complex financial reports and cohort retention queries with Window Functions and CTEs.',
      'Prevent race conditions and deadlocks using appropriate transaction isolation levels.',
    ],
    prerequisites: ['Basic familiarity with tables and simple SQL SELECT queries.'],
    featured: false,
    archived: false,
    accentTheme: 'slate',
    modules: [
      {
        id: 'mod-sql-1',
        title: 'Module 1: Indexing Internals & Analytical Window Functions',
        description: 'Understand how PostgreSQL executes queries and how to design composite indexes.',
        lessons: [
          {
            id: 'les-sql-101',
            courseId: 'course-sql-database-engineering',
            moduleId: 'mod-sql-1',
            title: '01. Composite B-Tree Indexes & Leftmost Prefix Rules',
            durationMinutes: 23,
            durationSeconds: 180,
            isFreePreview: true,
            summary:
              'Learn how column ordering in a multi-column index determines whether PostgreSQL can satisfy equality and range predicates.',
            keyTakeaways: [
              'Place equality columns first and range/sort columns second in composite indexes.',
              'Use INCLUDE columns to enable Index-Only Scans without heap fetches.',
            ],
            codeSnippet: `CREATE INDEX CONCURRENTLY idx_orders_user_created
ON orders (user_id, status, created_at DESC)
INCLUDE (total_inr);

EXPLAIN (ANALYZE, BUFFERS)
SELECT id, total_inr, created_at
FROM orders
WHERE user_id = 'usr_99' AND status = 'paid'
ORDER BY created_at DESC
LIMIT 20;`,
            slides: [
              {
                timestampSeconds: 0,
                heading: 'Designing Covering Indexes',
                bulletPoints: [
                  'Equality predicates (user_id, status) narrow down the exact B-Tree leaf range.',
                  'created_at DESC satisfies the ORDER BY without an in-memory sort step.',
                ],
                codeHighlight: 'ON orders (user_id, status, created_at DESC) INCLUDE (total_inr)',
              },
            ],
            captions: [
              { startSeconds: 0, endSeconds: 180, text: 'When we align our composite index order with equality, sort, and covering columns, PostgreSQL satisfies the query directly from index pages.' },
            ],
            resources: [],
          },
          {
            id: 'les-sql-102',
            courseId: 'course-sql-database-engineering',
            moduleId: 'mod-sql-1',
            title: '02. Window Functions: PARTITION BY, LAG, and Rolling Totals',
            durationMinutes: 25,
            durationSeconds: 180,
            isFreePreview: false,
            summary:
              'Compute running revenue totals, student rank percentiles, and month-over-month growth in a single SQL pass.',
            keyTakeaways: [
              'Window functions compute aggregates across related rows without collapsing rows like GROUP BY.',
              'ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW defines a precise sliding frame.',
            ],
            codeSnippet: `SELECT
  course_id,
  enrolled_month,
  monthly_revenue_inr,
  SUM(monthly_revenue_inr) OVER (
    PARTITION BY course_id
    ORDER BY enrolled_month
  ) AS cumulative_revenue_inr
FROM course_monthly_sales;`,
            slides: [
              {
                timestampSeconds: 0,
                heading: 'Analytical Power Without Self-Joins',
                bulletPoints: [
                  'OVER (PARTITION BY ... ORDER BY ...) avoids expensive O(N^2) self-joins.',
                ],
                codeHighlight: 'SUM(monthly_revenue_inr) OVER (PARTITION BY course_id ORDER BY enrolled_month)',
              },
            ],
            captions: [
              { startSeconds: 0, endSeconds: 180, text: 'Window functions let your database engine perform analytical passes in milliseconds.' },
            ],
            resources: [],
          },
        ],
      },
    ],
  },
  {
    id: 'course-generative-ai-engineering',
    title: 'Generative AI Engineering: LLMs, RAG & Structured Outputs',
    subtitle: 'Build reliable, grounded AI applications using the Gemini API, embeddings, and evaluation pipelines.',
    instructor: 'Dr. Priya Nair & Satya Narayana',
    instructorRole: 'AI Research Lead & Principal Architect',
    subject: 'Generative AI',
    level: 'Intermediate',
    priceInr: 3999,
    language: 'English',
    duration: '24h 10m',
    totalLessons: 2,
    description:
      'Go beyond basic chat wrappers. Learn how to architect server-side Gemini API integrations, enforce strict JSON response schemas, build hybrid RAG search over technical books, and measure retrieval quality.',
    outcomes: [
      'Integrate @google/genai securely on the backend without exposing API keys to the browser.',
      'Use responseSchema and system instructions to guarantee deterministic structured outputs.',
      'Build hybrid semantic + keyword retrieval pipelines with citations.',
    ],
    prerequisites: ['Intermediate Python or TypeScript experience.'],
    featured: true,
    archived: false,
    accentTheme: 'navy',
    modules: [
      {
        id: 'mod-genai-1',
        title: 'Module 1: Server-Side LLM Architecture & Grounded Retrieval',
        description: 'Build production AI endpoints with schema enforcement and context grounding.',
        lessons: [
          {
            id: 'les-genai-101',
            courseId: 'course-generative-ai-engineering',
            moduleId: 'mod-genai-1',
            title: '01. Server-Side Gemini SDK & Deterministic JSON Schemas',
            durationMinutes: 22,
            durationSeconds: 180,
            isFreePreview: true,
            summary:
              'Learn why LLM calls belong on the server and how constrained decoding guarantees valid JSON responses.',
            keyTakeaways: [
              'Always invoke @google/genai from server routes (/api/*) to protect API credentials.',
              'Use Type.OBJECT and responseSchema so outputs conform strictly to your TypeScript types.',
            ],
            codeSnippet: `import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateStudyPlan(topic: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: \`Create a 3-step study plan for \${topic}\`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            stepNumber: { type: Type.INTEGER },
            focusArea: { type: Type.STRING },
            practiceTask: { type: Type.STRING }
          },
          required: ["stepNumber", "focusArea", "practiceTask"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
}`,
            slides: [
              {
                timestampSeconds: 0,
                heading: 'Constrained Decoding with responseSchema',
                bulletPoints: [
                  'Prompting "please output only JSON" is brittle and prone to markdown fences.',
                  'responseSchema constrains token sampling at the logit level to match your grammar.',
                ],
                codeHighlight: 'responseMimeType: "application/json", responseSchema: { ... }',
              },
            ],
            captions: [
              { startSeconds: 0, endSeconds: 180, text: 'With responseSchema in the @google/genai SDK, every model response is guaranteed to parse cleanly into your domain types.' },
            ],
            resources: [],
          },
          {
            id: 'les-genai-102',
            courseId: 'course-generative-ai-engineering',
            moduleId: 'mod-genai-1',
            title: '02. Hybrid RAG: Chunking, Embeddings & Citation Verification',
            durationMinutes: 27,
            durationSeconds: 180,
            isFreePreview: false,
            summary:
              'Combine semantic vector similarity with BM25 lexical matching to eliminate hallucinations over technical documentation.',
            keyTakeaways: [
              'Chunk documents along semantic section headers rather than arbitrary character counts.',
              'Require the model to cite exact source IDs from the retrieved context.',
            ],
            codeSnippet: `const systemPrompt = \`You are Satya's Education Study Assistant.
Answer strictly using the provided catalog context. Cite book or course titles explicitly.\`;`,
            slides: [
              {
                timestampSeconds: 0,
                heading: 'Context Grounding & Attribution',
                bulletPoints: [
                  'Dense embeddings capture conceptual similarity; lexical search captures exact identifiers.',
                ],
                codeHighlight: 'Reciprocal Rank Fusion (RRF) merges dense and sparse rankings.',
              },
            ],
            captions: [
              { startSeconds: 0, endSeconds: 180, text: 'Grounded retrieval transforms a general language model into a trustworthy domain tutor.' },
            ],
            resources: [],
          },
        ],
      },
    ],
  },
  {
    id: 'course-agentic-ai-systems',
    title: 'Agentic AI Systems: Function Calling, Planning & Multi-Agent Workflows',
    subtitle: 'Architect autonomous AI agents with deterministic tool boundaries, memory, and human-in-the-loop safety.',
    instructor: 'Satya Narayana',
    instructorRole: 'Principal Systems Architect & Educator',
    subject: 'Agentic AI',
    level: 'Advanced',
    priceInr: 4499,
    language: 'English',
    duration: '26h 00m',
    totalLessons: 2,
    description:
      'Learn how to build production AI agents that reason step-by-step, invoke typed backend tools, verify their own intermediate outputs, and pause for human approval before executing high-stakes actions.',
    outcomes: [
      'Design FunctionDeclaration schemas that guide reliable tool invocation.',
      'Build ReAct (Reason + Act) loops with maximum step budgets and error recovery.',
      'Implement human-in-the-loop confirmation gates and audit logs.',
    ],
    prerequisites: ['Experience with Python or TypeScript and basic LLM API usage.'],
    featured: true,
    archived: false,
    accentTheme: 'gold',
    modules: [
      {
        id: 'mod-agent-1',
        title: 'Module 1: Tool-Using Agents & Bounded Execution Loops',
        description: 'Build deterministic function-calling loops and critic verifiers.',
        lessons: [
          {
            id: 'les-agent-101',
            courseId: 'course-agentic-ai-systems',
            moduleId: 'mod-agent-1',
            title: '01. Designing Resilient Function Calling Contracts',
            durationMinutes: 24,
            durationSeconds: 180,
            isFreePreview: true,
            summary:
              'Craft clear tool declarations and feed structured validation errors back to the agent so it can self-correct.',
            keyTakeaways: [
              'Tool parameter descriptions are prompts for the model’s reasoning engine.',
              'Always bound agent execution with a strict max_iterations guard.',
            ],
            codeSnippet: `import { FunctionDeclaration, Type } from "@google/genai";

export const searchCatalogTool: FunctionDeclaration = {
  name: "searchCatalog",
  description: "Search Satya's Education catalog for books or courses by subject and max price in INR.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      subject: { type: Type.STRING, description: "Topic e.g. Python, Django, Stories, SQL" },
      maxPriceInr: { type: Type.NUMBER, description: "Maximum price in INR" }
    },
    required: ["subject"]
  }
};`,
            slides: [
              {
                timestampSeconds: 0,
                heading: 'Anatomy of an Agentic Tool Loop',
                bulletPoints: [
                  '1. Observe user goal and available FunctionDeclarations.',
                  '2. Emit structured functionCall with typed arguments.',
                  '3. Execute tool in a sandboxed backend handler and return observation.',
                ],
                codeHighlight: 'const calls = response.functionCalls;',
              },
            ],
            captions: [
              { startSeconds: 0, endSeconds: 180, text: 'An agentic workflow succeeds when every tool has a narrow, well-typed contract and clear error feedback.' },
            ],
            resources: [],
          },
          {
            id: 'les-agent-102',
            courseId: 'course-agentic-ai-systems',
            moduleId: 'mod-agent-1',
            title: '02. Multi-Agent Critic Patterns & Guardrails',
            durationMinutes: 29,
            durationSeconds: 180,
            isFreePreview: false,
            summary:
              'Pair a generator agent with an independent verifier agent to validate code, SQL queries, and security invariants.',
            keyTakeaways: [
              'Separate generation from verification using distinct system instructions.',
              'Require explicit user confirmation before any state-mutating tool executes.',
            ],
            codeSnippet: `if (toolCall.name === "placeOrder" && !userConfirmed) {
  return { status: "REQUIRES_USER_CONFIRMATION", summary: toolCall.args };
}`,
            slides: [
              {
                timestampSeconds: 0,
                heading: 'Human-in-the-Loop Checkpoints',
                bulletPoints: [
                  'Read-only tools (search, summarize) can execute automatically.',
                  'Write tools (payments, deletions) must pause for explicit human approval.',
                ],
                codeHighlight: 'status: "REQUIRES_USER_CONFIRMATION"',
              },
            ],
            captions: [
              { startSeconds: 0, endSeconds: 180, text: 'Always distinguish read-only tools from state-mutating tools, and gate mutations behind human confirmation.' },
            ],
            resources: [],
          },
        ],
      },
    ],
  },
  {
    id: 'course-system-design',
    title: 'Distributed System Design & Scalable Backend Architecture',
    subtitle: 'Master caching, message queues, rate limiters, sharding, and high-availability system design.',
    instructor: 'Rohan Deshmukh',
    instructorRole: 'Staff Infrastructure Engineer',
    subject: 'System Design',
    level: 'Advanced',
    priceInr: 3299,
    language: 'English',
    duration: '20h 00m',
    totalLessons: 2,
    description:
      'Prepare for senior architectural decisions and system design interviews by dissecting real-world payment gateways, video streaming CDNs, and distributed rate limiters.',
    outcomes: [
      'Calculate back-of-the-envelope QPS, bandwidth, and storage requirements.',
      'Design idempotent payment pipelines and outbox event publishers.',
      'Trade off consistency, availability, and latency across multi-region deployments.',
    ],
    prerequisites: ['Working knowledge of web servers and relational databases.'],
    featured: false,
    archived: false,
    accentTheme: 'teal',
    modules: [
      {
        id: 'mod-sys-1',
        title: 'Module 1: Backpressure, Rate Limiting & Caching Strategies',
        description: 'Keep services resilient under sudden traffic spikes.',
        lessons: [
          {
            id: 'les-sys-101',
            courseId: 'course-system-design',
            moduleId: 'mod-sys-1',
            title: '01. Token Bucket Rate Limiting & Cache Stampede Prevention',
            durationMinutes: 24,
            durationSeconds: 180,
            isFreePreview: true,
            summary:
              'Prevent thundering herds on your database using single-flight request coalescing and jittered TTLs.',
            keyTakeaways: [
              'When a popular cache key expires, thousands of concurrent requests can hit the database simultaneously.',
              'Use probabilistic early expiration or single-flight locks to recompute cache keys once.',
            ],
            codeSnippet: `// Single-flight coalescing prevents cache stampedes
const inflightRequests = new Map<string, Promise<unknown>>();

export async function getOrCompute<T>(key: string, computeFn: () => Promise<T>): Promise<T> {
  if (inflightRequests.has(key)) {
    return inflightRequests.get(key) as Promise<T>;
  }
  const promise = computeFn().finally(() => inflightRequests.delete(key));
  inflightRequests.set(key, promise);
  return promise;
}`,
            slides: [
              {
                timestampSeconds: 0,
                heading: 'Defeating the Thundering Herd',
                bulletPoints: [
                  'Add random jitter to cache TTLs so batch-loaded keys do not expire at the same millisecond.',
                  'Coalesce concurrent cache misses with an in-flight promise map.',
                ],
                codeHighlight: 'if (inflightRequests.has(key)) return inflightRequests.get(key);',
              },
            ],
            captions: [
              { startSeconds: 0, endSeconds: 180, text: 'Ten lines of single-flight request coalescing can save a database from collapsing during a flash traffic spike.' },
            ],
            resources: [],
          },
          {
            id: 'les-sys-102',
            courseId: 'course-system-design',
            moduleId: 'mod-sys-1',
            title: '02. Transactional Outbox Pattern for Reliable Webhooks',
            durationMinutes: 22,
            durationSeconds: 180,
            isFreePreview: false,
            summary:
              'Guarantee that database commits and downstream event notifications never fall out of sync.',
            keyTakeaways: [
              'Dual writes to a database and a message broker are vulnerable to partial failure.',
              'Write the event to an outbox table in the same ACID transaction, then relay asynchronously.',
            ],
            codeSnippet: `INSERT INTO orders (id, status, total_inr) VALUES ('ord_1', 'paid', 2499);
INSERT INTO outbox_events (aggregate_id, event_type, payload)
VALUES ('ord_1', 'ORDER_PAID', '{"orderId": "ord_1"}');`,
            slides: [
              {
                timestampSeconds: 0,
                heading: 'Why Dual Writes Fail',
                bulletPoints: [
                  'If the DB commits and the process crashes before publishing to Kafka/RabbitMQ, the event is lost.',
                  'The Transactional Outbox solves this with single-database atomicity.',
                ],
                codeHighlight: 'INSERT INTO outbox_events ...',
              },
            ],
            captions: [
              { startSeconds: 0, endSeconds: 180, text: 'The transactional outbox pattern is the cornerstone of reliable microservice communication.' },
            ],
            resources: [],
          },
        ],
      },
    ],
  },
  {
    id: 'course-algorithms-data-structures',
    title: 'Algorithmic Thinking & Data Structures in Python',
    subtitle: 'Visual, intuitive mastery of trees, graphs, dynamic programming, and problem-solving patterns.',
    instructor: 'Prof. K. Subramanian',
    instructorRole: 'Visiting Professor of Computer Science',
    subject: 'Algorithms',
    level: 'Beginner',
    priceInr: 1999,
    language: 'English',
    duration: '18h 20m',
    totalLessons: 2,
    description:
      'Build deep intuition for data structures and algorithms through visual invariants, real-world engineering examples, and clean Python implementations.',
    outcomes: [
      'Select the optimal data structure (hash map, heap, deque, trie, graph) for any workload.',
      'Master sliding window, two pointers, monotonic stack, and BFS/DFS graph traversal.',
      'Transition from brute-force recursion to memoization and bottom-up dynamic programming.',
    ],
    prerequisites: ['Basic programming knowledge in Python or any language.'],
    featured: false,
    archived: false,
    accentTheme: 'slate',
    modules: [
      {
        id: 'mod-algo-1',
        title: 'Module 1: Graph Traversals & Shortest Path Invariants',
        description: 'Model networks, dependencies, and state spaces as graphs.',
        lessons: [
          {
            id: 'les-algo-101',
            courseId: 'course-algorithms-data-structures',
            moduleId: 'mod-algo-1',
            title: '01. Breadth-First Search & Dijkstra with Priority Queues',
            durationMinutes: 21,
            durationSeconds: 180,
            isFreePreview: true,
            summary:
              'Understand why a FIFO deque finds shortest unweighted paths while a min-heap (heapq) solves weighted non-negative graphs.',
            keyTakeaways: [
              'Always use collections.deque for O(1) popleft() in Python—never list.pop(0) which is O(N).',
              'Dijkstra’s greedy invariant holds when edge weights are non-negative.',
            ],
            codeSnippet: `import heapq

def shortest_delivery_time(graph: dict[str, list[tuple[str, int]]], start: str) -> dict[str, int]:
    dist = {start: 0}
    pq: list[tuple[int, str]] = [(0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist.get(u, float("inf")):
            continue
        for v, weight in graph.get(u, []):
            if d + weight < dist.get(v, float("inf")):
                dist[v] = d + weight
                heapq.heappush(pq, (dist[v], v))
    return dist`,
            slides: [
              {
                timestampSeconds: 0,
                heading: 'Deque vs Min-Heap Traversal',
                bulletPoints: [
                  'list.pop(0) shifts all remaining elements in O(N) time.',
                  'collections.deque is a doubly-linked block list with O(1) operations at both ends.',
                ],
                codeHighlight: 'd, u = heapq.heappop(pq)',
              },
            ],
            captions: [
              { startSeconds: 0, endSeconds: 180, text: 'Choosing the right queue structure reduces graph traversal complexity from quadratic to near-linear time.' },
            ],
            resources: [],
          },
          {
            id: 'les-algo-102',
            courseId: 'course-algorithms-data-structures',
            moduleId: 'mod-algo-1',
            title: '02. Topological Sort & Dependency Resolution',
            durationMinutes: 19,
            durationSeconds: 180,
            isFreePreview: false,
            summary:
              'Use Kahn’s in-degree algorithm to order course prerequisites and detect circular dependencies.',
            keyTakeaways: [
              'A directed graph has a valid topological ordering if and only if it is acyclic (a DAG).',
              'Kahn’s algorithm iteratively peels off nodes with in-degree 0.',
            ],
            codeSnippet: `from collections import deque

def resolve_course_order(num_courses: int, prerequisites: list[tuple[int, int]]) -> list[int]:
    indegree = [0] * num_courses
    adj = [[] for _ in range(num_courses)]
    for dest, src in prerequisites:
        adj[src].append(dest)
        indegree[dest] += 1
    q = deque([i for i, d in enumerate(indegree) if d == 0])
    order = []
    while q:
        curr = q.popleft()
        order.append(curr)
        for nxt in adj[curr]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                q.append(nxt)
    return order if len(order) == num_courses else []`,
            slides: [
              {
                timestampSeconds: 0,
                heading: 'Detecting Cycles with Kahn’s Algorithm',
                bulletPoints: [
                  'If the resulting topological order has fewer nodes than the graph, a cycle exists.',
                ],
                codeHighlight: 'return order if len(order) == num_courses else []',
              },
            ],
            captions: [
              { startSeconds: 0, endSeconds: 180, text: 'Every package manager and build tool uses topological sorting to determine build order and catch circular imports.' },
            ],
            resources: [],
          },
        ],
      },
    ],
  },
];

export const SAMPLE_DEMO_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Aarav Kulkarni',
    role: 'Backend Developer, Pune (Sample Review)',
    program: 'Full-Stack Production Engineering with Django 5 & React 19',
    quote:
      'Before this course, I struggled with N+1 ORM queries and webhook race conditions. Working through the atomic transaction lessons and reading "Django 5 for High-Scale Web Systems" helped me cut our API latency in half.',
  },
  {
    id: 'rev-2',
    name: 'Divya Subramanian',
    role: 'Computer Science Undergraduate, Chennai (Sample Review)',
    program: 'Fluent Python Architecture & The Banyan Tree of Ujjain',
    quote:
      'I love how Satya’s Education pairs deep technical rigor with literature and stories. I bought the Python hardcover alongside two story anthologies—the e-book reader and recorded lesson player are a joy to use.',
  },
  {
    id: 'rev-3',
    name: 'Raghavendra Rao',
    role: 'Full-Stack Engineer, Hyderabad (Sample Review)',
    program: 'Agentic AI Systems: Function Calling, Planning & Multi-Agent Workflows',
    quote:
      'The recorded classes on deterministic JSON schemas and human-in-the-loop tool verification gave our team a clear blueprint for shipping a reliable internal AI assistant.',
  },
];

export const FAQ_ITEMS = [
  {
    question: 'How do recorded classes and free previews work?',
    answer:
      'Every course includes free preview lessons that you can watch immediately—complete with interactive code slides, playback speed controls, closed captions, and downloadable study notes. Enrolling in a course unlocks all modules, lessons, and progress syncing across devices.',
  },
  {
    question: 'What is the difference between Hardcover and E-Book formats?',
    answer:
      'E-Books are unlocked immediately in your Student Dashboard after verified payment, allowing you to read full chapters online or download study editions. Physical Hardcover books include free insured shipping across India on orders above ₹999 and only ask for a shipping address at checkout.',
  },
  {
    question: 'How are payments processed?',
    answer:
      'All prices are in Indian Rupees (INR). Orders are created and calculated on the server using Razorpay. When Razorpay live/test API credentials are configured on the server, standard Razorpay Checkout opens; in local evaluation without merchant keys, a clearly labelled Server-Verified Demo Checkout allows you to test the complete enrollment and fulfillment flow safely.',
  },
  {
    question: 'Can I switch devices and resume my recorded lessons?',
    answer:
      'Yes. When signed in with Google, your exact video playback timestamp, completed lessons, and personal study notes are automatically saved to Cloud Firestore.',
  },
];
