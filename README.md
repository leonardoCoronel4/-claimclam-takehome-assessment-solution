# ClaimClam Project

This is a fullstack project that includes:
- **Frontend**: developed with Vue.js
- **Backend**: developed with Node.js and GraphQL

---

## Project Structure
```
claimclam-project/
├── frontend/           ← Vue.js project
├── backend/            ← Node.js server with GraphQL
├── docker-compose.yml  ← Docker configuration
└── README.md
```

---

## 🚀 Quick Start with Docker (Recommended)

The easiest way to run this project is using Docker. No need to install Node.js or manage dependencies manually.

### Prerequisites
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running the Project

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tu-usuario/claimclam-project.git
   cd claimclam-project
   ```

2. **Set up environment variables:**
   
   Make sure your `/backend/.env` file exists with the following content:
   ```env
   PODCAST_API_URL=https://601f1754b5a0e9001706a292.mockapi.io
   NODE_ENV=development
   PORT=4000
   ```

3. **Run the application:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - **Frontend (Vue.js)**: [http://localhost:5173](http://localhost:5173)
   - **Backend (GraphQL)**: [http://localhost:4000/graphql](http://localhost:4000/graphql)
   - **GraphiQL Interface**: Available at the backend URL for testing queries

5. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Sample GraphQL Query
You can test the GraphQL endpoint with this query:
```graphql
{
  podcasts(page: 1, limit: 5, search: "tech") {
    currentPage
    totalPages
    totalItems
    podcasts {
      id
      title
      categoryName
      publisherName
    }
  }
}
```

---

## 🛠️ Manual Setup (Alternative)

If you prefer to run the project without Docker:

### Requirements
- Node.js v16+ ([https://nodejs.org](https://nodejs.org))
- npm (included with Node)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tu-usuario/claimclam-project.git
   cd claimclam-project
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd ../backend
   npm install
   ```

4. **Configure environment variables:**
   
   Create `/backend/.env` with:
   ```env
   PODCAST_API_URL=https://601f1754b5a0e9001706a292.mockapi.io
   NODE_ENV=development
   PORT=4000
   ```
   
   Create `/frontend/.env` with:
   ```env
   VITE_SV_API_URL=http://localhost:4000
   ```

### Running the Project

1. **Run the backend:**
   ```bash
   cd backend
   node graphqlServer.js
   ```

2. **Run the frontend (in another terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:4000/graphql](http://localhost:4000/graphql)
