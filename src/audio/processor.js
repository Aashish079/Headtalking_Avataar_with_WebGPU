export class AudioProcessor {
    constructor() {
      this.audioContext = null;
      this.analyzer = null;
      this.dataArray = null;
      this.microphone = null;
      this.isProcessing = false;
    }
    
    async initMicrophone() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.microphone = this.audioContext.createMediaStreamSource(stream);
        this.analyzer = this.audioContext.createAnalyser();
        this.analyzer.fftSize = 256;
        
        this.microphone.connect(this.analyzer);
        // Don't connect to destination to avoid feedback
        // this.analyzer.connect(this.audioContext.destination);
        
        const bufferLength = this.analyzer.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
        
        this.isProcessing = true;
        
        return true;
      } catch (error) {
        console.error('Error accessing microphone:', error);
        return false;
      }
    }
    
    stopMicrophone() {
      if (this.microphone) {
        this.microphone.disconnect();
        this.isProcessing = false;
      }
      if (this.audioContext) {
        this.audioContext.close();
      }
    }
    
    // Get audio data for processing
    getAudioData() {
      if (!this.analyzer || !this.isProcessing) return null;
      
      this.analyzer.getByteFrequencyData(this.dataArray);
      return this.dataArray;
    }
    
    // Simplified audio-to-mouth-shape conversion
    // In a real implementation, this would use ML for accurate lips
    processAudioForAnimation() {
      if (!this.isProcessing) return 0;
      
      const data = this.getAudioData();
      if (!data) return 0;
      
      // Calculate average amplitude in the speech frequency range (approx 85-255Hz)
      // We're simplifying by just taking the average of the first few bins
      let sum = 0;
      const relevantBins = 10; // Roughly the speech fundamental frequency bins
      
      for (let i = 0; i < relevantBins; i++) {
        sum += data[i];
      }
      
      // Normalize to 0-1 range
      const average = sum / (relevantBins * 255);
      
      // Apply some smoothing to avoid jittery movement
      this.lastValue = this.lastValue || 0;
      const smoothingFactor = 0.3;
      const smoothedValue = this.lastValue * (1 - smoothingFactor) + average * smoothingFactor;
      this.lastValue = smoothedValue;
      
      return smoothedValue;
    }
  }