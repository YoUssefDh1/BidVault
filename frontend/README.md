# Bidding Site - Frontend

A real-time auction platform built with React and Vite. Users can list products for auction, place bids, and compete in real-time bidding wars with WebSocket support for live updates.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running Locally](#running-locally)
- [Available Scripts](#available-scripts)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Project Architecture](#project-architecture)

## Features

- **User Authentication**: Register and login system with JWT tokens
- **Product Listings**: Browse and search products by categories
- **Real-Time Auctions**: Live bidding with real-time price updates
- **Auction Dashboard**: Track active auctions and bidding history
- **User Profiles**: Manage user information and viewing history
- **Favorites System**: Save favorite products for later
- **Admin Dashboard**: Manage users, products, and platform settings
- **Category System**: Browse products organized by categories
- **Notification System**: Real-time alerts for auction events
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

**Frontend:**
- **React 19.2** - UI library for building components
- **Vite 7.3** - Next generation frontend build tool with HMR
- **React Router 7.13** - Client-side routing
- **Zustand 5.0** - Lightweight state management
- **Axios 1.13** - HTTP client for API requests
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **date-fns 4.1** - Date manipulation library

**Backend:**
- **FastAPI** - Python web framework
- **SQLAlchemy** - ORM for database operations
- **JWT** - Token-based authentication
- **WebSockets** - Real-time communication

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable React components
│   │   ├── AuthModal.jsx        # Authentication modal
│   │   ├── Navbar.jsx           # Navigation bar
│   │   ├── CategoryBar.jsx       # Category selection
│   │   ├── FavouriteButton.jsx   # Favorite toggle
│   │   ├── NotificationBell.jsx  # Notifications
│   │   └── ...
│   ├── pages/            # Page components (routes)
│   │   ├── Home.jsx             # Homepage
│   │   ├── AuctionList.jsx       # All auctions
│   │   ├── AuctionDetail.jsx     # Auction details
│   │   ├── Profile.jsx          # User profile
│   │   ├── Admindashboard.jsx    # Admin panel
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand state management
│   ├── api.js            # API client setup
│   ├── App.jsx           # Root component
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── eslint.config.js      # ESLint rules
└── index.html            # HTML template
```

## Getting Started

### Prerequisites

- **Node.js** (v16+) and **npm** (v7+) or **yarn**
- **Backend running** on `http://localhost:8000`

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Bidding-site/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Environment Setup

Create a `.env` (if needed) or check `api.js` to ensure the backend API endpoint is correctly configured:

```javascript
// src/api.js
const API_BASE_URL = "http://localhost:8000";
```

### Running Locally

1. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

2. **Ensure the backend is running:**
   ```bash
   cd ../backend
   python main.py
   ```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## Development

### Folder Organization

- **Components** in `src/components/` - Reusable UI elements
- **Pages** in `src/pages/` - Full page components
- **Store** in `src/store/` - Zustand state management
- **Hooks** in `src/hooks/` - Custom React hooks
- **API** in `src/api.js` - Centralized API configuration

### Code Style

- ESLint is configured for code quality
- Run `npm run lint` to check for issues
- Tailwind CSS for styling - see [COLOR_SYSTEM.md](./COLOR_SYSTEM.md)

### State Management

This project uses **Zustand** for state management. Store files are located in `src/store/`:

```javascript
// Example store
import create from 'zustand';

const useStore = create((set) => ({
  state: 0,
  increment: () => set((state) => ({ state: state.state + 1 })),
}));
```

## Building for Production

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Output:**
   - Optimized files in `dist/` directory
   - Ready for deployment

3. **Preview build:**
   ```bash
   npm run preview
   ```

## Project Architecture

### Authentication Flow
- User registers/logs in via `AuthModal`
- JWT token stored in browser
- Token sent with API requests for authentication
- Admin dashboard restricted to admin users

### Real-Time Updates
- WebSocket connection for live auction updates
- Bid notifications via WebSocket
- Real-time price updates

### State Management
- **Auth Store** - User login state and JWT token
- **UI Store** - Modal states, notifications
- **Component State** - Local component state with React hooks

### API Integration
- Axios configured in `api.js` for centralized requests
- Base URL: `http://localhost:8000`
- Auto-attach JWT token to requests

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5173 already in use | Change port in `vite.config.js` or kill process using port |
| Backend connection errors | Ensure backend is running on `http://localhost:8000` |
| Module not found | Run `npm install` to ensure all dependencies are installed |
| CORS errors | Check backend CORS configuration for frontend origin |

## License

[Add your license information here]

---

For backend documentation, see the [backend README](../backend/README.md) or backend code.
