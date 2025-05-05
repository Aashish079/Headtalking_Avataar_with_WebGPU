export const checkWebGPUSupport = async () => {
    if (!navigator.gpu) {
      console.error("WebGPU not supported");
      return false;
    }
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        console.error("Couldn't request WebGPU adapter");
        return false;
      }
      return true;
    } catch (e) {
      console.error("WebGPU support error:", e);
      return false;
    }
  };