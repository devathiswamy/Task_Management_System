# Team Task Manager

A full-stack web application for team task management with role-based access control (Admin/Member).

## Features

- **Authentication**: Secure signup/login with JWT tokens
- **Project Management**: Create, manage, and track projects
- **Team Management**: Create teams and manage team members
- **Task Tracking**: Create tasks, assign to team members, track status
- **Dashboard**: Visual overview of tasks, status, and progress
- **Role-Based Access**: Admin and Member roles with different permissions
- **REST API**: Full RESTful API with Swagger documentation
- **Responsive UI**: Beautiful, modern UI with TailwindCSS

## Tech Stack

- **Frontend**: React.js with Vite, TailwindCSS
- **Backend**: Express.js with MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger UI

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-manager
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Configure environment variables:

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Running the Application

1. Start MongoDB (if using local):
```bash
mongod
```

2. Start the backend:
```bash
cd backend
npm start
```
Backend runs on http://localhost:5000

3. Start the frontend (in a new terminal):
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

### API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:5000/api-docs

## Project Structure

```
task-manager/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth & role middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── utils/          # Swagger setup
│   ├── server.js       # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── context/    # React context
│   │   ├── services/   # API services
│   │   ├── App.jsx     # Main app
│   │   └── main.jsx    # Entry point
│   ├── package.json
│   └── vite.config.js
├── README.md
└── .gitignore
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create team
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/dashboard` - Get dashboard stats
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete task

## Deployment

### Railway Deployment

1. **Backend**:
   - Connect your GitHub repository to Railway
   - Add MongoDB plugin from Railway marketplace
   - Set environment variables in Railway dashboard
   - Railway will automatically deploy from the backend directory

2. **Frontend**:
   - Create a new Railway project for frontend
   - Set environment variable: `VITE_API_URL` = your backend URL
   - Configure build: `npm install && npm run build`
   - Configure start: `npx serve dist -s`

### Environment Variables (Railway)

**Backend**:
- `PORT`: 5000
- `MONGODB_URI`: (from Railway MongoDB plugin)
- `JWT_SECRET`: (generate a secure random string)
- `NODE_ENV`: production
- `CORS_ORIGIN`: (your frontend URL)

**Frontend**:
- `VITE_API_URL`: (your backend URL)

<!-- ## Demo

[View Demo Video](#) -->

## License

MIT License