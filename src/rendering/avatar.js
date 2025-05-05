import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export const setupAvatar = async () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 5);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);

  // Try to load a realistic 3D head model
  let head = null;
  let mouth = null;
  try {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync('/assets/head.glb');
    head = gltf.scene;
    scene.add(head);
    // Optionally, find the mouth mesh by name for animation
    mouth = head.getObjectByName('Mouth');
  } catch (e) {
    // Fallback: simple placeholder
    const headGeometry = new THREE.SphereGeometry(1, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xf2d2bd,
      flatShading: false,
    });
    head = new THREE.Mesh(headGeometry, headMaterial);
    scene.add(head);

    // Add eyes
    const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 0.3, 0.8);
    head.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 0.3, 0.8);
    head.add(rightEye);
    // Add mouth (will be animated)
    const mouthGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.1);
    const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.3, 0.9);
    head.add(mouth);
  }

  return {
    scene,
    camera,
    head,
    mouth,
    // Expose methods to animate the face
    animateMouth: (openness) => {
      if (mouth) {
        mouth.scale.y = 1 + openness * 5;
        mouth.position.y = -0.3 - openness * 0.1;
      }
    },
  };
};
