# LVL.AI Frontend

A modern, responsive frontend for the LVL.AI task management and productivity platform built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Tech Stack**: Next.js 15, TypeScript, Tailwind CSS
- **Responsive Design**: Mobile-first approach with beautiful UI components
- **Authentication**: Complete auth system with login/register forms
- **Task Management**: Comprehensive task creation, editing, and tracking
- **Gamification**: XP system, achievements, and progress tracking
- **Real-time Updates**: Live task status updates and notifications
- **Dark Mode**: Built-in theme switching support
- **Accessibility**: WCAG compliant components and interactions

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom components with Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Icons**: Heroicons
- **Fonts**: Inter (Google Fonts)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Authentication pages
│   ├── register/
│   ├── tasks/             # Task management pages
│   ├── friends/            # Social features
│   ├── analytics/          # Analytics and insights
│   ├── settings/          # User settings
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Badge.tsx
│   ├── layout/           # Layout components
│   │   └── Sidebar.tsx
│   ├── auth/             # Authentication components
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── tasks/            # Task-specific components
│   └── forms/            # Form components
├── contexts/             # React Context providers
│   └── AuthContext.tsx
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── api/             # API client and services
│   │   └── client.ts
│   ├── constants/        # App constants
│   │   └── index.ts
│   ├── validations/     # Zod schemas
│   │   └── schemas.ts
│   └── utils.ts         # Utility functions
├── types/               # TypeScript type definitions
│   └── index.ts
└── providers/           # Additional providers
```

## 🎨 Design System

The frontend uses a comprehensive design system with:

- **Colors**: Primary, secondary, accent, success, warning, error variants
- **Typography**: Inter font family with consistent sizing
- **Spacing**: Tailwind's spacing scale with custom additions
- **Components**: Consistent button, input, card, and badge components
- **Animations**: Smooth transitions and micro-interactions
- **Dark Mode**: Complete dark theme support

## 🔧 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## 🔌 API Integration

The frontend integrates with the backend API through:

- **API Client**: Centralized HTTP client with interceptors
- **Authentication**: JWT token management
- **Error Handling**: Comprehensive error handling and user feedback
- **Type Safety**: Full TypeScript integration with backend types

### API Endpoints

- **Authentication**: `/api/auth/*`
- **Tasks**: `/api/tasks/*`
- **Users**: `/api/users/*`
- **Friends**: `/api/friends/*`
- **Analytics**: `/api/analytics/*`

## 🎯 Key Features

### Task Management
- Create, edit, and delete tasks
- Multiple task types (work, personal, health, etc.)
- Priority and status management
- Due dates and reminders
- Tags and categorization
- XP rewards and gamification

### User Experience
- Responsive design for all devices
- Dark/light theme switching
- Smooth animations and transitions
- Accessibility features
- Keyboard navigation support

### Social Features
- Friend system
- Task sharing and collaboration
- Achievement sharing
- Leaderboards and competitions

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

---

Built with ❤️ by the LVL.AI team