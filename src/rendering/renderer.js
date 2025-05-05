import * as THREE from 'three';

export const setupRenderer = async () => {
  if (await checkWebGPUSupport()) {
    // In a real implementation, you would use a WebGPU renderer
    // For now, we'll just use WebGL but flag it for future replacement
    console.log("WebGPU supported! Using WebGL for now as a placeholder");
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.webgpuSupported = true;
    return renderer;
  } else {
    console.log("Using WebGL fallback");
    return new THREE.WebGLRenderer({ antialias: true });
  }
};