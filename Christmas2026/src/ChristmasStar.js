import * as THREE from 'three'; // detailed import based on your setup

export class ChristmasStar {
    constructor(scene, camera, treeTopPosition = new THREE.Vector3(0, 10, 0)) {
        this.scene = scene;
        this.camera = camera;
        this.pivotPoint = treeTopPosition; // Where the star floats relative to the tree

        // Internal state for the "delayed follow" logic
        this.dummyTarget = new THREE.Object3D();
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        // --- 1. GEOMETRY (Semi-Hollow) ---
        const points = 5;
        const outerR = 1.5; // Adjusted scale for a tree topper
        const innerR = 0.7;
        
        const shape = new THREE.Shape();
        const step = Math.PI / points;
        shape.moveTo(0, outerR);
        for (let i = 0; i < 2 * points; i++) {
            const r = (i % 2 === 0) ? outerR : innerR;
            const a = i * step;
            shape.lineTo(Math.sin(a) * r, Math.cos(a) * r);
        }
        shape.closePath();

        // The "Hollow" Cutout
        const holeShape = new THREE.Shape();
        shape.moveTo(0, outerR * 0.7);
        for (let i = 0; i < 2 * points; i++) {
            const r = (i % 2 === 0) ? outerR * 0.7 : innerR * 0.7;
            const a = i * step;
            holeShape.lineTo(Math.sin(a) * r, Math.cos(a) * r);
        }
        shape.holes.push(holeShape);

        const extrudeSettings = { depth: 0.4, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.05, bevelSegments: 3 };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center();

        // --- 2. SHADER (Dynamic Glow) ---
        this.uniforms = {
            time: { value: 0 },
            color1: { value: new THREE.Color(0xffd700) }, // Gold
            color2: { value: new THREE.Color(0xff8800) }  // Deep Orange
        };

        const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec3 vNormal;
                void main() {
                    float pulse = 0.5 + 0.5 * sin(time * 3.0);
                    // Fresnel rim lighting effect
                    float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
                    vec3 finalColor = mix(color1, color2, pulse);
                    gl_FragColor = vec4(finalColor * (1.2 + intensity), 1.0);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.Mesh(geometry, material);
        
        // Position it just above the tree top
        this.mesh.position.copy(this.pivotPoint);
        this.scene.add(this.mesh);
    }

    update() {
        // Update time for the pulse
        const time = this.clock.getElapsedTime();
        this.uniforms.time.value = time;

        // --- THE DELAYED FOLLOW LOGIC ---
        
        // 1. Position the dummy target where the star IS
        this.dummyTarget.position.copy(this.mesh.position);
        
        // 2. Make the dummy look at the camera
        this.dummyTarget.lookAt(this.camera.position);

        // 3. SLERP the real star towards the dummy rotation
        // 0.05 is the "Lag Factor". Lower = slower follow. Higher = faster.
        this.mesh.quaternion.slerp(this.dummyTarget.quaternion, 0.05);
    }
}