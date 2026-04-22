# Software Requirements Specification (SRS)
## Project: Smart Student Tracker

---

### **Table of Contents**
1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Architecture](#3-system-architecture)
4. [Tech Stack](#4-tech-stack)
5. [Data Models](#5-data-models)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [System Features (Detailed)](#8-system-features-detailed)
9. [Software Requirements](#9-software-requirements)
10. [Hardware Requirements](#10-hardware-requirements)
11. [Installation Guide](#11-installation-guide)
12. [Usage Guide](#12-usage-guide)
13. [Future Enhancements](#13-future-enhancements)
14. [Conclusion](#14-conclusion)

---

### **1. Introduction**

#### **Purpose of the System**
The **Smart Student Tracker** is a comprehensive academic management platform designed to help students streamline their academic life. It provides tools for tracking attendance, managing class schedules, organizing assignments, and gaining data-driven insights into academic performance.

#### **Scope of the Project**
The system acts as a personal academic ERP for students. It covers attendance management with predictive "safe bunk" logic, a dynamic timetable system with multi-format upload support, assignment tracking with priority management, and an AI-driven assistant for personalized academic advice.

#### **Intended Users**
*   **College/University Students:** Primary users who need to manage multiple subjects, strict attendance criteria, and numerous deadlines.

#### **Definitions**
*   **Attendance %:** The ratio of classes attended to total classes held for a specific subject.
*   **Safe Bunk:** The number of upcoming classes a student can skip while maintaining their attendance above a specific threshold (default: 75%).
*   **Threshold:** The minimum required attendance percentage (e.g., 75% or 80%) set by the institution.
*   **Needed Classes:** The number of consecutive classes a student must attend to bring their attendance back up to the threshold if it is currently below it.

---

### **2. Overall Description**

#### **Product Perspective**
Smart Student Tracker is a SaaS-ready productivity ecosystem. It transitions from a simple tracking tool to a smart academic advisor by utilizing historical data and AI to predict future academic risks.

#### **Product Features Overview**
*   **Attendance Tracking:** Real-time logging of presence/absence.
*   **Smart Attendance Insights:** Automatic calculation of "Safe Bunks," "Needed Classes," and "Risk Levels."
*   **Timetable Management:** Manual entry plus "Simulated AI" parsing for PDF, Image, and Excel schedule uploads.
*   **Assignment Tracking:** Deadline-based task management with priority levels and status updates.
*   **Collaborative Groups:** Share assignments and announcements with classmates.
*   **AI Assistant:** A dedicated academic concierge powered by Gemini API for subject-specific queries and strategy tips.
*   **Interactive Analytics:** Visual performance charts and attendance heatmaps.

#### **User Flow Explanation**
1.  **Onboarding:** User registers and logs in via Firebase Auth.
2.  **Configuration:** User adds subjects (name, teacher, color identity).
3.  **Setup:** User builds or uploads their weekly timetable.
4.  **Daily Operation:** User marks attendance from the Dashboard, tracks assignments, and interacts with the AI Assistant for study tips.
5.  **Review:** User checks the Analytics page for long-term trends and performance metrics.

---

### **3. System Architecture**

#### **High-Level Architecture**
The application follows a **Client-Server-Database** architecture:
*   **Frontend (UI Layer):** React-based SPA that handles all user interactions and local state management.
*   **Backend (Service Layer):** A hybrid model using **Firebase Authentication** for identity and **Express/Node.js** (optional/cloud-ready) for heavy processing.
*   **Database (Data Layer):** **Google Firestore** (NoSQL) for high-performance, real-time data synchronization.

#### **Data Flow Explanation**
User actions trigger requests through the `dataService` layer. These requests are either stored in Firestore subcollections (for persistence) or processed by local utility functions (for immediate feedback like attendance analysis).

#### **Modular Structure**
*   `/src/context`: Auth, Theme, and Toast state management.
*   `/src/pages`: Individual route implementations (Dashboard, Analytics, etc.).
*   `/src/services`: Outsourced logic for Firebase (`dataService`), Notifications, and Payments.
*   `/src/lib`: Core SDK initializations (Firebase, Gemini).

---

### **4. Tech Stack**

*   **Frontend:** React 18, Vite (Build Tool), Tailwind CSS (Styling).
*   **Animations:** Framer Motion (`motion/react`).
*   **Icons:** Lucide React.
*   **Charts:** Recharts / D3.js.
*   **Backend & Auth:** Firebase Authentication (Google/Email).
*   **Database:** Cloud Firestore (NoSQL Subcollections).
*   **AI Logic:** Google Gemini API (`@google/genai`).
*   **State Management:** React Context API + Hooks.

---

### **5. Data Models**

| Entity | Primary Fields | Storage Relation |
| :--- | :--- | :--- |
| **User** | uid, name, email, plan, settings, streak | `/users/{userId}` |
| **Subject** | subjectName, teacherName, color, totalClasses, attendedClasses | `/users/{userId}/subjects/{id}` |
| **Timetable** | subjectId, day, startTime, endTime, room, status | `/users/{userId}/timetable/{id}` |
| **Assignment** | title, subjectId, deadline, priority, status | `/users/{userId}/assignments/{id}` |
| **Notification**| title, message, date, read, type | `/users/{userId}/notifications/{id}` |
| **Faculty** | name, email, office, availability | `/users/{userId}/faculty/{id}` |
| **Group** | groupId, adminId, members[], sharedAnnouncements[] | `/groups/{groupId}` |

---

### **6. Functional Requirements**

*   **FR-1: User Authentication:** Support for secure Email/Password login and registration via Firebase.
*   **FR-2: Subject Management:** Users must be able to create, edit, and delete subjects with custom color coding.
*   **FR-3: Attendance Marking:** One-tap present/absent marking from both the Dashboard and Subjects pages.
*   **FR-4: Smart Attendance Engine:** Real-time calculation of safe bunks and attendance risk based on a configurable threshold.
*   **FR-5: Timetable Upload & Parsing:** Support for uploading PDF/Image schedules with simulated AI-driven parsing into the database.
*   **FR-6: Assignment Management:** Full CRUD operations for tasks with priority sorting (High/Medium/Low).
*   **FR-7: Notifications:** Local and system-generated alerts for low attendance, overdue assignments, and daily schedules.
*   **FR-8: Analytics:** Visual representation of attendance trends using line and bar charts.
*   **FR-9: AI Assistant:** Context-aware chat assistant that knows the user's specific subjects and performance.
*   **FR-10: Subscription System:** Basic SaaS structure with Free, Pro, and Premium plan tiers.

---

### **7. Non-Functional Requirements**

*   **Performance:** UI interactions must respond in <100ms. Database sync should happen in the background without blocking the UI.
*   **Usability:** Mobile-first responsive design following modern "Bento Box" UI patterns.
*   **Reliability:** Offline caching support for academic records (local sync-first).
*   **Security:** Firestore Security Rules strictly enforce that `userId` in the path matches the authenticated `request.auth.uid`.
*   **Scalability:** Multi-tenant architecture using subcollections ensures the system can handle thousands of concurrent students.

---

### **8. System Features (Detailed)**

#### **Attendance Calculation Logic**
`Attendance % = (Attended Classes / Total Classes) * 100`

#### **Safe Bunk Logic**
The system calculates how many classes can be skipped before the percentage drops below 75%:
`Safe Bunks = Floor((Attended Classes - 0.75 * Total Classes) / 0.75)`

#### **Recommendation Engine**
Based on the \%:
*   **< 75%:** "Critical Risk" - Mandatory attendance.
*   **75% - 85%:** "Medium Risk" - High priority attendance.
*   **> 85%:** "Low Risk" - Safe to skip if necessary.

#### **Timetable Parsing**
Utilizes a simulated AI processor that accepts various file formats, converts them to structured JSON, and maps them to the Firestore `timetable` subcollection.

---

### **9. Software Requirements**

*   **Modern Web Browser:** Chrome 90+, Edge 90+, Firefox 88+, or Safari 14+.
*   **Node.js:** v18.x or higher (for local development).
*   **Package Manager:** `npm` (v9+) or `yarn`.

---

### **10. Hardware Requirements**

*   **Processor:** Dual-core 2.0GHz or higher.
*   **Memory:** 4GB RAM minimum (8GB recommended for dev).
*   **Internet:** Stable connection for Firebase connectivity and Cloud API features.

---

### **11. Installation Guide**

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/yourusername/smart-student-tracker.git
    cd smart-student-tracker
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Setup:**
    Create a `.env` file based on `.env.example` and add your **Gemini API Key** and **Firebase Configuration**.
4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
5.  **Build for Production:**
    ```bash
    npm run build
    ```

---

### **12. Usage Guide**

1.  **Sign Up:** Create a new account with your email.
2.  **Add Subjects:** Head to the 'Subjects' tab and input your current semester courses.
3.  **Set Timetable:** Manual entry or upload a photo of your classroom schedule.
4.  **Mark Daily:** Use the 'Mark Present' button on the Dashboard after every class.
5.  **Consult AI:** Ask the AI Assistant: "What is my attendance status in Mathematics?" or "Suggest a study plan for this weekend."

---

### **13. Future Enhancements**

*   **Advanced AI Insights:** Real OCR integration using Google Vision API for 100% accurate timetable parsing.
*   **Mobile App:** Native iOS and Android versions using React Native.
*   **Push Notifications:** Integration with FCM (Firebase Cloud Messaging) for real-time mobile alerts.
*   **LMS Integration:** Connecting with Moodle/Canvas to auto-sync assignments.

---

### **14. Deployment Guide**

#### **Frontend Hosting (Vercel / Netlify)**
1.  **Configure Environment Variables:** Add all variables from `.env.example` to your provider's dashboard.
2.  **Build Command:** `npm run build`
3.  **Output Directory:** `dist`
4.  **Routing Fix:** If deploying separately from the backend, ensure you add a `vercel.json` or `_redirects` file to handle SPA routing.

#### **Backend Hosting (Railway / Render)**
1.  **Framework:** Node.js
2.  **Build Command:** `npm run build`
3.  **Start Command:** `npm start`
4.  **Port:** Ensure the provider injects `process.env.PORT`.
5.  **Environment Variables:** Add `MONGODB_URI` and any Firebase secrets if using server-side SDKs.

#### **Full-Stack Deployment (Combined)**
The project is configured to serve the frontend via the Express server in production.
1.  Push the entire repo to your provider (e.g., Railway).
2.  The server will automatically serve the `dist/` folder when `NODE_ENV=production` is set.
3.  Set `VITE_DEV=false` (default) to disable Vite development middleware.

---

### **15. Conclusion**

The **Smart Student Tracker** provides an indispensable value proposition: reducing academic anxiety through data transparency. By quantifying academic risk and providing an intelligent interface to manage time, it empowers students to focus on learning rather than logistics.
