# Online Learning Platform for Professional IT Courses

You are a senior full-stack software architect and engineer.

We need to build a modern production-ready Online Learning Platform for Professional IT Courses (LMS platform) similar to Udemy and Coursera but for the Uzbek market, with clean architecture, scalable backend, responsive frontend, and professional UI/UX. Platform name is IlmHub.uz

## IlmHub Advantages:

- Interface in Uzbek + Russian + English
- Integration with local payment systems (Payme, Click, Uzum)
- Full mobile adaptation
- Interactive in-browser coding environment (like Udemy)
- Quizzes (like Udemy)
- Real-time progress and GitHub-style gamification

## Tech Stack:

- Frontend: Next.js + React + TypeScript
- Styling: Tailwind CSS + Shadcn UI + Framer Motion
- Backend: NestJS (Node.js + TypeScript)
- Database: Supabase PostgreSQL
- ORM: Prisma
- Authentication: JWT + Refresh Tokens + OAuth
- Video Hosting: Mux or Cloudflare Stream
- Payments: Payme, Click, Uzum (Uzbekistan local)
- Deployment Ready: Vercel + Railway

I listed the Tech Stack at a basic level, but feel free to add any other technologies you think would improve the final result, or ask me to clarify anything you don’t understand.

## Design System:

Read the /design-system folder and the README inside.

## Interface Language:

- Uzbek (Latin alphabet). UI strings must be in Uzbek for now.
- Russian (later)
- English (later)

========================================

## PUBLIC WEBSITE

========================================

1. Home Page

- Hero section
- Search courses
- Featured courses
- Popular categories
- Top instructors
- Student testimonials
- Statistics section
- CTA sections
- FAQ
- Footer

2. Course Catalog

Features:

- Search
- Filtering
- Sorting
- Pagination

Filters:

- category
- level
- price
- rating
- duration
- language

3. Course Details Page

Sections:

- Course preview video
- Course title
- Description
- Learning outcomes
- Curriculum
- Instructor profile
- Ratings & reviews
- Requirements
- Price
- Enroll button

4. Category Pages
5. Instructor Public Profiles
6. Blog System
7. Contact Page
8. About Page

========================================

## AUTHENTICATION

========================================

Implement:

- Login
- Register
- Forgot password
- Email verification
- Google OAuth
- Role-based authentication

Roles:

- Student
- Instructor
- Admin

========================================

## STUDENT PANEL

========================================

Pages:

- Dashboard
- My Courses
- Favorites
- Certificates
- Wishlist
- Achievements

Features:

- Track course progress
- Resume videos
- Download certificates
- Profile management

========================================

## LEARNING SYSTEM

========================================

Create a full learning experience page.

Features:

- Video player
- Sidebar lessons
- Mark lesson complete
- Notes system
- Q&A section
- Coding Exercises
- Quizzes
- Progress tracking
- Responsive layout

========================================

## INSTRUCTOR PANEL

========================================

Features:

- Dashboard
- Courses
- Communication
- Students
- Reviews
- Revenue

Course creation flow:
Step 1 — Basic information
Step 2 — Thumbnail upload
Step 3 — Course description
Step 4 — Curriculum builder
Step 5 — Upload lessons/videos
Step 6 — Coding Exercises
Step 7 — Quizzes
Step 8 — Publish course

========================================

## ADMIN PANEL

========================================

Features:

- User management
- Instructor verification
- Course moderation
- Analytics dashboard
- Revenue management
- Refund management
- CMS management
- Blog management
- Platform settings

========================================

## DATABASE MODELS

========================================

Create proper Prisma schema for:

- Users
- Roles
- Courses
- Categories
- Lessons
- Sections
- Enrollments
- Progress
- Reviews
- Certificates
- Payments
- Orders
- Notifications
- Wishlists
- Blogs
- Comments
- Quizzes
- Quiz attempts

========================================

## UI/UX REQUIREMENTS

========================================

Read the /design-system folder and the README inside.

Design requirements:

- Modern minimal UI
- Apple-level clean design
- Fully responsive
- Smooth animations
- Beautiful dashboards

Use:

- Shadcn UI
- Framer Motion
- Lucide Icons

========================================

## PROJECT STRUCTURE

========================================

Generate:

- Clean scalable folder structure
- Reusable components
- API architecture
- Service layer
- Validation layer
- Error handling
- Environment configuration
- README documentation

========================================

## IMPORTANT REQUIREMENTS

========================================

- Use clean architecture principles
- Use TypeScript everywhere
- Follow best practices
- Create reusable UI components
- Create responsive layouts
- Add loading states and skeletons
- Add proper error handling
- Add form validation
- Add protected routes
- Use server-side rendering where needed
- Optimize performance
- Use accessible components

========================================

## DELIVERABLES

========================================

Generate the project step-by-step in production-ready quality.

For every module:

- explain architecture decisions
- generate clean scalable code
- follow clean architecture principles
- use TypeScript everywhere
- avoid mock implementations unless requested
- keep code modular and reusable

========================================

This is a basic technical document that outlines the project we'll be developing, but it may change going forward to achieve a better end result.This is a basic technical document that outlines the project we'll be developing, but it may change going forward to achieve a better end result. Clarify any unclear questions — don't hallucinate.
