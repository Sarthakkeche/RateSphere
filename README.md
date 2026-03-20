<h1 align="center">🌟 RateSphere: Advanced Store Rating System 🌟</h1>

<p align="center">
  A comprehensive, role-based full-stack web application designed for users to rate stores, owners to track performance, and administrators to manage the platform.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
</p>

---

## ⚙️ Project Overview

**RateSphere** goes beyond a simple rating app by implementing a robust **Role-Based Access Control (RBAC)** system. Built to handle complex entity relationships, the platform serves three distinct user types with tailored dashboards and permissions. 

It demonstrates proficiency in modern full-stack architecture, secure JWT authentication, strict input validation, and responsive UI design.

---

## 🧰 Tech Stack

### 💻 Frontend
* **React.js (via Vite):** For lightning-fast development and optimized builds.
* **Tailwind CSS:** For a highly responsive, modern, and clean light-theme UI.
* **Axios:** For handling API requests with interceptors.
* **React Router DOM:** For secure, role-based client-side routing.

### 🛠 Backend
* **Node.js & Express.js:** Handling RESTful API routing and server logic.
* **JSON Web Tokens (JWT):** For stateless, secure user sessions.
* **Bcrypt.js:** For cryptographic password hashing.

### 🗄 Database
* **MySQL:** Relational database handling complex joins between Users, Stores, and Ratings.

---

## 🚀 Key Features

### 🛡️ Role-Based Architecture
* **System Administrator:** Can manage the entire platform, add new internal users (Admins/Users), register new stores, assign Store Owners, and view platform-wide statistics.
* **Store Owner:** Possesses a dedicated dashboard to track their specific store's average rating and view a detailed log of which users submitted reviews.
* **Normal User:** Can browse the platform, search/sort stores, and submit or update their 1-to-5 star ratings.

### 🔒 Security & Validation
* **JWT Authentication:** Protected routes on both the frontend and backend.
* **Strict Form Validations:** Enforces complex password rules (8-16 chars, uppercase, special chars), string length limits, and prevents duplicate email registrations.
* **Secure Password Updates:** Users and Owners can securely update their passwords post-login, and utilize a pre-login Forgot Password flow.

### ✨ Dynamic UI/UX
* **Advanced Data Tables:** Includes sorting (Ascending/Descending) and real-time search filtering across dashboards.
* **Interactive Components:** Custom SVG star-rating components and responsive grid layouts.

---

## 📁 Project Structure
```text
RateSphere/
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── App.jsx         # Main application shell and routing
│   │   ├── index.css       # Tailwind directives
│   │   └── main.jsx        # React DOM entry point
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node + Express Backend
│   ├── index.js            # Main server file and API routes
│   ├── db.js               # MySQL connection pool
│   ├── .env                # Environment variables
│   └── package.json
└── README.md

🧑‍💻 Getting Started
✅ Prerequisites
Node.js (v16+)

MySQL (Local or Cloud-hosted like Railway)

Git

1️⃣ Clone the Repository
Bash
git clone [https://github.com/Sarthakkeche/RateSphere.git](https://github.com/Sarthakkeche/RateSphere.git)
cd RateSphere

2️⃣ Backend Setup
Bash
cd server
npm install
Create a .env file in the server directory and configure your database and JWT secret:

Code snippet
PORT=5000
MYSQL_URL="mysql://user:password@host:port/database"
JWT_SECRET="your_super_secret_key"
Start the backend server:

Bash
npm run dev
3️⃣ Frontend Setup
Open a new terminal window:

Bash
cd client
npm install
npm run dev


👨‍💻 Author
Sarthak Keche Full-Stack Developer

If you find this project helpful, feel free to ⭐ the repository!
Would you like me to walk you through the Git commands to push your project up to your repository so you can show it off?
