# 🌐 Social Media Platform

A simple, modern social media application built using **React**,
**TypeScript**, and **Supabase**.\
Users can create posts, like & comment, follow others, and chat through
real-time messaging --- all inside a clean, responsive UI.

## ✅ Features

### 🔐 Authentication

-   Secure signup & login\
-   User profiles stored in Supabase

### 📝 Posts

-   Create, edit, and delete posts\
-   Real-time updates for new posts\
-   Like & comment system

### 👤 Profiles

-   Customizable profile (bio, photo, etc.)\
-   View posts by individual users

### 👥 Social Interactions

-   Follow/unfollow users\
-   See posts from people you follow\
-   Private messaging with real-time updates

### ⚙️ Technical Features

-   React + TypeScript\
-   Responsive UI with Tailwind CSS + shadcn/ui\
-   React Query for data fetching\
-   React Router for navigation\
-   Supabase for backend + real-time database

## 📦 Tech Stack

### Frontend

-   React 18\
-   TypeScript\
-   Vite\
-   Tailwind CSS\
-   shadcn/ui\
-   React Query\
-   React Router

### Backend (Supabase)

-   PostgreSQL\
-   Row Level Security\
-   Realtime subscriptions\
-   Auth system

## 🛠️ Getting Started (Local Setup)

### ✅ 1. Prerequisites

Make sure you have installed:

-   **Node.js 18+**
-   **npm**\
-   A **Supabase project**

### ✅ 2. Clone the Repository

``` bash
git clone <your-repo-url>
cd <project-directory>
```

### ✅ 3. Install Dependencies

``` bash
npm install
```

### ✅ 4. Setup Environment Variables

Create a `.env` file in the root folder:

``` env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### ✅ 5. Start Development Server

``` bash
npm run dev
```

App will run at:

    http://localhost:5173

### ✅ 6. Build for Production

``` bash
npm run build
```

Preview production build:

``` bash
npm run preview
```

## 📁 Project Structure

    ├── src/
    │   ├── components/
    │   │   ├── ui/
    │   │   ├── Navbar.tsx
    │   │   ├── PostCard.tsx
    │   │   ├── LikeButton.tsx
    │   │   ├── CommentsSection.tsx
    │   │   ├── FollowButton.tsx
    │   │   └── ...
    │   ├── pages/
    │   │   ├── Auth.tsx
    │   │   ├── Feed.tsx
    │   │   ├── Profile.tsx
    │   │   ├── Messages.tsx
    │   │   └── ...
    │   ├── hooks/
    │   ├── lib/
    │   ├── integrations/
    │   │   └── supabase/
    │   └── App.tsx
    ├── supabase/
    │   └── migrations/
    └── public/

## 🗄️ Database Schema

### Tables

-   `profiles` -- user info\
-   `posts` -- all posts\
-   `likes` -- likes on posts\
-   `comments` -- comments on posts\
-   `follows` -- follower/following system\
-   `messages` -- private chat messages

✅ Protected with RLS (Row Level Security)

### Frontend

-   Vercel
-   Netlify
-   Cloudflare Pages

### Backend

-   Supabase

## 🤝 Contributing

1.  Fork the repo\
2.  Create a new branch\
3.  Commit your changes\
4.  Push your branch\
5.  Create a Pull Request

## 📄 License

This project is licensed under the **MIT License**.
