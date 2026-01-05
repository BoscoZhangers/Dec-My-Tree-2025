<div align="center">
  <img src="public/tree-favicon.svg" width="200" />
</div>

<h1 align = "center">
    Dec My Tree 2025
</h1>

<div align = "center"> A real-time, global celebration where code meets Christmas spirit. </div>

<br>
<br>

https://github.com/user-attachments/assets/a580406c-388c-4fa0-9705-1d0ef84719a0

<br>

## 🌎 Overview

The 3D Interactive Christmas Tree is a shared digital gathering space that allows users from anywhere in the world to leave their mark on a synchronized, 3D Tree. 

Built to replicate the joy and festivity of decorating a tree with friends, this application uses high-performance 3D rendering to create a magical environment where every ornament placed by a user is instantly visible to everyone else, creating a living piece of collaborative art.

<br>

## ✨ Features

* **Interactive 3D World**
    A fully immersive scene built with **React Three Fiber**. Users can pan, zoom, and rotate around the tree to find the perfect spot for their ornament. The environment features dynamic lighting, a glowing moon, and falling snow.

* **Real-Time Collaboration**
    Powered by **Firebase Firestore**, the tree updates instantly. When users hang ornaments onto the tree, the state is synchronized in millieconds; anyone from across the globe will see this change instantaneously. 

* **AI-Powered Safety & Moderation**
    Integrated **Xenova Transformers** (BERT models) run directly in the browser to analyze user messages, flagging and blocking inappropriate or harmful content before it ever reaches the database.

* **Customization**
    Users can personalize their contribution by selecting unique ornament colors and customizing it to their personal touch, as well as writing custom messages to leave their mark on the holiday season.

* **Admin Moderation**
    Admins and devs can use a special URL set with '?admin=true" to obtain access to an admin panel that allows quick and easy removal of ornaments via direct database interaction. 
  
* **Responsive & Mobile Accessible**
    The experience features adaptive camera animations that adjust automatically for mobile and desktop screens, ensuring a smooth experience on any device.

* **Atmospheric Audio**
    Includes a built-in music player to set the mood, complete with fade-in effects and playback controls.
  
<br>

## 🛠 Tech Stack

* **Frontend:** React, React Three Fiber (R3F), Drei
* **3D Engine:** Three.js (WebGL)
* **Backend/Database:** Firebase Firestore (Real-time NoSQL)
* **Hosting:** Vercel

<br>

## 💻 Local Development

1.  **Clone the repository**
    ```bash
    git clone https://github.com/BoscoZhangers/Dec-My-Tree-2025.git
    cd Dec-My-Tree-2025
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Firebase**
    Create a `.env` file in the root and add your keys:
    ```env
    VITE_FIREBASE_API_KEY=your_key
    VITE_FIREBASE_AUTH_DOMAIN=your_domain
    VITE_FIREBASE_PROJECT_ID=your_id
    ```

4.  **Run**
    ```bash
    npm run dev
    ```

<br>

## © Copyright
Copyright (c) 2025 Bosco Zhang. All Rights Reserved.

The source code in this repository is for demonstration purposes only. You may view the code for educational purposes or to evaluate my engineering skills, but you may not copy, modify, distribute, or use this code for commercial or non-commercial purposes without my explicit written permission.
