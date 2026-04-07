# 🚉 RailPulse — Live Mumbai Rail Network Tracker

[![Live Demo](https://rail-pulse-project.vercel.app)
[![Version](https://img.shields.io/badge/Version-1.0.0-purple?style=for-the-badge)](https://github.com/Sudip294/RailPulse)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**RailPulse** is a premium, real-time crowdsourced platform designed specifically for the millions of daily commuters navigating Mumbai's lifelines: the Western and Central local train lines. Built with modern aesthetics and accessibility, RailPulse provides commuters with live, verified updates to make every journey safer and more efficient.

---

## 📸 Screenshots & Showcase

| ![Mockup 1](./frontend/public/railpulse%20ss1.png) | ![Mockup 2](./frontend/public/railpulse%20ss2.png) |
| :---: | :---: |
| *Modern Aurora Glassmorphism UI* | *Live Crowdsourced Reports* |

---

## ⚡ Key Features

### 🚨 Real-Time Commuter Intelligence
*   **Crowdsourced Reports**: Live updates on **Heavy Crowds**, **Train Delays**, and **Sudden Platform Changes**.
*   **Trust Guard**: Built-in **Verify / Fake** voting system ensuring the feed remains accurate and reliable.
*   **Auto-Fresh**: Reports automatically expire within 24 hours to keep the feed relevant.

### 🌐 Social & Accessibility
*   **Global Community Chat**: Connect with fellow commuters instantly via a real-time, Socket.io-powered chat sidebar.
*   **Multi-Lingual Support**: Accessibility for all with support for **7+ Indian languages** (Hindi, Marathi, Gujarati, etc.) via integrated Google Translate.
*   **🔊 Speech-to-Listen**: Integrated **Text-to-Speech (TTS)** engine to listen to reports hands-free during a rush.

### 📱 Premium PWA Experience
*   **Install Everywhere**: Fast, lightweight **Progressive Web App** installable on Android, iOS, and Desktop.
*   **Native Notifications**: OS-level push notifications to keep you informed of critical delays even when offline.
*   **Aesthetics**: Stunning **Dark-Mode-First** design with Aurora glow effects and custom cursors.

---

## 🛠 Tech Stack

**Frontend:**
*   **React** (Vite) & **Framer Motion** for premium animations.
*   **Lucide Icons** for a crisp, modern UI.
*   **Vite PWA Plugin** for native app capabilities.

**Backend:**
*   **Node.js** & **Express** REST API.
*   **Socket.io** for real-time WebSocket syncing.
*   **MongoDB** (Mongoose) for secure data storage.
*   **Web Push** & VAPID for native notification delivery.

---

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js (v16.0+)
*   MongoDB Atlas Account
*   VAPID Keys (for push notifications)

### 2. Backend Setup
```bash
git clone https://github.com/Sudip294/RailPulse.git
cd RailPulse/backend
npm install
# Create a .env file with your MONGO_URI and VAPID Keys
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🤝 Contribution
Contributions are welcome! Feel free to open an issue or submit a pull request to help improve the commute for millions in Mumbai.

## 📄 License
This project is licensed under the **MIT License**.

---

### Created with ❤️ for Mumbai Commuters by [Sudip294](https://github.com/Sudip294) 🚉🔥
