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

## Overview

The 3D Interactive Christmas Tree is a shared digital gathering space that allows users from anywhere in the world to leave their mark on a synchronized, 3D Tree. 

Built to replicate the joy and festivity of decorating a tree with friends, this application uses high-performance 3D rendering to create a magical environment where every ornament placed by a user is instantly visible to everyone else, creating a living piece of collaborative art.

<br>

## ✨ Features

* **🎄 Interactive 3D World**
    A fully immersive scene built with **React Three Fiber**. Users can pan, zoom, and rotate around the tree to find the perfect spot for their ornament. The environment features dynamic lighting, a glowing moon, and falling snow.

* **⚡ Real-Time Collaboration**
    Powered by **Firebase Firestore**, the tree updates instantly. When users hang ornaments onto the tree, the state is synchronized in millieconds; anyone from across the globe will see this change instantaneously. 

* **🤖 AI-Powered Safety & Moderation**
    Integrated **Xenova Transformers** (BERT models) run directly in the browser to analyze user messages, flagging and blocking inappropriate or harmful content before it ever reaches the database.

* **🎨 Customization**
    Users can personalize their contribution by selecting unique ornament colors and customizing it to their personal touch, as well as writing custom messages to leave their mark on the holiday season.

* **📱 Responsive & Accessible**
    The experience features adaptive camera animations that adjust automatically for mobile and desktop screens, ensuring a smooth experience on any device.

* **🎵 Atmospheric Audio**
    Includes a built-in music player to set the mood, complete with fade-in effects and playback controls.
  
* **

<br>

## 🛠 Tech Stack

* **Frontend:** React, React Three Fiber (R3F), Drei
* **3D Engine:** Three.js (WebGL)
* **Backend/Database:** Firebase Firestore (Real-time NoSQL)
* **Hosting:** Vercel

<br>

## 🧠 Under the Hood: Engineering Challenges

While the frontend is festive, the backend is robust. Here are the technical hurdles I solved to make this work:

### 1. Coordinate Space Transformation (World vs. Local)
**The Challenge:** The 3D tree model renders at a specific offset (`y: -100`). Three.js raycasting returns **World Coordinates** (where the camera sees the click), but the scene graph requires **Local Coordinates** relative to the tree's origin for ornaments to "stick" correctly during rotation.

**The Solution:** I implemented a vector transformation pipeline that translates and normalizes the raycast hit point into the tree's local space before committing to the database.

### 2. Interaction Heuristics (Drag vs. Click)
**The Challenge:** Users attempting to rotate the camera (OrbitControls) would inadvertently trigger "click" events, placing unwanted ornaments.

**The Solution:** I engineered a heuristic that tracks pointer velocity and distance. By calculating the delta between `pointerDown` and `pointerUp` events, the system distinguishes between an intentional click (delta < 10px) and a camera drag operation.

### 3. Rendering Optimization & Custom Kerning
**The Challenge:** Standard 3D text rendering caused overlapping characters for variable-width cursive fonts, and thousands of particles caused frame drops.

**The Solution:**
* **Manual Kerning Engine:** Wrote a custom character-spacing function that dynamically calculates offsets based on specific glyph widths (e.g., giving 'M' more space than 'i').
* **Ref-Based Animation:** Utilized `useRef` and direct DOM mutation within the Three.js render loop (`useFrame`) to animate particles at 60FPS without triggering React reconciliation cycles.

### 4. Database Integrity & Security
**The Challenge:** Protecting a public-facing database from deletion attacks or spam bots.

**The Solution:** Implemented **Firestore Security Rules** to create an "Append-Only" architecture. The backend strictly separates `read` (public), `create` (rate-limited), and `delete` (admin only) permissions, ensuring the tree remains a safe space for everyone.



## 💻 Local Development

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/repo-name.git](https://github.com/your-username/repo-name.git)
    cd repo-name
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

4.  **Run the celebration**
    ```bash
    npm run dev
    ```

<br>

## © Copyright
Copyright (c) 2025 Bosco Zhang. All Rights Reserved.

The source code in this repository is for demonstration purposes only. You may view the code for educational purposes or to evaluate my engineering skills, but you may not copy, modify, distribute, or use this code for commercial or non-commercial purposes without my explicit written permission.
