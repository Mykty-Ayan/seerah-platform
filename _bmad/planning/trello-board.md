# Trello Board: Seerah Platform

**Board URL:** (создать вручную)
**Lists:** Backlog, In Progress, Review, Done

---

## List: Backlog

### Sprint 1: Infrastructure (Week 1-2)

#### [S1.1] Setup Go Backend
- [ ] Initialize Go project with chi router
- [ ] Setup PostgreSQL connection (gorm)
- [ ] Create DB migrations (8 tables)
- [ ] Health check endpoint `/health`
- [ ] Setup environment variables (.env)
**Labels:** backend, infrastructure
**Estimate:** 3 SP

#### [S1.2] Setup React Frontend (Public)
- [ ] Initialize Vite + React + TypeScript
- [ ] Install Tailwind CSS + Shadcn/ui
- [ ] Setup routing (React Router)
- [ ] Create bottom navigation component
- [ ] Setup i18n (react-i18next)
**Labels:** frontend, infrastructure
**Estimate:** 3 SP

#### [S1.3] Admin Authentication
- [ ] JWT auth endpoints (login/logout)
- [ ] Protected routes middleware
- [ ] Admin panel login page
- [ ] Store JWT in httpOnly cookie
**Labels:** backend, auth
**Estimate:** 3 SP

#### [S1.4] Dashboard Stats
- [ ] Backend: GET /api/admin/dashboard (total courses, videos, users)
- [ ] Frontend Admin: Dashboard.tsx with stat cards
**Labels:** backend, frontend
**Estimate:** 2 SP

---

### Sprint 2: Courses & Catalog (Week 3-4)

#### [S2.1] Course CRUD (Admin)
- [ ] Backend: POST /api/admin/courses
- [ ] Backend: PUT /api/admin/courses/:id
- [ ] Backend: DELETE /api/admin/courses/:id
- [ ] Frontend Admin: Courses.tsx (list)
- [ ] Frontend Admin: CourseForm.tsx (create/edit)
- [ ] Validation: all fields required except description
**Labels:** backend, frontend, admin
**Estimate:** 5 SP

#### [S2.2] Lecturer CRUD (Admin)
- [ ] Backend: CRUD /api/admin/lecturers
- [ ] Frontend Admin: Lecturers.tsx, LecturerForm.tsx
- [ ] Avatar upload to Cloudinary/S3
**Labels:** backend, frontend, admin
**Estimate:** 3 SP

#### [S2.3] Category CRUD (Admin)
- [ ] Backend: CRUD /api/admin/categories
- [ ] Frontend Admin: Categories.tsx, CategoryForm.tsx
- [ ] Auto-generate slug from name
**Labels:** backend, frontend, admin
**Estimate:** 2 SP

#### [S2.4] File Upload (Cloudinary)
- [ ] Setup Cloudinary account
- [ ] Backend: POST /api/admin/upload (signed upload)
- [ ] Frontend: FileUpload component with preview
- [ ] Validate image types (jpg, png, webp)
**Labels:** backend, frontend, storage
**Estimate:** 3 SP

#### [S2.5] Public Course List
- [ ] Backend: GET /api/courses (pagination, filters)
- [ ] Backend: GET /api/categories
- [ ] Frontend: Home.tsx with course grid
- [ ] Frontend: CourseCard.tsx with progress bar
- [ ] Frontend: CategoryTabs.tsx (filtering)
**Labels:** backend, frontend
**Estimate:** 4 SP

---

### Sprint 3: Video Player & Progress (Week 5-6)

#### [S3.1] Course Detail Page
- [ ] Backend: GET /api/courses/:id (with videos[])
- [ ] Frontend: CourseDetail.tsx with episode list
- [ ] Frontend: EpisodeList.tsx with watched status
**Labels:** backend, frontend
**Estimate:** 3 SP

#### [S3.2] Video Player
- [ ] Frontend: VideoPlayer.tsx (YouTube embed)
- [ ] Helper: extractYouTubeId(url) from various formats
- [ ] Responsive player (16:9 aspect ratio)
**Labels:** frontend
**Estimate:** 2 SP

#### [S3.3] Episode Navigation
- [ ] Frontend: Next/Previous buttons
- [ ] Disable buttons on first/last episode
- [ ] Query param: ?episode={num}
**Labels:** frontend
**Estimate:** 2 SP

#### [S3.4] Progress Tracking
- [ ] Backend: POST /api/progress/update
- [ ] Backend: GET /api/courses/:id/progress
- [ ] Frontend: "Mark as watched" button
- [ ] Auto-update progress bars after watching
**Labels:** backend, frontend
**Estimate:** 3 SP

#### [S3.5] Circular Progress Bar
- [ ] Frontend: CircularProgress.tsx (SVG or recharts)
- [ ] Display on course cards (33%, etc.)
- [ ] Green color as per design
**Labels:** frontend
**Estimate:** 3 SP

#### [S3.6] Linear Progress Bar
- [ ] Frontend: LinearProgress.tsx (Shadcn Progress)
- [ ] Show on course cards below title
- [ ] Format: "0%" → "33%" → "100%"
**Labels:** frontend
**Estimate:** 1 SP

---

### Sprint 4: My Courses & Polish (Week 7-8)

#### [S4.1] My Courses Page
- [ ] Backend: GET /api/user/courses (in_progress, completed)
- [ ] Frontend: MyCourses.tsx with tabs
- [ ] Sort by last_watched_at
**Labels:** backend, frontend
**Estimate:** 3 SP

#### [S4.2] Progress Summary Stats
- [ ] Backend: GET /api/user/progress-summary
- [ ] Frontend: StatsCards.tsx (courses started, completed, hours)
**Labels:** backend, frontend
**Estimate:** 2 SP

#### [S4.3] Bottom Navigation
- [ ] Frontend: BottomNav.tsx with 3 tabs
- [ ] Active state styling (green)
- [ ] Routes: / (home), /my-courses, /settings
**Labels:** frontend
**Estimate:** 2 SP

#### [S4.4] Settings Page
- [ ] Frontend: Settings.tsx
- [ ] Language switcher (KK, RU, EN) - Phase 2
- [ ] Clear progress button
**Labels:** frontend
**Estimate:** 2 SP

#### [S4.5] Featured Courses
- [ ] Backend: POST /api/admin/courses/:id/feature
- [ ] Backend: GET /api/courses?featured=true
- [ ] Frontend: Show featured courses at top with "Бастау" button
**Labels:** backend, frontend
**Estimate:** 2 SP

---

### Sprint 5: Deploy & Beta (Week 9-10)

#### [S5.1] Railway Setup
- [ ] Create Railway project
- [ ] Setup PostgreSQL database
- [ ] Configure environment variables
- [ ] Deploy backend service
**Labels:** devops
**Estimate:** 2 SP

#### [S5.2] Frontend Deploy
- [ ] Build React app (Vite build)
- [ ] Deploy to Railway static or Netlify/Vercel
- [ ] Configure CORS for backend
**Labels:** devops
**Estimate:** 1 SP

#### [S5.3] CI/CD Pipeline
- [ ] GitHub Actions workflow (build + test + deploy)
- [ ] Auto-deploy on `main` branch push
**Labels:** devops
**Estimate:** 2 SP

#### [S5.4] Bug Fixes & Polish
- [ ] Fix discovered bugs from beta testing
- [ ] UX improvements
- [ ] Performance optimization
**Labels:** bugfix
**Estimate:** 5 SP

#### [S5.5] Documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] README.md for setup
- [ ] Admin panel user guide
**Labels:** docs
**Estimate:** 2 SP

---

## List: In Progress
*(Move cards here when working)*

## List: Review
*(Move cards here when ready for testing)*

## List: Done
*(Completed cards)*

---

## Labels to Create in Trello:
- 🔵 backend
- 🟢 frontend
- 🟡 admin
- 🟣 devops
- 🔴 bugfix
-  docs
-  auth
-  storage
-  infrastructure
-  high-priority (for MVP critical)

## Milestones:
- **M1:** Sprint 1 Complete (Infrastructure ready) - Week 2
- **M2:** Sprint 3 Complete (Core features working) - Week 6
- **M3:** MVP Deployed to Railway - Week 10

---

## How to Import to Trello:

### Option 1: Manual Creation (Recommended)
1. Go to https://trello.com and create board "Seerah Platform"
2. Create 4 lists: Backlog, In Progress, Review, Done
3. Create cards manually from the list above
4. Add labels, estimates, and checklists

### Option 2: CSV Import
1. Export this file as CSV
2. Use Trello's import feature (Power-Up: "Import")

### Option 3: Trello API Script
```bash
# Create board
BOARD_ID=$(curl -s -X POST "https://api.trello.com/1/boards" \
  -d "key=$TRELLO_API_KEY" \
  -d "token=$TRELLO_TOKEN" \
  -d "name=Seerah Platform" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Create lists
curl -s -X POST "https://api.trello.com/1/lists" \
  -d "key=$TRELLO_API_KEY" \
  -d "token=$TRELLO_TOKEN" \
  -d "name=Backlog" \
  -d "idBoard=$BOARD_ID"

# ... repeat for each list and card
```

---

## Card Template:
```
Title: [Sprint.Story#] Story Name

Description:
**As a** [role]
**I want to** [action]
**So that** [benefit]

Acceptance Criteria:
- [ ] AC 1
- [ ] AC 2

Tech Tasks:
- [ ] Task 1
- [ ] Task 2

Labels: [backend, frontend, etc.]
Estimate: [X] SP
```
