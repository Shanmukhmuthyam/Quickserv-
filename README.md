# QuickServ 🛠️

**QuickServ** is a full-stack local services booking platform that connects **customers** with **service providers** (plumbers, electricians, cleaners, and more). Customers can browse providers by category and location, book a service, and leave a review — while providers manage their listings and bookings, and admins oversee the whole platform.

> Built as a full-stack demo project: **React** on the frontend, **Spring Boot** on the backend, with a clean REST API separating the two layers.

---

## ✨ Features

- **Role-based access** for three user types: `Customer`, `Provider`, and `Admin`
- **Customer flow** — register/login, browse services by category & location, book a provider, leave a review
- **Provider flow** — register as a provider, list services, manage incoming bookings, view customer reviews
- **Admin flow** — dashboard with platform stats, manage users, block/unblock providers, manage service categories
- **REST API** built with Spring Boot + Spring Data JPA
- **Client-side routing** with protected routes based on logged-in role (React Router)

---

## 🧱 Tech Stack

| Layer          | Technology                                                                 |
|----------------|------------------------------------------------------------------------------|
| Frontend       | React 19, React Router 7, Axios, CSS                                        |
| Backend        | Java 17, Spring Boot 3, Spring Web, Spring Data JPA, Spring Security (CORS) |
| Database       | H2 (in-memory, default) — easily switchable to MySQL                        |
| Build tools    | Maven (backend), npm / react-scripts (frontend)                             |

---

## 📁 Repository Structure

```
Quickserv-/
├── backend/                # Spring Boot REST API
│   ├── src/main/java/com/example/demo/
│   │   ├── controller layer   (UserController, ProviderController, BookingController, ...)
│   │   ├── service layer      (UserService, BookingService, ProviderService, ...)
│   │   ├── repository layer   (JPA repositories)
│   │   ├── entities           (User, Provider, Service, Booking, Review, CategoryService)
│   │   └── SecurityConfig.java, DemoApplication.java
│   ├── src/main/resources/application.properties
│   └── pom.xml
├── frontend/                # React single-page app
│   ├── public/
│   ├── src/
│   │   ├── pages/components  (Login, Register, Home, CustomerDashboard, ProviderDashboard,
│   │   │                       AdminDashboard, CategoryServiceList, ProviderReviews, ...)
│   │   └── App.js            (routing + role-based private routes)
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+ and npm

### 1. Run the backend

```bash
cd backend
mvn spring-boot:run
```

The API starts on **http://localhost:7070** using an in-memory H2 database — no external database setup required. Data resets on every restart.

To use MySQL instead, edit `backend/src/main/resources/application.properties`: comment out the H2 block, uncomment the MySQL block, and add the `mysql-connector-j` dependency in `pom.xml` (already stubbed in, just uncomment).

### 2. Run the frontend

```bash
cd frontend
npm install
npm start
```

The app opens on **http://localhost:3000** and talks to the backend at `http://localhost:7070`.

---

## 🔌 API Reference

| Resource            | Base path                | Key endpoints |
|---------------------|---------------------------|----------------|
| Users (auth)        | `/api/users`              | `POST /register`, `POST /login` |
| Providers           | `/api/providers`          | `POST /register`, `GET /all`, `GET /category/{category}`, `GET /{providerId}`, `GET /user/{userId}`, `GET /location/{location}`, `PUT /{providerId}` |
| Services            | `/api/services`           | `POST /add`, `GET /all`, `GET /category/{category}`, `GET /category/{category}/location/{location}`, `GET /search` |
| Category services   | `/api/category-services`  | `POST /add`, `GET /all`, `GET /name/{name}` |
| Bookings            | `/api/booking`            | `POST /create`, `GET /{id}`, `GET /customer/{id}`, `GET /provider/{id}`, `PUT /status/{id}`, `GET /all` |
| Reviews             | `/review`                 | `POST /add`, `GET /provider/{id}` |
| Admin               | `/api/admin`              | `GET /stats`, `GET /users`, `DELETE /user/{id}`, `PUT /provider/block/{id}`, `PUT /provider/unblock/{id}` |

CORS is pre-configured (`SecurityConfig.java`) to allow requests from `http://localhost:3000`.

---

## 🌐 Live Demo

_A live demo link can be added here once the app is deployed (see below)._

Suggested free-tier hosting:
- **Frontend:** [Vercel](https://vercel.com) or [Netlify](https://netlify.com) — deploy the `frontend/` folder directly from this repo.
- **Backend:** [Render](https://render.com) or [Railway](https://railway.app) — deploy the `backend/` folder as a Java/Maven web service. Remember to switch the H2 setup to a persistent database (e.g. Render's free Postgres/MySQL, or a managed MySQL instance) since H2-in-memory data is lost on restart, and to update the frontend's API base URL to the deployed backend URL.

---

## 📌 Notes

- This project was consolidated into standard Maven (backend) and Create React App (frontend) project layouts for a clean setup experience.
- Default backend port is `7070` (matches what the frontend expects) — this was fixed for consistency across the codebase.

## 📄 License

See [LICENSE](LICENSE).
