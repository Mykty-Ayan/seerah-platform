# User Stories: Seerah Platform

## Epic 1: Курс/Серия видео

### Story 1.1: Как админ, я хочу создать новый курс
**As an** admin  
**I want to** create a new course with title, description, lecturer, and thumbnail  
**So that** users can browse and watch video lectures

**Acceptance Criteria:**
- [ ] Админ заполняет форму: название, описание, лектор (dropdown), категория (dropdown), обложка (upload)
- [ ] После сохранения курс появляется в списке курсов
- [ ] Курс можно сделать "featured" (показывается на главной в "Сира бойынша дәрістер")
- [ ] Валидация: все поля обязательны кроме описания

**Tech Tasks:**
- [ ] Backend: POST /api/admin/courses
- [ ] Frontend Admin: CourseForm.tsx с form-validation
- [ ] Storage: Cloudinary upload для thumbnail

**Estimate:** 3 SP

---

### Story 1.2: Как админ, я хочу добавить видео в курс
**As an** admin  
**I want to** add videos to a course with title, YouTube URL, and order  
**So that** users can watch episodes in sequence

**Acceptance Criteria:**
- [ ] Админ выбирает курс (dropdown)
- [ ] Заполняет: название видео, YouTube URL, порядок (order_index)
- [ ] Видео появляется в списке эпизодов курса
- [ ] Валидация: YouTube URL валиден, order_index уникальный для курса

**Tech Tasks:**
- [ ] Backend: POST /api/admin/videos
- [ ] Frontend Admin: VideoForm.tsx
- [ ] Helper: функция для извлечения YouTube ID из разных форматов URL

**Estimate:** 2 SP

---

### Story 1.3: Как пользователь, я хочу видеть прогресс курса
**As a** user  
**I want to** see my progress for each course (circular progress bar)  
**So that** I know how much I've completed

**Acceptance Criteria:**
- [ ] На карточке курса на главной отображается круговой прогресс-бар (например, 33%)
- [ ] Прогресс = (completed_videos / total_videos) * 100
- [ ] Если пользователь не смотрел видео, прогресс = 0
- [ ] Обновление прогресса в реальном времени после просмотра видео

**Tech Tasks:**
- [ ] Backend: GET /api/courses/:id/progress (или включить в GET /api/courses)
- [ ] Frontend: CircularProgress.tsx компонент на SVG или recharts
- [ ] State: обновление после POST /api/progress/update

**Estimate:** 3 SP

---

### Story 1.4: Как пользователь, я хочу начать курс с кнопки "Бастау"
**As a** user  
**I want to** click "Бастау" button on featured courses  
**So that** I start watching from the first episode

**Acceptance Criteria:**
- [ ] Кнопка "Бастау" на featured курсах
- [ ] При клике переход на страницу курса (/courses/:id)
- [ ] Если есть продолжение (last_watched_video), открывать с него
- [ ] Если нет, открывать с первого эпизода

**Tech Tasks:**
- [ ] Frontend: обработчик клика, роутинг на CourseDetail
- [ ] Backend: GET /api/user/last-watched/:course_id (опционально)

**Estimate:** 2 SP

---

## Epic 2: Каталог видео с фильтрацией

### Story 2.1: Как пользователь, я хочу фильтровать курсы по категориям
**As a** user  
**I want to** filter courses by category tabs (Барлығы, Құран, Ақида, Фиқһ)  
**So that** I can find relevant courses quickly

**Acceptance Criteria:**
- [ ] Горизонтальные табы вверху каталога
- [ ] Активный таб подсвечен (зелёный фон)
- [ ] При клике на таб фильтруется список курсов
- [ ] "Барлығы" показывает все курсы (category_id = null или 0)

**Tech Tasks:**
- [ ] Backend: GET /api/courses?category_id=1
- [ ] Frontend: CategoryTabs.tsx с state management
- [ ] Query param: ?category_id=1 или ?category_slug=aqida

**Estimate:** 2 SP

---

### Story 2.2: Как пользователь, я хочу видеть карточку курса в списке
**As a** user  
**I want to** see course cards with thumbnail, title, lecturer, video count, and progress  
**So that** I can decide which course to watch

**Acceptance Criteria:**
- [ ] Карточка содержит: превью (thumbnail), название, аватар+имя лектора, количество видео, прогресс-бар
- [ ] При клике на карточку переход на страницу курса
- [ ] Адаптивная сетка (2 колонки на mobile, 3-4 на desktop)

**Tech Tasks:**
- [ ] Frontend: CourseCard.tsx компонент
- [ ] Responsive grid: CSS Grid или Tailwind grid-cols

**Estimate:** 2 SP

---

### Story 2.3: Как пользователь, я хочу видеть прогресс курса в линейном прогресс-баре
**As a** user  
**I want to** see linear progress bar on course cards  
**So that** I visually understand how much I've completed

**Acceptance Criteria:**
- [ ] Линейный прогресс-бар под названием курса
- [ ] Формат: "0%" → "33%" → "100%"
- [ ] Цвет прогресса: зелёный (как в дизайне)
- [ ] Если 0%, показывать "0" или скрывать

**Tech Tasks:**
- [ ] Frontend: LinearProgress.tsx компонент (или Shadcn Progress)
- [ ] Интеграция с CourseCard.tsx

**Estimate:** 1 SP

---

## Epic 3: Плеер видео и страница курса

### Story 3.1: Как пользователь, я хочу открыть страницу курса со списком эпизодов
**As a** user  
**I want to** see course details and list of episodes  
**So that** I can browse and select which episode to watch

**Acceptance Criteria:**
- [ ] Страница содержит: название курса, описание, аватар+имя лектора, превью
- [ ] Список эпизодов с: номером, названием, длительностью, статусом (просмотрено/не просмотрено)
- [ ] Клик на эпизод открывает плеер

**Tech Tasks:**
- [ ] Backend: GET /api/courses/:id (возвращает course + videos[])
- [ ] Frontend: CourseDetail.tsx страница
- [ ] Component: EpisodeList.tsx

**Estimate:** 3 SP

---

### Story 3.2: Как пользователь, я хочу смотреть видео в плеере
**As a** user  
**I want to** watch video in embedded YouTube player  
**So that** I can learn from the lecture

**Acceptance Criteria:**
- [ ] YouTube embed iframe
- [ ] Адаптивный плеер (16:9 aspect ratio)
- [ ] Autoplay следующего видео (опционально)
- [ ] Сохранение текущей позиции при перезагрузке (опционально, Phase 2)

**Tech Tasks:**
- [ ] Frontend: VideoPlayer.tsx с YouTube embed
- [ ] Hook: extractYouTubeId(url) helper

**Estimate:** 2 SP

---

### Story 3.3: Как пользователь, я хочу переключаться между эпизодами
**As a** user  
**I want to** navigate to next/previous episode  
**So that** I can continue watching in sequence

**Acceptance Criteria:**
- [ ] Кнопки "← Назад" и "Далее →" под плеером
- [ ] Если это первый эпизод, кнопка "Назад" disabled
- [ ] Если последний эпизод, кнопка "Далее" disabled или "Курс завершён"
- [ ] Клик обновляет плеер и URL (/courses/:id?episode=5)

**Tech Tasks:**
- [ ] Frontend: навигация с query param ?episode={num}
- [ ] State: currentEpisodeIndex, totalEpisodes

**Estimate:** 2 SP

---

### Story 3.4: Как пользователь, я хочу, чтобы прогресс обновлялся после просмотра
**As a** user  
**I want to** mark episode as watched automatically or manually  
**So that** my progress is tracked

**Acceptance Criteria:**
- [ ] После просмотра видео (определить через YouTube API или кнопка "Отметить как просмотренное")
- [ ] Прогресс курса увеличивается (+1 completed_video)
- [ ] Прогресс-бар обновляется
- [ ] Эпизод помечается как "просмотренный" (чекбокс или галочка в списке)

**Tech Tasks:**
- [ ] Backend: POST /api/progress/update
- [ ] Frontend: кнопка "Отметить как просмотренное" или авто по YouTube API на 90% просмотра
- [ ] State: refresh course progress after update

**Estimate:** 3 SP

---

### Story 3.5: Как пользователь, я хочу видеть, какие эпизоды уже просмотрены
**As a** user  
**I want to** see which episodes I've already watched  
**So that** I can skip them or track my learning

**Acceptance Criteria:**
- [ ] В списке эпизодов иконка ✓ или зелёная галочка для просмотренных
- [ ] Не просмотренные: серая иконка или номер
- [ ] Сохранение между сессиями (localStorage + backend для device_id)

**Tech Tasks:**
- [ ] Backend: GET /api/courses/:id/videos (возвращает is_watched для каждого видео)
- [ ] Frontend: условный рендеринг иконки в EpisodeList

**Estimate:** 2 SP

---

## Epic 4: Личный раздел "Менің иманым"

### Story 4.1: Как пользователь, я хочу видеть мои курсы
**As a** user  
**I want to** see a list of courses I've started or completed  
**So that** I can continue learning

**Acceptance Criteria:**
- [ ] Табы: "Начатые", "Завершённые", "Все"
- [ ] Карточка курса с прогрессом
- [ ] Сортировка: по last_watched_at (последний просмотренный сверху)

**Tech Tasks:**
- [ ] Backend: GET /api/user/courses?status=in_progress|completed
- [ ] Frontend: MyCourses.tsx страница

**Estimate:** 3 SP

---

### Story 4.2: Как пользователь, я хочу видеть общую статистику
**As a** user  
**I want to** see summary of my learning (total courses, completed, hours watched)  
**So that** I feel motivated

**Acceptance Criteria:**
- [ ] Карточки: "Курсов начато", "Курсов завершено", "Часов просмотрено"
- [ ] Обновление в реальном времени

**Tech Tasks:**
- [ ] Backend: GET /api/user/progress-summary
- [ ] Frontend: StatsCards.tsx компонент

**Estimate:** 2 SP

---

## Epic 5: Админ-панель

### Story 5.1: Как админ, я хочу видеть dashboard со статистикой
**As an** admin  
**I want to** see dashboard with key metrics  
**So that** I understand platform usage

**Acceptance Criteria:**
- [ ] Карточки: "Всего курсов", "Всего видео", "Всего пользователей", "Просмотров за сегодня"
- [ ] График просмотров за неделю (опционально, Phase 2)

**Tech Tasks:**
- [ ] Backend: GET /api/admin/dashboard
- [ ] Frontend Admin: Dashboard.tsx

**Estimate:** 2 SP

---

### Story 5.2: Как админ, я хочу управлять курсами (CRUD)
**As an** admin  
**I want to** create, edit, delete courses  
**So that** I can manage content

**Acceptance Criteria:**
- [ ] Список курсов с поиском/фильтрами
- [ ] Кнопки: "Создать", "Редактировать", "Удалить"
- [ ] Форма создания/редактирования с валидацией
- [ ] Подтверждение удаления ("Вы уверены?")

**Tech Tasks:**
- [ ] Backend: CRUD /api/admin/courses
- [ ] Frontend Admin: Courses.tsx, CourseForm.tsx

**Estimate:** 5 SP

---

### Story 5.3: Как админ, я хочу управлять лекторами (CRUD)
**As an** admin  
**I want to** create, edit, delete lecturers  
**So that** I can manage lecturer profiles

**Acceptance Criteria:**
- [ ] Форма: имя, био, аватар (upload)
- [ ] Список лекторов с аватарами
- [ ] Привязка аватара к Cloudinary/S3

**Tech Tasks:**
- [ ] Backend: CRUD /api/admin/lecturers
- [ ] Frontend Admin: Lecturers.tsx, LecturerForm.tsx

**Estimate:** 3 SP

---

### Story 5.4: Как админ, я хочу управлять категориями (CRUD)
**As an** admin  
**I want to** create, edit, delete categories  
**So that** I can organize courses

**Acceptance Criteria:**
- [ ] Форма: название, slug (auto-generated)
- [ ] Список категорий
- [ ] Валидация: slug уникальный

**Tech Tasks:**
- [ ] Backend: CRUD /api/admin/categories
- [ ] Frontend Admin: Categories.tsx, CategoryForm.tsx

**Estimate:** 2 SP

---

### Story 5.5: Как админ, я хочу загрузить обложку для курса
**As an** admin  
**I want to** upload course thumbnail  
**So that** courses look professional

**Acceptance Criteria:**
- [ ] File picker в форме курса
- [ ] Preview перед загрузкой
- [ ] Загрузка на Cloudinary/S3
- [ ] URL сохраняется в course.thumbnail_url

**Tech Tasks:**
- [ ] Backend: POST /api/admin/upload (signed Cloudinary upload)
- [ ] Frontend: FileUpload component

**Estimate:** 3 SP

---

## Epic 6: Мультиязычность (Phase 2)

### Story 6.1: Как пользователь, я хочу переключить язык интерфейса
**As a** user  
**I want to** switch UI language (KK, RU, EN)  
**So that** I can read in my preferred language

**Acceptance Criteria:**
- [ ] Dropdown в settings с выбором языка
- [ ] Переводы: табы, кнопки, навигация, placeholder'ы
- [ ] Сохранение выбранного языка (localStorage)

**Tech Tasks:**
- [ ] i18n: react-i18next setup
- [ ] Locales: JSON файлы (kk, ru, en)
- [ ] Frontend: LanguageSwitcher.tsx

**Estimate:** 3 SP

---

### Story 6.2: Как админ, я хочу добавить перевод для курса
**As an** admin  
**I want to** add translations for course title/description  
**So that** users see content in their language

**Acceptance Criteria:**
- [ ] В форме курса поля: title_kk, title_ru, title_en (tabs или accordion)
- [ ] API поддерживает мультиязычные поля (JSONB)
- [ ] Public API возвращает перевод по Accept-Language header

**Tech Tasks:**
- [ ] DB: изменить courses.title → courses.titles JSONB {kk: "...", ru: "..."}
- [ ] Backend: middleware для i18n, fallback на дефолт язык

**Estimate:** 5 SP

---

## Epic 7: Bottom Navigation и роутинг

### Story 7.1: Как пользователь, я хочу переключаться между разделами
**As a** user  
**I want to** navigate between Home, My Courses, Settings via bottom nav  
**So that** I can access different sections

**Acceptance Criteria:**
- [ ] Bottom navbar с 3 иконками: 🏠 Бас бет,  Менің иманым, ⚙️ Баптаулар
- [ ] Активный таб подсвечен (зелёный цвет)
- [ ] Плавная анимация перехода

**Tech Tasks:**
- [ ] Frontend: BottomNav.tsx с React Router
- [ ] Icons: Lucide или Shadcn icons

**Estimate:** 2 SP

---

# Story Map (MVP Release)

## Sprint 1: Базовая инфраструктура (Week 1-2)
- [x] Product Context
- [x] Epics
- [x] Technical Spec
- [ ] Setup Go backend (chi, gorm, postgres)
- [ ] Setup React frontend (Vite, Tailwind, Shadcn)
- [ ] DB migrations (8 tables)
- [ ] Authentication for admin (JWT)

**Stories:** 5.1, 5.2 (CRUD courses), 7.1 (bottom nav)

## Sprint 2: Курсы и каталог (Week 3-4)
**Stories:** 1.1, 1.2, 2.1, 2.2, 2.3, 5.3, 5.4

## Sprint 3: Плеер и прогресс (Week 5-6)
**Stories:** 3.1, 3.2, 3.3, 3.4, 3.5, 1.3, 1.4

## Sprint 4: Личный раздел и полировка (Week 7-8)
**Stories:** 4.1, 4.2, 5.5, багфиксы, UX improvements

## Sprint 5: Deploy + Beta (Week 9-10)
- Deploy на Railway
- Beta testing с реальными данными
- Bugfixes

---

# Acceptance Test Scenarios

## Scenario 1: User browses courses
**Given** user is on home page  
**When** user clicks category tab "Ақида"  
**Then** only courses with category "Ақида" are displayed  
**And** progress bars show user's progress

## Scenario 2: User watches video
**Given** user is on course detail page  
**When** user clicks on episode 1  
**Then** YouTube video plays in embed player  
**And** "Next" button is enabled  
**And** episode 1 is marked as watched after completion

## Scenario 3: Admin adds course
**Given** admin is logged in  
**When** admin fills course form and clicks "Save"  
**Then** course is created in database  
**And** course appears in public catalog  
**And** admin sees success message

## Scenario 4: Progress tracking
**Given** user watched 34 of 102 videos in a course  
**When** user views home page  
**Then** course card shows 33% progress (circular + linear)  
**And** progress is saved to backend

---

# Estimates Summary
- **Total Stories:** 23
- **Total Story Points:** ~68 SP
- **Team Velocity (assumed):** 15 SP/sprint
- **Sprints Needed:** ~5 sprints (10 weeks)

**MVP Target:** 8-10 weeks with 1 full-stack developer
