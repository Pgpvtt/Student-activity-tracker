# Firestore Security Specification for Smart Student Tracker

## 1. Data Invariants
- A User document must belong to the authenticated user.
- A Subject/Assignment/Timetable/Notification must reside under the correct user's subcollection.
- Groups are shared, but only members can read them, and only admins can manage them.

## 2. The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Identity Spoofing**: Attempt to create a user profile for a different UID.
2. **Cross-User Leak**: Try to read another user's subjects.
3. **Ghost Field Write**: Write a user document with an unvalidated `isAdmin` field.
4. **Orphaned Sub-resource**: Create a subject without a parent user document (implicit in Firestore, but we check parent existence if possible).
5. **ID Poisoning**: Use a 1MB string as a `subjectId`.
6. **Future Spoofing**: Create an assignment with a `deadline` in the far past despite UI validation.
7. **Role Escalation**: Attempt to promote self to group admin after joining.
8. **Malicious Analytics**: Overwrite `streak` with a negative number or extremely large number.
9. **Spam Notifications**: Write a notification to another user's subcollection.
10. **Bypassing Immutability**: Attempt to change `userId` or `email` after creation.
11. **Shadow Update**: Update a subject but inject a hidden `verified` flag.
12. **PII Leak**: Read the entire `users` collection as a standard user.

## 3. Test Runner (Conceptual logic)
- `beforeAll`: Initialize Firebase emulator.
- `test`: Each of the "Dirty Dozen" should return `PERMISSION_DENIED`.
