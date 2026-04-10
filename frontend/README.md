# Seerah Frontend

React + Vite + TypeScript frontend for Seerah Platform

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui (custom)
- **Routing:** React Router v6
- **i18n:** react-i18next
- **Icons:** Lucide React

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   └── progress.tsx
│   │   └── BottomNav.tsx    # Bottom navigation bar
│   ├── i18n/
│   │   ├── locales/
│   │   │   ├── kk/          # Kazakh
│   │   │   ├── ru/          # Russian
│   │   │   └── en/          # English
│   │   └── index.ts
│   ├── lib/
│   │   └── utils.ts         # Utility functions (cn)
│   ├── App.tsx              # Main app with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Tailwind + custom styles
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── vite.config.ts
```

## Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Features

### ✅ Implemented
- React Router with 3 routes (/, /my-courses, /settings)
- Bottom navigation component (mobile-first)
- Tailwind CSS with custom theme
- Shadcn/ui components (Button, Progress)
- i18n setup (KK, RU, EN)
- Proxy to backend API (/api → localhost:8080)

### 🚧 TODO (Future Sprints)
- CourseCard component with progress bars
- VideoPlayer component (YouTube embed)
- API integration with backend
- Course detail page
- User progress tracking
- Category filtering
- Admin panel (separate app)

## Styling

### Tailwind Config
- Custom colors (green primary for Islamic theme)
- Responsive design (mobile-first)
- Bottom nav for mobile, desktop-friendly layout

### Theme Colors
- Primary: Green (#16a34a) — Islamic theme
- Background: White/Light gray
- Foreground: Dark gray

## i18n

Default language: Kazakh (kk)

Usage in components:
```tsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  return <h1>{t('home.title')}</h1>
}
```

## API Proxy

Development proxy configured in `vite.config.ts`:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- Proxy: `/api/*` → `http://localhost:8080/api/*`

## Deployment

### Vercel/Netlify
```bash
npm run build
# Deploy dist/ folder
```

### Docker (optional)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## License

MIT
