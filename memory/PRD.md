# JobLink - Product Requirements Document

## Original Problem Statement
Build a responsive web application called "JobLink" to help job seekers create a single professional link containing their resume, portfolio, WhatsApp contact button, and an Apply CTA for HRs. India-first users.

## Architecture
- **Frontend**: React 19 with Tailwind CSS, Shadcn UI components
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT-based email/password auth with email verification
- **Email Service**: Resend (via Emergent LLM key)

## User Personas
1. **Job Seekers (Primary)**: Need a simple, professional way to share their profile
2. **HR Professionals/Recruiters**: View candidate profiles, access resume, contact via WhatsApp

## Core Requirements (Static)
- Clean, minimal, professional UI
- Mobile-first design
- No animations
- Fast loading
- India-first target audience

## What's Been Implemented

### v1.0 - Initial MVP (Jan 2026)
- [x] Email + password registration
- [x] Email + password login
- [x] JWT token-based session management
- [x] Basic profile: Name, Title/Role, Short Bio
- [x] Username for clean public URLs (/username)
- [x] WhatsApp contact number
- [x] Resume: PDF upload OR external link
- [x] Portfolio links: Add/remove multiple links
- [x] Public profile page with View Resume, WhatsApp, Hire CTA
- [x] Mobile-responsive design

### v1.1 - Auth & Social Features (Jan 2026)
- [x] Profile picture/avatar upload (JPEG, PNG, WebP, GIF - max 2MB)
- [x] Email verification with Resend
- [x] Password reset flow with Resend
- [x] Verification banner for unverified users
- [x] OpenGraph meta tags for social sharing (WhatsApp, LinkedIn)
- [x] React Helmet Async for SEO

## Prioritized Backlog

### P0 (Critical for next release)
- None currently blocking

### P1 (High Priority)
- Custom domain support
- Profile templates/themes
- Analytics dashboard (view count, CTA clicks)

### P2 (Medium Priority)
- QR code generation for profile
- Social media link icons (auto-detect)
- Multiple resume versions

### P3 (Nice to Have)
- Portfolio image previews
- Testimonials/recommendations section
- Skills tags with badges

## Technical Notes
- Resend email service configured with Emergent LLM key
- Avatar and resume stored as base64 in MongoDB
- OpenGraph uses react-helmet-async for React 19 compatibility

## Next Tasks List (Post-MVP)
1. Consider adding basic analytics based on user feedback
2. Custom domain support for premium users
3. Profile templates for different industries
