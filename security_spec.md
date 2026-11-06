# Security Specification (`security_spec.md`) — مهام حسين علاء

## 1. Data Invariants
1. **Global Deny Default**: Every path not explicitly matched is denied (`allow read, write: if false;`).
2. **Verified Identity**: Every read and write requires an authenticated user with a verified email (`request.auth != null && request.auth.token.email_verified == true`).
3. **Strict Ownership (`ownerId`)**:
   - A `Task` document in `/tasks/{taskId}` can only be read, created, updated, or deleted if `ownerId == request.auth.uid`.
   - A `HundredDaysBoard` document in `/hundredDaysBoards/{boardId}` requires `boardId == request.auth.uid` and `ownerId == request.auth.uid`.
4. **Immutable Fields**: `id`, `ownerId`, and `createdAt` cannot be modified during updates.
5. **Temporal Integrity**: `createdAt` must equal `request.time` on `create`, and `updatedAt` must equal `request.time` on `create` and `update`.
6. **Strict Schema & Bounds**: Every string has `.size()` bounds and every list has `.size()` bounds. No shadow fields are permitted (`hasOnly`).

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Write**: Creating a task with `request.auth == null`.
2. **Unverified Email Spoof**: Creating a task where `request.auth.token.email_verified == false`.
3. **Identity Spoofing on Create**: Creating a task with `ownerId: "victim-uid"` when `request.auth.uid == "attacker-uid"`.
4. **Shadow Field Injection on Create**: Sending `isAdmin: true` in `/tasks/{taskId}` payload.
5. **Shadow Field Injection on Update**: Updating a task with an undeclared field `hacked: "yes"`.
6. **Owner Hijack on Update**: Changing `ownerId` during `update` on `/tasks/{taskId}`.
7. **CreatedAt Tampering on Update**: Modifying `createdAt` during an update.
8. **Forged Client Timestamp on Create**: Setting `createdAt` to a past or future timestamp instead of `request.time`.
9. **Oversized Title Resource Exhaustion**: Sending a 5,000-character `title` (exceeds `maxLength: 300`).
10. **Invalid Enum Priority**: Setting `priority: "super-urgent"` outside `['urgent', 'high', 'medium', 'low']`.
11. **Path ID Poisoning**: Creating a document with an invalid ID containing spaces or special characters (`task id!@#`).
12. **Blanket List Scraping**: Listing `/tasks` without filtering by `resource.data.ownerId == request.auth.uid`.
