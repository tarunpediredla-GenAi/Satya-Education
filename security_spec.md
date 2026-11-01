# Security Specification — Satya's Education

## 1. Data Invariants
1. **Default Deny**: Any path not explicitly matched is rejected (`allow read, write: if false`).
2. **RBAC Integrity**: A standard student user can never self-assign `role: "admin"` during user profile creation or update. Only the verified bootstrapped administrator (`tarunpediredla9966@gmail.com` with `email_verified == true`) or a UID present in `/admins/{uid}` is recognized as an admin.
3. **PII Isolation**: `/users/{userId}` contains user email and profile info and is strictly readable only by `isOwner(userId)` or `isAdmin()`.
4. **Catalog Integrity**: `/books/{bookId}` and `/courses/{courseId}` are publicly readable for browsing, but strictly writable only by `isAdmin()`.
5. **Order & Enrollment Ownership**: `/orders/{orderId}` and `/enrollments/{enrollmentId}` can only be created for `request.auth.uid` (with `request.time` temporal validation) and listed/read only when `resource.data.userId == request.auth.uid || isAdmin()`.
6. **Learning Progress Ownership**: `/progress/{progressId}` is strictly scoped to `userId == request.auth.uid`.

## 2. The "Dirty Dozen" Payloads (Rejected with PERMISSION_DENIED)
1. **Privilege Escalation**: Student creates `/users/{uid}` with `{"role": "admin"}`.
2. **Shadow Field Injection**: Student updates `/users/{uid}` with `{"displayName": "Valid", "isAdmin": true}`.
3. **Unverified Admin Email Spoof**: User with `email == "tarunpediredla9966@gmail.com"` but `email_verified == false` attempts to write to `/books/b1`.
4. **Cross-User PII Read**: Authenticated student `user_A` attempts `get(/users/user_B)`.
5. **Blanket User List Scraping**: Authenticated student attempts `list(/users)`.
6. **Unauthorized Catalog Mutation**: Student attempts `update(/courses/c1)` to set `priceInr: 0`.
7. **ID Poisoning**: Attacker attempts `create` with a 500-character document ID containing special characters.
8. **Cross-User Order Spoofing**: Student `user_A` creates `/orders/ord_1` with `userId: "user_B"`.
9. **Timestamp Forgery**: Client sends a past/future `createdAt` instead of `request.time`.
10. **Order Tampering by Student**: Student attempts `update(/orders/ord_1)` to change `status` from `"pending"` to `"paid"`.
11. **Unauthorized Enrollment Creation**: Unauthenticated or unverified user attempts to create `/enrollments/enr_1`.
12. **Denial-of-Wallet Oversized Note**: Student attempts to write a 100KB string into `/progress/prog_1.notes` (exceeding max 4000 chars).
