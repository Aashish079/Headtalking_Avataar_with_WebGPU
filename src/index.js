import * as THREE from "three";
import { checkWebGPUSupport } from "./utils/webgpu";
import { setupRenderer } from "./rendering/renderer";
import { setupAvatar } from "./rendering/avatar";
import { AudioProcessor } from "./audio/processor";
import { LipSyncModel } from "./models/lipSyncModel";

class TalkingAvatarDemo {
  constructor() {
    this.container = null;
    this.renderer = null;
    this.avatar = null;
    this.audioProcessor = null;
    this.lipSyncModel = null;
    this.animationFrameId = null;
    this.fpsCounter = { lastTime: 0, frames: 0, fps: 0 };
  }

  async init() {
    this.container = document.getElementById("avatar-container");

    // Check WebGPU support
    const webgpuSupported = await checkWebGPUSupport();
    const statusElement = document.getElementById("webgpu-status");
    statusElement.textContent = webgpuSupported
      ? "WebGPU supported! (Demo uses WebGL for rendering, WebGPU for ML)"
      : "WebGPU not supported. Using WebGL fallback.";

    // Setup renderer
    this.renderer = await setupRenderer();
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.container.appendChild(this.renderer.domElement);

    // Setup avatar
    this.avatar = await setupAvatar();

    // Setup audio processor
    this.audioProcessor = new AudioProcessor();

    // Setup lip sync model
    this.lipSyncModel = new LipSyncModel();
    await this.lipSyncModel.load();

    // Setup UI
    this.setupUI();

    // Handle window resize
    window.addEventListener("resize", this.handleResize.bind(this));

    // Start rendering loop (but not audio processing yet)
    this.animate();
  }

  setupUI() {
    const startButton = document.getElementById("start-mic");
    const stopButton = document.getElementById("stop-mic");

    startButton.addEventListener("click", async () => {
      const success = await this.audioProcessor.initMicrophone();
      if (success) {
        startButton.disabled = true;
        stopButton.disabled = false;
      }
    });

    stopButton.addEventListener("click", () => {
      this.audioProcessor.stopMicrophone();
      startButton.disabled = false;
      stopButton.disabled = true;
    });
  }

  handleResize() {
    if (!this.renderer || !this.avatar.camera || !this.container) return;

    this.avatar.camera.aspect =
      this.container.clientWidth / this.container.clientHeight;
    this.avatar.camera.updateProjectionMatrix();
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
  }

  async animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    // Process audio if microphone is active
    if (this.audioProcessor && this.audioProcessor.isProcessing) {
      const audioFeatures = this.audioProcessor.processAudioForAnimation();
      const blendshapes = await this.lipSyncModel.predict(audioFeatures);

      // Apply blendshapes to avatar
      this.avatar.animateMouth(blendshapes.mouthOpen);
    } else {
      // Slightly animate the mouth even without audio for visual interest
      const time = Date.now() * 0.001;
      const smallMovement = Math.sin(time) * 0.05 + 0.05;
      this.avatar.animateMouth(smallMovement);
    }

    // Update FPS counter
    this.updateFPS();

    // Render frame
    this.renderer.render(this.avatar.scene, this.avatar.camera);
  }

  updateFPS() {
    const now = performance.now();
    const elapsed = now - this.fpsCounter.lastTime;

    this.fpsCounter.frames++;

    if (elapsed >= 1000) {
      this.fpsCounter.fps = Math.round(
        (this.fpsCounter.frames * 1000) / elapsed
      );
      this.fpsCounter.lastTime = now;
      this.fpsCounter.frames = 0;

      document.getElementById(
        "fps-counter"
      ).textContent = `FPS: ${this.fpsCounter.fps}`;
    }
  }

  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.audioProcessor) {
      this.audioProcessor.stopMicrophone();
    }

    window.removeEventListener("resize", this.handleResize);
  }
}

// Initialize the demo when the page loads
window.addEventListener("DOMContentLoaded", async () => {
  const demo = new TalkingAvatarDemo();
  await demo.init();

  // Store instance for cleanup if needed
  window.talkingAvatarDemo = demo;
});
