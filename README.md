# Three-Tier Application

This project demonstrates a simple three-tier architecture:
- Frontend: static HTML/CSS/JavaScript served by Nginx
- Backend: Node.js API service
- Database: PostgreSQL

## Run locally

```bash
docker compose up --build
```

Then open:
- http://localhost:9090
- http://localhost:3001/health

## DevOps-friendly structure

- Docker Compose for local orchestration
- Dockerfiles for each service
- Database initialization script
- Health endpoint on the backend
