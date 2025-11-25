# Social Killers X Kerastase

This project is a web application built with **React 19**, **React Router 7**, and **Supabase**. It follows a modern development workflow with local Supabase instances running via Docker.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (v20 or higher recommended)
- **npm** or **yarn** (package manager)
- **Docker Desktop** (Required for local Supabase)
- **Git**
- **Supabase CLI** (Required for managing the local database)

### Installing Supabase CLI

If you don't have the Supabase CLI installed, you can install it via npm (macOS/Linux/Windows):

```bash
npm install -g supabase
```

Or via Homebrew (macOS):

```bash
brew install supabase/tap/supabase
```

---

## 🚀 Installation

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd social-killers-x-kerastase
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

---

## 🔄 CI/CD & Git Workflow

This project follows a strict Git workflow integrated with GitHub Actions.

### Git Workflow

- **Main Branch (`main`)**: Production-ready code. Protected branch.
- **Feature Branches**: Create a new branch for each feature/fix (e.g., `feature/user-auth`, `fix/login-bug`).
- **Pull Requests**: Open a PR to `main` to merge changes. CI checks must pass before merging.

### CI/CD Pipelines

We use GitHub Actions to automate testing and deployment:

1. **CI Pipeline (`ci.yml`)**
   - **Triggers**: On Pull Requests to `main`.
   - **Jobs**:
     - Runs unit and integration tests (`npm test`).
     - Builds the application (`npm run build`) to ensure no build errors.
     - Checks Supabase migrations and generated types.
     - Uploads coverage reports to Codecov.

2. **CD Pipeline (`cd.yml`)**
   - **Triggers**: On Pushes to `main` (after PR merge).
   - **Jobs**:
     - Re-runs tests and build to ensure stability.
     - **Deploys to Supabase**:
       - Links the project.
       - Pushes database migrations (`supabase db push`).

---

## ⚡️ Supabase Local Development Workflow

This project uses Supabase for the backend (Database, Auth, Storage, etc.). To develop locally, you need to start the local Supabase instance.

1. **Make sure Docker is running.**

2. **Start Supabase:**

   This command spins up all necessary Supabase services in Docker containers.

   ```bash
   supabase start
   ```

   _After a successful start, you will see the API URL, Anon Key, and other credentials in the terminal. Keep these handy._

3. **Stop Supabase:**

   When you are done working, you can stop the containers to save resources.

   ```bash
   supabase stop
   ```

4. **Reset Database (Optional):**

   If you need to wipe the database and start fresh (applying current migrations):

   ```bash
   supabase db reset
   ```

---

## 🛠 Environment Variables

Create a `.env` file in the root of your project to store your environment variables. You can copy the provided example file and fill in your credentials (found after running `supabase start`).

```bash
cp .env.example .env
```

The `.env` file should contain:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<your-local-anon-key>
```

> **Note:** Variables prefixed with `VITE_` are exposed to the client-side code in Vite.

---

## 🏃‍♂️ Running the Application

### Development Server

To start the React development server with HMR (Hot Module Replacement):

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Production Build

To build the application for production:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run start
```

---

## 🧪 Testing

This project uses **Jest** for unit and integration testing.

- **Run all tests:**
  ```bash
  npm test
  ```

- **Run tests in watch mode:**
  ```bash
  npm run test:watch
  ```

- **Generate coverage report:**
  ```bash
  npm run test:coverage
  ```

---

## 🐳 Docker

The project includes a `Dockerfile` for containerizing the frontend application.

### Build the Docker Image

```bash
docker build -t social-killers-app .
```

### Run the Container

```bash
docker run -p 3000:3000 social-killers-app
```

---

## 📂 Useful Commands Summary

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the app for production |
| `npm test` | Runs the test suite |
| `supabase start` | Starts local Supabase services (requires Docker) |
| `supabase stop` | Stops local Supabase services |
| `supabase status` | Shows the status and credentials of the local instance |
| `supabase db diff -f <name>` | Creates a new migration based on schema changes |
