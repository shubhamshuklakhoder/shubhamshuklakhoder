# JobLink - Product Requirements Document

## Original Problem Statement
Build a responsive web application called "JobLink" to help job seekers create a single professional link containing their resume, portfolio, WhatsApp contact button, and an Apply CTA for HRs. India-first users.

## Architecture
- **Frontend**: React with Tailwind CSS, Shadcn UI components
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT-based email/password auth

## User Personas
1. **Job Seekers (Primary)**: Need a simple, professional way to share their profile
2. **HR Professionals/Recruiters**: View candidate profiles, access resume, contact via WhatsApp

## Core Requirements (Static)
- Clean, minimal, professional UI
- Mobile-first design
- No animations
- Fast loading
- India-first target audience

## What's Been Implemented (v1 - Jan 2026)

### Authentication
- [x] Email + password registration
- [x] Email + password login
- [x] JWT token-based session management
- [x] Protected dashboard routes

### Profile Management
- [x] Basic info: Name, Title/Role, Short Bio
- [x] Username for clean public URLs
- [x] WhatsApp contact number
- [x] Resume: PDF upload OR external link (Google Drive/Dropbox)
- [x] Portfolio links: Add/remove multiple links

### Public Profile Page
- [x] Clean URL format: /username
- [x] Display all profile info
- [x] View Resume button
- [x] Contact on WhatsApp button
- [x] "I'm Interested in Hiring" CTA
- [x] Portfolio links section
- [x] Mobile-responsive design

### UI/UX
- [x] Light theme with blue accents
- [x] Work Sans + Inter fonts
- [x] Shadcn UI components
- [x] Toast notifications (Sonner)
- [x] Copy profile link functionality

## Prioritized Backlog

### P0 (Critical for next release)
- None currently blocking

### P1 (High Priority)
- Profile picture/avatar upload
- Email verification
- Password reset flow
- SEO meta tags for public profiles

### P2 (Medium Priority)
- Profile analytics (view count, CTA clicks)
- Custom themes/color schemes
- QR code generation for profile
- Social media link icons (auto-detect)

### P3 (Nice to Have)
- Multiple resume versions
- Portfolio image previews
- Testimonials/recommendations section
- Skills tags with badges

## Next Tasks List
1. Add profile picture upload
2. Implement email verification
3. Add password reset functionality
4. Add meta tags for social sharing (OpenGraph)
5. Consider adding basic analytics in future version
