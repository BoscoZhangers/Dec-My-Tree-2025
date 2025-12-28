# Christmas2026 🎄

A real-time, interactive 3D web application allowing users to collaboratively decorate a persistent 3D environment. Built with **React**, **Three.js**, and **Firebase**.

[**🔴 Live Demo**](https://christmas2026-xi.vercel.app/) | [**📂 GitHub Repo**](https://github.com/your-username/repo-name)

![Project Screenshot](./screenshot.png)

<br>

## 🛠 Tech Stack

* **Frontend:** React, React Three Fiber (R3F), Drei
* **3D Engine:** Three.js (WebGL)
* **Backend/Database:** Firebase Firestore (Real-time NoSQL)
* **Hosting:** Vercel

<br>

## 🚀 Key Features

* **Real-Time Collaboration:** User interactions (placing ornaments) are synced instantly across all connected clients via Firestore listeners.
* **Interactive 3D Environment:** Full OrbitControls allowing users to rotate, zoom, and inspect the scene from any angle.
* **Physics-Based Particle Effects:** Custom shader-like effects for star trails, text sparkles, and snow, managed via `useFrame` for 60FPS performance.
* **Smart Collision Detection:** Prevents object overlapping and invalid placements (e.g., on the trunk) using local coordinate vector math.

<br>

## 🧠 Engineering Challenges & Solutions

### 1. Coordinate Space Transformation (World vs. Local)
**The Challenge:** The 3D tree model renders at a specific offset (`y: -100`) in the scene. Three.js raycasting returns **World Coordinates** (where the camera sees the click), but the 3D scene graph requires **Local Coordinates** relative to the tree's origin for ornaments to "stick" correctly when the model moves or scales.

**The Solution:** I implemented a vector transformation pipeline that normalizes the raycast hit point into the tree's local space before state updates occur.
```javascript
// Example logic snippet
const localHit = {
  x: e.point.x - TREE_POSITION[0],
  y: e.point.y - TREE_POSITION[1], // Adjusting for offset
  z: e.point.z - TREE_POSITION[2]
};
```

2. Interaction Heuristics (Drag vs. Click)
The Challenge: Users attempting to rotate the camera (OrbitControls) would inadvertently trigger "click" events, placing unwanted ornaments.

The Solution: I engineered a heuristic that tracks pointer velocity and distance. By calculating the Euclidean distance between pointerDown and pointerUp events, the system distinguishes between an intentional click (delta < 10px) and a camera drag operation, ignoring the latter.

3. Rendering Optimization & Custom Kerning
The Challenge: Standard 3D text rendering caused overlapping characters for variable-width fonts (like cursive script) and re-rendering the entire tree for particle effects caused frame drops.

The Solution:

Manual Kerning Engine: Wrote a custom character-spacing function that dynamically calculates offsets based on specific glyph widths (e.g., giving 'M' more space than 'i').

Ref-Based Animation: Utilized useRef and direct DOM mutation within the Three.js render loop (useFrame) to animate thousands of particles without triggering React reconciliation cycles.

4. Database Security
The Challenge: Protecting a public-facing database from deletion attacks or spam.

The Solution: Implemented Firestore Security Rules to create an "Append-Only" architecture. The frontend UI facilitates interaction, but the backend rules strictly separate read, create, and delete permissions, ensuring data integrity even if the client-side code is bypassed.

💻 Local Setup
Clone the repository

Bash

git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name
Install dependencies

Bash

npm install
Configure Firebase

Create a .env file in the root directory.

Add your Firebase API keys:

Code snippet

VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_id
Run the development server

Bash

npm run dev
📄 License
MIT License
