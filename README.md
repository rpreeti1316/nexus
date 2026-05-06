# Nexus — Team Task Manager

A full-stack web application for creating projects, assigning tasks, and tracking progress with **role-based access control (Admin/Member)**.

## 🚀 Live Demo
> _Add your Railway URL here after deployment_

## ✨ Features

- **Authentication** — Signup/Login with JWT tokens
- **Project Management** — Create, edit, delete projects
- **Team Management** — Add/remove members, assign roles (Admin/Member)
- **Task Board** — Kanban-style board with To Do, In Progress, Done columns
- **Task Tracking** — Create tasks with priority, assignee, due dates
- **Dashboard** — Overview with stats, recent activity, overdue alerts
- **Role-Based Access Control**
  - **Admin**: Full CRUD on projects and tasks, manage members
  - **Member**: Can update task status only
- **Responsive Design** — Works on desktop, tablet, and mobile

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Styling | Vanilla CSS (Dark Theme) |
| Deployment | Railway |

## 📦 Project Structure

```
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   └── roleCheck.js      # Role-based access
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js           # Register, Login, Me
│   │   ├── projects.js       # CRUD + members
│   │   ├── tasks.js          # CRUD + status updates
│   │   └── dashboard.js      # Aggregated stats
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth context
│   │   ├── pages/            # App pages
│   │   └── utils/            # API utility
│   └── vite.config.js
└── README.md
```

## 🏁 Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (free tier)

### Step 1: Set up MongoDB Atlas (Free)

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click **"Try Free"** and create an account
3. Create a **free shared cluster** (M0 tier — completely free)
4. **Set up Database Access:**
   - Go to Security → Database Access
   - Click "Add New Database User"
   - Create a username and password (save these!)
   - Set privileges to "Read and write to any database"
5. **Set up Network Access:**
   - Go to Security → Network Access
   - Click "Add IP Address"
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0) for development
6. **Get Connection String:**
   - Go to Databases → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### Step 2: Configure Backend

```bash
cd backend

# Install dependencies
npm install

# Edit .env file — replace the MONGODB_URI with your connection string:
# MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/team-task-manager?retryWrites=true&w=majority
```

### Step 3: Configure Frontend

```bash
cd frontend

# Install dependencies
npm install
```

### Step 4: Run Locally

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:3000`

## 🚢 Deploy to Railway

### Step 1: Create Railway Account
1. Go to [https://railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Deploy Backend
1. Click **"New Project"** → **"Deploy from GitHub Repo"**
2. Select your repository
3. Set **Root Directory** to `backend`
4. Add environment variables:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = a long random secret string
   - `JWT_EXPIRE` = 7d
   - `PORT` = 5000
5. Deploy!

### Step 3: Deploy Frontend
1. In the same Railway project, click **"New Service"** → **"GitHub Repo"**
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   - `VITE_API_URL` = `https://your-backend-url.railway.app/api`
4. Set **Build Command** to `npm run build`
5. Set **Start Command** to `npx serve dist -s`
6. Deploy!

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Sign up |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/projects` | Auth |
| POST | `/api/projects` | Auth |
| GET | `/api/projects/:id` | Member+ |
| PUT | `/api/projects/:id` | Admin |
| DELETE | `/api/projects/:id` | Admin |
| POST | `/api/projects/:id/members` | Admin |
| DELETE | `/api/projects/:id/members/:userId` | Admin |

### Tasks
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/projects/:id/tasks` | Member+ |
| POST | `/api/projects/:id/tasks` | Admin |
| PUT | `/api/tasks/:taskId` | Member+ |
| DELETE | `/api/tasks/:taskId` | Admin |

### Dashboard
| Method | Endpoint |
|--------|----------|
| GET | `/api/dashboard` |

## 👥 Role-Based Access

| Feature | Admin | Member |
|---------|-------|--------|
| View projects & tasks | ✅ | ✅ |
| Create/edit/delete projects | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create/edit/delete tasks | ✅ | ❌ |
| Update task status | ✅ | ✅ |
| View dashboard | ✅ | ✅ |

## 📝 License
MIT
