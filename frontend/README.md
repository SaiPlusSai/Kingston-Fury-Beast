# 🛡️ UrbanShield - Frontend

![UrbanShield Cover](https://placehold.co/1200x400/2563eb/ffffff?text=UrbanShield+Smart-City+Platform)

> **UrbanShield** is a citizen platform designed for reporting urban incidents and emergencies in real-time, connecting citizens with city administrators through interactive maps and detailed reports.

This repository contains the **Client Application (Frontend)** built with the latest web technologies to deliver a fast, reactive, and mobile-first experience.

---

## 🚀 Key Features

*   **🗺️ Interactive Maps:** Real-time visualization of incidents using Leaflet and MapLibre.
*   **📍 Geolocation:** Report incidents with exact location using the browser's API.
*   **📊 Admin Dashboard:** Comprehensive dashboard for monitoring reports, statistics, and user management.
*   **🎨 Modern & Responsive Design:** Clean interface built with Tailwind CSS v4, supporting dark/light mode and smooth animations (Framer Motion).
*   **🔐 Secure Authentication:** Role-based login and registration system (Citizen and Admin).

## 🛠️ Tech Stack

This project is built with modern tools focused on performance:

*   **Core:** [React 19](https://react.dev/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Animations:** [Framer Motion](https://www.framer.com/motion/)
*   **Maps:** [Leaflet](https://leafletjs.com/) & [MapLibre GL](https://maplibre.org/)
*   **HTTP Client:** [Axios](https://axios-http.com/)
*   **Routing:** [React Router v6](https://reactrouter.com/)

---

## ⚙️ Local Installation & Usage

To run this project in your local environment, follow these steps:

### 1. Prerequisites

*   Node.js (v18 or higher)
*   NPM or Yarn installed

### 2. Clone and Install

```bash
# Enter the frontend folder
cd frontend_urbanshield

# Install dependencies
npm install
```

### 3. Configure Environment Variables

Copy the example environment variables file and rename it:

```bash
cp .env.example .env
```
*(Make sure to fill in the necessary values in `.env`, such as the backend API base URL).*

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 📂 Project Structure

```text
src/
├── assets/         # Images, icons, and other static resources
├── components/     # Reusable components (Buttons, Modals, Maps)
├── context/        # Global state using React Context (Auth, Notifications)
├── hooks/          # Custom Hooks (useAsyncData, etc.)
├── pages/          # Main views (Login, Dashboard, Map, etc.)
├── services/       # API integration (Axios calls)
├── utils/          # Helper functions (formatters, validations)
├── App.jsx         # Root component and Router configuration
└── index.css       # Tailwind global styles
```

---

## 📜 Available Scripts

*   `npm run dev` - Starts the development server on port 5173.
*   `npm run build` - Builds the application for production in the `dist/` folder.
*   `npm run preview` - Serves the production build locally for testing.

## 🤝 Contributing

If you wish to contribute, please fork the repository, create a new branch for your feature, and submit a Pull Request.

---
*Developed to improve emergency management in urban environments.*
