# Homeopathy Clinic Management

Full-stack project for managing a homeopathy clinic with:

- React + Vite frontend
- Spring Boot REST API
- MongoDB persistence
- Docker-based on-prem deployment

## Project Structure

- `frontend/` contains the clinic dashboard UI
- `backend/` contains the Spring Boot API and MongoDB models
- `mongodb/init.js` creates MongoDB collections, indexes, and sample data
- `docker-compose.yml` runs the full stack locally on any machine with Docker

## Features

- Dashboard metrics for patients, doctors, and appointments
- Patient intake form with symptom and history capture
- Doctor registry with specialization and availability
- Appointment scheduling with remedy notes
- MongoDB-backed CRUD endpoints

## Run With Docker

```bash
cp .env.example .env
docker compose up --build
```

This starts:

- frontend at `http://localhost`
- backend API at `http://localhost:8081`
- MongoDB at `mongodb://localhost:27017/homeopathy_clinic`

The MongoDB container automatically initializes the schema and loads sample clinic data from `mongodb/init.js` the first time the volume is created.

To stop the stack:

```bash
docker compose down
```

To reset the database and re-run initialization:

```bash
docker compose down -v
docker compose up --build
```

## Run Without Docker

```bash
mongod --dbpath /path/to/mongodb-data

cd backend
MONGODB_URI="mongodb://localhost:27017/homeopathy_clinic" mvn spring-boot:run

cd ../frontend
npm install
npm run dev
```

Then initialize MongoDB once:

```bash
mongosh "mongodb://localhost:27017/homeopathy_clinic" mongodb/init.js
```

Default frontend dev URL: `http://localhost:5173`

The Vite dev server proxies `/api` requests to `http://localhost:8081`.

## Environment Configuration

The app is now configured for portable deployment through environment variables:

- `MONGODB_URI` defaults to `mongodb://localhost:27017/homeopathy_clinic`
- `SERVER_PORT` defaults to `8081`
- `FRONTEND_PORT`, `BACKEND_PORT`, and `MONGODB_PORT` can be changed in `.env` for Docker Compose

## API Endpoints

- `GET /api/dashboard`
- `GET /api/patients`
- `GET /api/patients/{id}`
- `GET /api/patients/{id}/appointments`
- `POST /api/patients`
- `PUT /api/patients/{id}`
- `DELETE /api/patients/{id}`
- `GET /api/doctors`
- `POST /api/doctors`
- `PUT /api/doctors/{id}`
- `DELETE /api/doctors/{id}`
- `GET /api/appointments`
- `POST /api/appointments`
- `PUT /api/appointments/{id}`
- `DELETE /api/appointments/{id}`
