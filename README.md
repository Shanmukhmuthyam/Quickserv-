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

## 👥 User Roles in Detail

**Customer**
- Registers/logs in with an email + password
- Browses services filtered by category (e.g. "Plumbing", "Electrical", "Cleaning") and by location
- Views a provider's profile and existing reviews before booking
- Creates a booking for a chosen service/provider
- Tracks booking status (`PENDING` → `CONFIRMED` → completed, via the `BookingStatus` enum)
- Leaves a review and rating for a provider after a booking

**Provider**
- Registers separately as a provider (linked to a user account) with category and location
- Lists the services they offer
- Views and manages bookings assigned to them (accepts, updates status)
- Views customer reviews left on their profile
- Can be blocked/unblocked by an admin

**Admin**
- Views platform-wide statistics (total users, providers, bookings) via a stats dashboard
- Manages users — views all registered users, deletes accounts
- Manages providers — blocks/unblocks a provider's ability to operate
- Manages service categories — adds new categories for providers/customers to use

Routing on the frontend enforces these roles: a `PrivateRoute` wrapper checks the logged-in user's role and redirects to the correct dashboard, or to `/login` if not authenticated.

---

## 🏗️ Architecture

```
┌─────────────────────┐        REST / JSON over HTTP        ┌──────────────────────────┐
│   React Frontend      │  ─────────────────────────────▶   │   Spring Boot Backend     │
│   (localhost:3000)    │  ◀─────────────────────────────   │   (localhost:7070)        │
└─────────────────────┘                                     └──────────────────────────┘
                                                                        │
                                                                        ▼
                                                              ┌──────────────────┐
                                                              │  H2 (in-memory)   │
                                                              │  or MySQL         │
                                                              └──────────────────┘
```

**Backend layering** follows the classic Spring MVC pattern:
- **Controller layer** — 7 REST controllers, one per resource (`UserController`, `ProviderController`, `ServiceController`, `CategoryServiceController`, `BookingController`, `ReviewController`, `AdminController`), each exposing endpoints under a distinct base path.
- **Service layer** — business logic sits here (validation, orchestration). For example, `BookingService` validates that a booking has a customer ID, provider ID, and service name before saving, and stamps it with a creation timestamp and default `PENDING` status.
- **Repository layer** — Spring Data JPA repositories (`UserRepository`, `BookingRepository`, etc.) extending `JpaRepository`, giving CRUD plus custom query methods (e.g. `findByCustomerId`, `findByProviderId`).
- **Entities** — `User`, `Provider`, `Service`, `Booking`, `Review`, `CategoryService`, mapped with Jakarta Persistence (`@Entity`) annotations using auto-generated identity primary keys.

**Frontend** is a Create React App project using **React Router v7** for client-side navigation. Each major screen is its own component/page (`Home`, `Login`, `Register`, `CustomerDashboard`, `CustomerServices`, `ProviderRegister`, `ProviderDashboard`, `ProviderBookings`, `ProviderReviews`, `AdminDashboard`, `AdminAddService`, `AdminAddCategory`, `CategoryServiceList`, `AddService`, `AddReview`), paired with its own CSS file. API calls use both `axios` and native `fetch` depending on the component, hitting the backend's REST endpoints directly.

---

## 🗃️ Data Model (Core Entities)

| Entity | Purpose | Key Fields |
|---|---|---|
| `User` | Base account for anyone (customer, provider, or admin) | id, name, email, password, role, location |
| `Provider` | Extended profile for users who offer services | id, linked userId, category, location, block status |
| `Service` | A service listing offered under a category | id, name, category, pricing/details |
| `CategoryService` | Master list of service categories admins maintain | id, name |
| `Booking` | A customer's request to a provider for a service | id, customerId, providerId, serviceName, bookingDate, status |
| `Review` | Customer feedback tied to a provider | id, providerId, rating/comment |

---

## 🔒 Security & Cross-Origin Setup

The backend uses a minimal `SecurityConfig` that disables CSRF, form login, and HTTP Basic auth (since this is a stateless JSON API, not a server-rendered app), while permitting all requests — authentication/authorization is handled at the application level (via login endpoints and role checks) rather than through Spring Security's filter chain. CORS is explicitly configured to accept requests only from the frontend's origin (`http://localhost:3000`), with all standard HTTP methods allowed and credentials support enabled.

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

## 📌 Notes on Project Assembly

The original source was a set of loose files without build tooling. To make it a runnable, cloneable project, the following was added/fixed:
- Converted the backend into a proper **Maven** project with `pom.xml` (Spring Boot 3.3, Web, Data JPA, Security, H2)
- Added `application.properties` defaulting to an **in-memory H2 database** so the API runs instantly with no external DB setup, with a commented-out MySQL block ready to switch to
- Added the **missing `public/` folder** (`index.html`, `manifest.json`, `robots.txt`) the CRA frontend needs to run at all
- Found and fixed a **port mismatch bug** — most frontend files called the backend on port `7070`, but two files (`ProviderReviews.js`, `AddReview.js`) called port `8080`; everything now consistently uses `7070`
- Removed a stray empty file and added proper `.gitignore`s so `node_modules`/`target` build artifacts don't get committed

## 📄 License

See [LICENSE](LICENSE).
