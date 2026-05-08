# Containerised Car Rental Full-Stack Application

This project is a containerised full-stack car rental application built with React, Node.js, PostgreSQL, Docker Compose, and Nginx reverse proxy.

## Tech Stack

- Frontend: React, Tailwind CSS, Axios
- Backend: Node.js, Express, JWT, bcrypt
- Database: PostgreSQL
- Containerisation: Docker, Docker Compose
- Reverse proxy: Nginx

## Architecture

```text
Browser
  |
  v
Nginx reverse proxy :80
  |---------------------> React frontend container
  |
  | /api and /health
  v
Node.js backend container :5000
  |
  v
PostgreSQL container :5432
```

## Project Structure

```text
MCA_Final_Project/
  car-rental-backend/
    Dockerfile
    server.js
    package.json
    .env.example
  car-rental-frontend/
    Dockerfile
    nginx/default.conf
    src/
    package.json
    .env.example
  database/
    init.sql
  nginx/
    default.conf
  docker-compose.yml
  README.md
```

## Docker Services

- `postgres`: PostgreSQL database with persistent volume and schema seed file.
- `backend`: Express API connected to PostgreSQL using Docker service networking.
- `frontend`: React production build served by Nginx.
- `nginx`: Public reverse proxy. It exposes the complete application on port `80`.

## Run With Docker Compose

From the project root:

```bash
docker compose up --build
```

Open:

```text
http://localhost
```

Backend health check:

```text
http://localhost/health
```

Stop containers:

```bash
docker compose down
```

Stop containers and remove database volume:

```bash
docker compose down -v
```

## Default Demo Login

Admin account seeded by `database/init.sql`:

```text
Email: admin@rentwheels.com
Password: admin123
```

## Environment Variables

The Docker Compose file sets production container variables directly. For local development, use:

Backend:

```text
car-rental-backend/.env.example
```

Frontend:

```text
car-rental-frontend/.env.example
```

Important Docker values:

```text
DB_HOST=postgres
REACT_APP_API_URL=/api
```

Inside Docker, the backend must use `postgres` as the database host because `postgres` is the Compose service name.

## Nginx Routing

The root Nginx reverse proxy routes traffic like this:

```text
/       -> frontend container
/api    -> backend container
/health -> backend container
```

This means users only need one URL:

```text
http://localhost
```

## Database Initialisation

PostgreSQL automatically runs:

```text
database/init.sql
```

on the first container startup. It creates:

- `users`
- `cars`
- `bookings`
- `payments`

It also inserts an admin account and sample cars.

If you change `init.sql` after the database volume has already been created, recreate the volume:

```bash
docker compose down -v
docker compose up --build
```

## Useful Local Development Commands

Backend only:

```bash
cd car-rental-backend
npm install
npm run dev
```

Frontend only:

```bash
cd car-rental-frontend
npm install
npm start
```

## API Summary

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/cars`
- `GET /api/cars/:id`
- `GET /api/cars/:id/availability`
- `POST /api/bookings`
- `GET /api/bookings/my-bookings`
- `PUT /api/bookings/:id/cancel`
- `POST /api/payments`
- `GET /api/admin/stats`
- `GET /api/admin/bookings`
- `PUT /api/admin/bookings/:id/approve`
- `PUT /api/admin/bookings/:id/decline`
- `GET /api/admin/users`
- `DELETE /api/admin/users/:id`
- `POST /api/admin/cars`
- `PUT /api/admin/cars/:id`
- `DELETE /api/admin/cars/:id`

## Project Outcome

The application demonstrates full-stack deployment using Docker Compose with service orchestration, container networking, persistent PostgreSQL storage, React static serving, Node.js API deployment, and Nginx reverse proxy exposure.
