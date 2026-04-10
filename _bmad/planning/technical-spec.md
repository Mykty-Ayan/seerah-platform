# Technical Specification: Seerah Platform

## Architecture Overview
- **Backend:** Go (chi router) + PostgreSQL
- **Frontend Public:** React + Vite + TypeScript + Shadcn/ui (PWA mobile-first)
- **Frontend Admin:** Separate React app или `/admin` route в основном app
- **Video Hosting:** YouTube embed (MVP), Cloudinary/S3 для обложек
- **Deploy:** Railway (Go service + static frontend)

---

## Database Schema

### Tables

#### 1. `lecturers` (Лекторы)
```sql
CREATE TABLE lecturers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,           -- "Ұстаз Нұрсұлтан Рысмағанбетұлы"
    bio TEXT,                     -- биография
    avatar_url TEXT,              -- URL фото (Cloudinary/S3)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `categories` (Категории/Теги)
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,           -- "Құран", "Ақида", "Фиқһ"
    slug TEXT UNIQUE NOT NULL,    -- "quran", "aqida", "fiqh"
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. `courses` (Курсы/Серии)
```sql
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,          -- название курса
    description TEXT,             -- описание
    lecturer_id INT REFERENCES lecturers(id),
    category_id INT REFERENCES categories(id),
    thumbnail_url TEXT,           -- обложка курса
    total_videos INT DEFAULT 0,   -- денормализация (для быстрого отображения)
    is_featured BOOLEAN DEFAULT FALSE,  -- показывать на главной в "Сира бойынша дәрістер"
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_courses_category ON courses(category_id);
CREATE INDEX idx_courses_lecturer ON courses(lecturer_id);
CREATE INDEX idx_courses_featured ON courses(is_featured);
```

#### 4. `videos` (Видео/Эпизоды)
```sql
CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,          -- название эпизода
    description TEXT,             -- описание эпизода
    video_url TEXT NOT NULL,      -- YouTube URL или embed ID
    thumbnail_url TEXT,           -- превью видео (опционально)
    duration INT,                 -- длительность в секундах
    order_index INT NOT NULL,     -- порядок в курсе (1, 2, 3...)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_videos_course_order ON videos(course_id, order_index);
```

#### 5. `users` (Пользователи — MVP: только для трекинга прогресса, без паролей)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    device_id TEXT UNIQUE,        -- идентификатор устройства (localStorage UUID)
    created_at TIMESTAMP DEFAULT NOW()
);
-- MVP: анонимные пользователи с device_id
-- Phase 2: добавить email/password, OAuth
```

#### 6. `user_course_progress` (Прогресс курса)
```sql
CREATE TABLE user_course_progress (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    course_id INT REFERENCES courses(id),
    completed_videos INT DEFAULT 0,
    last_watched_at TIMESTAMP,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_progress_user ON user_course_progress(user_id);
```

#### 7. `user_video_watched` (Просмотренные видео)
```sql
CREATE TABLE user_video_watched (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    video_id INT REFERENCES videos(id),
    watched_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

CREATE INDEX idx_watched_user ON user_video_watched(user_id);
```

#### 8. `admins` (Администраторы)
```sql
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Auth: JWT tokens
```

---

## API Endpoints

### Public API

#### Courses
```
GET    /api/courses?page=1&limit=20&category_id=1&featured=true
POST   /api/courses/:id/progress     # Обновить прогресс пользователя
GET    /api/courses/:id              # Детали курса со списком видео
GET    /api/courses/:id/videos       # Список видео курса
```

**Response Example: GET /api/courses**
```json
{
  "courses": [
    {
      "id": 1,
      "title": "Сира бойынша дәрістер",
      "description": "...",
      "lecturer": {
        "id": 1,
        "name": "Ұстаз Нұрсұлтан Рысмағанбетұлы",
        "avatar_url": "https://..."
      },
      "category": {
        "id": 1,
        "name": "Ақида"
      },
      "thumbnail_url": "https://...",
      "total_videos": 102,
      "progress": 33,  // только для авторизованного пользователя
      "is_featured": true
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20
  }
}
```

**Response Example: GET /api/courses/:id**
```json
{
  "course": {
    "id": 1,
    "title": "Сира бойынша дәрістер",
    "description": "...",
    "lecturer": {
      "id": 1,
      "name": "Ұстаз Нұрсұлтан Рысмағанбетұлы",
      "bio": "...",
      "avatar_url": "https://..."
    },
    "category": {
      "id": 1,
      "name": "Ақида",
      "slug": "aqida"
    },
    "thumbnail_url": "https://...",
    "total_videos": 102
  },
  "videos": [
    {
      "id": 1,
      "title": "Эпизод 1: Рождение Пророка ﷺ",
      "description": "...",
      "video_url": "https://youtube.com/...",
      "duration": 1800,
      "order_index": 1,
      "is_watched": true  // для текущего пользователя
    }
  ]
}
```

#### Progress
```
POST   /api/progress/update    # Отметить видео как просмотренное
GET    /api/user/progress      # Прогресс пользователя по всем курсам
```

**Request: POST /api/progress/update**
```json
{
  "device_id": "uuid-123",  // из localStorage
  "video_id": 5,
  "course_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "course_progress": {
    "completed_videos": 34,
    "total_videos": 102,
    "percentage": 33,
    "is_completed": false
  }
}
```

#### Categories
```
GET    /api/categories       # Список категорий для табов
```

**Response:**
```json
{
  "categories": [
    { "id": 0, "name": "Барлығы", "slug": "all" },
    { "id": 1, "name": "Құран", "slug": "quran" },
    { "id": 2, "name": "Ақида", "slug": "aqida" },
    { "id": 3, "name": "Фиқһ", "slug": "fiqh" }
  ]
}
```

#### Lecturers
```
GET    /api/lecturers        # Список лекторов
GET    /api/lecturers/:id    # Детали лектора с курсами
```

---

### Admin API (Protected)

#### Auth
```
POST   /api/admin/login      # Email + password → JWT
POST   /api/admin/logout
GET    /api/admin/me         # Текущий админ
```

#### Courses (Admin)
```
POST   /api/admin/courses          # Создать курс
PUT    /api/admin/courses/:id      # Обновить курс
DELETE /api/admin/courses/:id      # Удалить курс
POST   /api/admin/courses/:id/feature  # Сделать featured
```

#### Videos (Admin)
```
POST   /api/admin/videos           # Добавить видео в курс
PUT    /api/admin/videos/:id       # Обновить видео
DELETE /api/admin/videos/:id       # Удалить видео
```

#### Lecturers (Admin)
```
POST   /api/admin/lecturers        # Создать лектора
PUT    /api/admin/lecturers/:id    # Обновить лектора
DELETE /api/admin/lecturers/:id    # Удалить лектора
```

#### Categories (Admin)
```
POST   /api/admin/categories       # Создать категорию
PUT    /api/admin/categories/:id   # Обновить категорию
DELETE /api/admin/categories/:id   # Удалить категорию
```

#### Media Upload
```
POST   /api/admin/upload         # Загрузка обложки (Cloudinary/S3)
```

---

## Frontend Structure

### Public App (React)
```
src/
├── components/
│   ├── ui/                   # Shadcn/ui компоненты
│   ├── CourseCard.tsx        # Карточка курса (с прогрессом)
│   ├── CategoryTabs.tsx      # Табы категорий
│   ├── VideoPlayer.tsx       # YouTube embed плеер
│   ├── BottomNav.tsx         # Нижняя навигация
│   └── ProgressBar.tsx       # Прогресс-бар (круговой + линейный)
├── pages/
│   ├── Home.tsx              # Главная (Бас бет)
│   ├── CourseDetail.tsx      # Страница курса со списком видео
│   ├── MyCourses.tsx         # Менің иманым
│   └── Settings.tsx          # Баптаулар
├── hooks/
│   ├── useProgress.ts        # Хук прогресса
│   └── useCourses.ts         # Хук курсов
├── services/
│   └── api.ts                # API client (fetch/axios)
├── store/                    # Zustand/Redux для глобального стейта
├── i18n/                     # react-i18next
└── App.tsx
```

### Admin App (React)
```
src/
├── components/
│   ├── Dashboard.tsx
│   ├── CourseForm.tsx
│   ├── VideoForm.tsx
│   ├── LecturerForm.tsx
│   └── CategoryForm.tsx
├── pages/
│   ├── Dashboard.tsx         # Статистика
│   ├── Courses.tsx           # CRUD курсов
│   ├── Videos.tsx            # CRUD видео
│   ├── Lecturers.tsx         # CRUD лекторов
│   └── Categories.tsx        # CRUD категорий
├── services/
│   └── adminApi.ts
└── auth/                     # JWT auth, protected routes
```

---

## Key Technical Decisions

### 1. Video Hosting
**MVP:** YouTube embed
- Плюсы: бесплатно, CDN, адаптивный плеер
- Минусы: реклама YouTube, зависимости
- Реализация: `<iframe src="https://www.youtube.com/embed/{VIDEO_ID}">`

**Phase 2:** Cloudinary или Mux
- Свой плеер, без рекламы
- Аналитика просмотров
- Платно

### 2. User Tracking (MVP)
- **Анонимные пользователи** с `device_id` (UUID в localStorage)
- Прогресс привязан к устройству
- При очистке localStorage прогресс теряется

**Phase 2:** Регистрация (email/password, OAuth)
- Прогресс синхронизируется между устройствами

### 3. i18n (Мультиязычность)
- Библиотека: `react-i18next`
- Структура: JSON файлы (`locales/kk/translation.json`, `locales/ru/translation.json`)
- Backend: мультиязычные поля в БД (JSONB) или отдельные таблицы
- Defaul: казахский (`kk`)

### 4. State Management
- **Public App:** Zustand (легковесный)
- **Admin App:** Zustand или Context API

### 5. Styling
- Tailwind CSS + Shadcn/ui
- Mobile-first дизайн
- Тёмная/светлая тема (опционально)

---

## Deployment (Railway)

### Services
1. **seerah-backend** (Go)
   - Порт: 8080
   - Env: `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_URL`
   - Health check: `GET /health`

2. **seerah-frontend** (Static/Node)
   - Nginx или Vite preview
   - Proxy `/api/*` → backend

3. **PostgreSQL**
   - Railway managed database

### CI/CD
- GitHub Actions → build → deploy to Railway
- Auto-deploy on `main` branch push

---

## Security
- **Admin Auth:** JWT with expiry (24h), refresh tokens
- **CORS:** Allow public frontend, admin frontend
- **Rate Limiting:** On API endpoints (middleware)
- **Input Validation:** Go structs with validator, sanitize HTML
- **File Uploads:** Cloudinary signed uploads, validate image types

---

## Performance
- **Caching:** Redis для курсов/категорий (опционально)
- **Pagination:** LIMIT/OFFSET с курсором (Phase 2)
- **CDN:** Cloudinary для обложек, YouTube для видео
- **Lazy Loading:** React.lazy для страниц, infinite scroll для курсов

---

## Monitoring & Analytics
- **Backend:** Prometheus metrics, Grafana dashboard
- **Frontend:** Google Analytics / Plausible
- **Error Tracking:** Sentry

---

## Migration Strategy
1. Phase 1: MVP (YouTube embed, anonymous users, Kazakh only)
2. Phase 2: Auth, i18n (RU, EN), Cloudinary
3. Phase 3: Advanced features (certificates, comments, favorites)
