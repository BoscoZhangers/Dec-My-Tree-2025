# Christmas2026 🎄

A real-time, interactive 3D web application allowing users to collaboratively decorate a persistent 3D environment. Built with **React**, **Three.js**, and **Firebase**.

[**🔴 Live Demo**](https://christmas2026-xi.vercel.app/) | [**📂 GitHub Repo**](https://github.com/your-username/repo-name)

![Project Screenshot](./screenshot.png)

## 🛠 Tech Stack

* **Frontend:** React, React Three Fiber (R3F), Drei
* **3D Engine:** Three.js (WebGL)
* **Backend/Database:** Firebase Firestore (Real-time NoSQL)
* **Hosting:** Vercel

## 🚀 Key Features

* **Real-Time Collaboration:** User interactions (placing ornaments) are synced instantly across all connected clients via Firestore listeners.
* **Interactive 3D Environment:** Full OrbitControls allowing users to rotate, zoom, and inspect the scene from any angle.
* **Physics-Based Particle Effects:** Custom shader-like effects for star trails, text sparkles, and snow, managed via `useFrame` for 60FPS performance.
* **Smart Collision Detection:** Prevents object overlapping and invalid placements (e.g., on the trunk) using local coordinate vector math.

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
