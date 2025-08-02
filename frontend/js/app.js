class SignLanguageApp {
  constructor() {
    this.initializeProperties();
    this.initializeElements();
    this.initializeEventListeners();
    this.initializeSpeechSynthesis();
    this.setupMediaDevices();

    // Mock data from the provided JSON
    this.mockWords = [
      { word: "hello", confidence: 0.92 },
      { word: "thank", confidence: 0.88 },
      { word: "you", confidence: 0.91 },
      { word: "please", confidence: 0.85 },
      { word: "help", confidence: 0.89 },
      { word: "sorry", confidence: 0.87 },
      { word: "water", confidence: 0.84 },
      { word: "food", confidence: 0.86 },
      { word: "yes", confidence: 0.93 },
      { word: "no", confidence: 0.9 },
      { word: "how", confidence: 0.83 },
      { word: "are", confidence: 0.85 },
      { word: "good", confidence: 0.88 },
      { word: "bad", confidence: 0.82 },
      { word: "more", confidence: 0.86 },
    ];

    this.sampleSentences = [
      "Hello how are you",
      "Thank you very much",
      "Please help me",
      "Sorry I am late",
      "Can I have water",
      "The food is good",
      "Yes that is correct",
      "No thank you",
    ];

    this.processingSteps = [
      "Capturing video frames...",
      "Extracting hand landmarks...",
      "Processing with Vision Transformer...",
      "Analyzing gesture patterns...",
      "Generating word predictions...",
      "Constructing sentence...",
      "Ready for speech synthesis",
    ];

    this.recognizedWords = [];
    this.currentSentence = "";
    this.modelIntegration = new SignLanguageModelIntegration();
    this.initializeModel();
  }
  async initializeModel() {
    const statusElement = document.getElementById("modelStatus");
    const progressElement = document.getElementById("loadingProgress");

    try {
      statusElement.textContent = "Loading AI Model...";
      progressElement.style.width = "0%";

      const success = await this.modelIntegration.loadModel();

      if (success) {
        statusElement.textContent = "AI Model Ready";
        progressElement.style.width = "100%";
        this.isModelReady = true;
      } else {
        statusElement.textContent = "Model Loading Failed - Using Mock Data";
        this.isModelReady = false;
      }
    } catch (error) {
      console.error("Model initialization error:", error);
      statusElement.textContent = "Model Loading Failed - Using Mock Data";
      this.isModelReady = false;
    }
  }

  async processVideoFrame() {
    if (!this.isRecording || !this.isModelReady) {
      return this.generateMockPrediction(); // Fallback to mock
    }

    try {
      // Capture current frame from video
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const video = document.getElementById("videoElement");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Get prediction from model
      const prediction = await this.modelIntegration.predictFromCanvas(canvas);

      if (prediction && prediction.confidence > 0.7) {
        return {
          word: prediction.letter.toLowerCase(),
          confidence: prediction.confidence,
        };
      } else {
        return null; // Low confidence, ignore
      }
    } catch (error) {
      console.error("Frame processing error:", error);
      return this.generateMockPrediction(); // Fallback
    }
  }

  // Update existing method to use real predictions
  async simulateProcessing() {
    const steps = this.processingSteps;
    const statusText = document.getElementById("statusText");
    const progressBar = document.getElementById("progressBar");

    for (let i = 0; i < steps.length; i++) {
      statusText.textContent = steps[i];
      progressBar.style.width = `${((i + 1) / steps.length) * 100}%`;
      await this.delay(500);
    }

    // Get real prediction instead of mock
    const prediction = await this.processVideoFrame();

    if (prediction) {
      this.addRecognizedWord(prediction.word, prediction.confidence);
    }

    statusText.textContent = "Ready";
    progressBar.style.width = "0%";
  }
  startRealTimeRecognition() {
    if (!this.isModelReady) {
      console.log("Model not ready for real-time recognition");
      return;
    }

    this.realTimeInterval = setInterval(async () => {
      if (this.isRecording) {
        const prediction = await this.processVideoFrame();
        if (prediction) {
          this.updateRealTimeDisplay(prediction);
        }
      }
    }, 1000); // Process every second
  }

  updateRealTimeDisplay(prediction) {
    const letterElement = document.getElementById("predictedLetter");
    const confidenceElement = document.getElementById("confidenceScore");

    letterElement.textContent = prediction.word.toUpperCase();
    confidenceElement.textContent = `${(prediction.confidence * 100).toFixed(
      1
    )}%`;

    // Add visual feedback
    letterElement.style.animation = "pulse 0.5s ease-in-out";
    setTimeout(() => {
      letterElement.style.animation = "";
    }, 500);
  }

  stopRealTimeRecognition() {
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
      this.realTimeInterval = null;
    }
  }
  initializeProperties() {
    this.mediaStream = null;
    this.mediaRecorder = null;
    this.isRecording = false;
    this.recordingStartTime = 0;
    this.recordingTimer = null;
    this.speechSynthesis = window.speechSynthesis;
    this.currentUtterance = null;
    this.availableVoices = [];
    this.cameraStarted = false;
    this.settings = {
      autoSpeak: true,
      volume: 1.0,
      rate: 1.0,
      selectedVoice: 0,
      sensitivity: 0.8,
      language: "asl",
      resolution: "640x480",
    };
  }

  initializeElements() {
    // Navigation
    this.navButtons = document.querySelectorAll(".nav-btn");
    this.sections = document.querySelectorAll(".section");

    // Video elements
    this.videoElement = document.getElementById("videoElement");
    this.videoCanvas = document.getElementById("videoCanvas");
    this.startBtn = document.getElementById("startBtn");
    this.recordBtn = document.getElementById("recordBtn");
    this.snapshotBtn = document.getElementById("snapshotBtn");
    this.recordingOverlay = document.getElementById("recordingOverlay");
    this.recordingTimerDisplay = document.getElementById("recordingTimer");

    // Status elements
    this.connectionStatus = document.getElementById("connectionStatus");
    this.statusText = document.getElementById("statusText");
    this.processingStatus = document.getElementById("processingStatus");
    this.processingText = document.getElementById("processingText");

    // Results elements
    this.wordResults = document.getElementById("wordResults");
    this.sentenceDisplay = document.getElementById("sentenceDisplay");
    this.clearResultsBtn = document.getElementById("clearResultsBtn");

    // Speech elements
    this.playBtn = document.getElementById("playBtn");
    this.pauseBtn = document.getElementById("pauseBtn");
    this.stopBtn = document.getElementById("stopBtn");
    this.autoSpeechToggle = document.getElementById("autoSpeechToggle");
    this.voiceSelect = document.getElementById("voiceSelect");
    this.volumeSlider = document.getElementById("volumeSlider");
    this.volumeValue = document.getElementById("volumeValue");
    this.rateSlider = document.getElementById("rateSlider");
    this.rateValue = document.getElementById("rateValue");

    // Settings elements
    this.cameraSelect = document.getElementById("cameraSelect");
    this.resolutionSelect = document.getElementById("resolutionSelect");
    this.sensitivitySlider = document.getElementById("sensitivitySlider");
    this.sensitivityValue = document.getElementById("sensitivityValue");
    this.languageSelect = document.getElementById("languageSelect");
  }

  initializeEventListeners() {
    // Navigation
    this.navButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.switchSection(e.target.dataset.section);
      });
    });

    // Video controls
    this.startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.cameraStarted) {
        this.stopCamera();
      } else {
        this.startCamera();
      }
    });

    this.recordBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleRecording();
    });

    this.snapshotBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.takeSnapshot();
    });

    // Results
    this.clearResultsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.clearResults();
    });

    // Speech controls
    this.playBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.playTextToSpeech();
    });

    this.pauseBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.pauseTextToSpeech();
    });

    this.stopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.stopTextToSpeech();
    });

    this.autoSpeechToggle.addEventListener("change", (e) => {
      this.settings.autoSpeak = e.target.checked;
    });

    // Speech settings
    this.voiceSelect.addEventListener("change", (e) => {
      this.settings.selectedVoice = parseInt(e.target.value);
    });

    this.volumeSlider.addEventListener("input", (e) => {
      this.settings.volume = parseFloat(e.target.value);
      this.volumeValue.textContent = e.target.value;
    });

    this.rateSlider.addEventListener("input", (e) => {
      this.settings.rate = parseFloat(e.target.value);
      this.rateValue.textContent = e.target.value;
    });

    // Settings
    if (this.cameraSelect) {
      this.cameraSelect.addEventListener("change", (e) => {
        if (e.target.value) {
          this.switchCamera(e.target.value);
        }
      });
    }

    if (this.resolutionSelect) {
      this.resolutionSelect.addEventListener("change", (e) => {
        this.settings.resolution = e.target.value;
      });
    }

    if (this.sensitivitySlider) {
      this.sensitivitySlider.addEventListener("input", (e) => {
        this.settings.sensitivity = parseFloat(e.target.value);
        this.sensitivityValue.textContent = e.target.value;
      });
    }

    if (this.languageSelect) {
      this.languageSelect.addEventListener("change", (e) => {
        this.settings.language = e.target.value;
      });
    }
  }

  initializeSpeechSynthesis() {
    if (this.speechSynthesis) {
      // Load voices immediately if available
      this.loadVoices();

      // Also listen for the voiceschanged event
      this.speechSynthesis.addEventListener("voiceschanged", () => {
        this.loadVoices();
      });
    }
  }

  loadVoices() {
    this.availableVoices = this.speechSynthesis.getVoices();
    if (this.availableVoices.length > 0) {
      this.populateVoiceSelect();
    }
  }

  populateVoiceSelect() {
    if (!this.voiceSelect) return;

    this.voiceSelect.innerHTML = "";

    if (this.availableVoices.length === 0) {
      // Add default options if no voices are available yet
      const defaultOptions = [
        "Default Female Voice",
        "Default Male Voice",
        "UK Female Voice",
        "UK Male Voice",
      ];

      defaultOptions.forEach((name, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = name;
        this.voiceSelect.appendChild(option);
      });
    } else {
      this.availableVoices.forEach((voice, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        this.voiceSelect.appendChild(option);
      });
    }
  }

  async setupMediaDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      if (this.cameraSelect) {
        this.cameraSelect.innerHTML =
          '<option value="">Select Camera...</option>';
        videoDevices.forEach((device, index) => {
          const option = document.createElement("option");
          option.value = device.deviceId;
          option.textContent = device.label || `Camera ${index + 1}`;
          this.cameraSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.warn("Could not enumerate media devices:", error);
    }
  }

  switchSection(sectionName) {
    // Update navigation
    this.navButtons.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.section === sectionName) {
        btn.classList.add("active");
      }
    });

    // Update sections
    this.sections.forEach((section) => {
      section.classList.remove("active");
      section.classList.add("hidden");
      if (section.id === sectionName) {
        section.classList.add("active");
        section.classList.remove("hidden");
      }
    });
  }

  async startCamera() {
    try {
      this.updateConnectionStatus("connecting", "Connecting to camera...");

      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.mediaStream;

      this.cameraStarted = true;
      this.startBtn.textContent = "Stop Camera";
      this.recordBtn.disabled = false;
      this.snapshotBtn.disabled = false;

      this.updateConnectionStatus("connected", "Camera connected");
    } catch (error) {
      console.error("Error accessing camera:", error);
      this.updateConnectionStatus("error", "Camera access denied");

      // Show user-friendly message
      if (error.name === "NotAllowedError") {
        alert(
          "Camera access was denied. Please allow camera permissions and try again."
        );
      } else if (error.name === "NotFoundError") {
        alert("No camera found. Please connect a camera and try again.");
      } else {
        alert(
          "Could not access camera. Please check your camera and permissions."
        );
      }
    }
  }

  stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    this.videoElement.srcObject = null;
    this.cameraStarted = false;
    this.startBtn.textContent = "Start Camera";
    this.recordBtn.disabled = true;
    this.snapshotBtn.disabled = true;

    if (this.isRecording) {
      this.stopRecording();
    }

    this.updateConnectionStatus("ready", "Ready");
  }

  async switchCamera(deviceId) {
    if (this.cameraStarted) {
      this.stopCamera();
      // Wait a moment for cleanup
      setTimeout(() => {
        this.startCamera();
      }, 500);
    }
  }

  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
    if (!this.mediaStream) {
      alert("Please start the camera first");
      return;
    }

    try {
      this.isRecording = true;
      this.recordingStartTime = Date.now();

      this.recordBtn.textContent = "Stop Recording";
      this.recordBtn.classList.remove("btn--secondary");
      this.recordBtn.classList.add("btn--primary");
      this.recordingOverlay.classList.remove("hidden");

      this.startRecordingTimer();
      this.updateConnectionStatus("recording", "Recording...");

      // Start a recording timeout (simulate recording for 3-8 seconds)
      const recordingDuration = 3000 + Math.random() * 5000;
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
        }
      }, recordingDuration);
    } catch (error) {
      console.error("Error starting recording:", error);
      this.isRecording = false;
    }
  }

  stopRecording() {
    if (this.isRecording) {
      this.isRecording = false;

      this.recordBtn.textContent = "Start Recording";
      this.recordBtn.classList.remove("btn--primary");
      this.recordBtn.classList.add("btn--secondary");
      this.recordingOverlay.classList.add("hidden");

      this.stopRecordingTimer();
      this.updateConnectionStatus("connected", "Processing recording...");

      // Process the recording
      this.processRecording();
    }
  }

  startRecordingTimer() {
    this.recordingTimer = setInterval(() => {
      const elapsed = Date.now() - this.recordingStartTime;
      const seconds = Math.floor(elapsed / 1000);
      const minutes = Math.floor(seconds / 60);
      const displaySeconds = seconds % 60;

      if (this.recordingTimerDisplay) {
        this.recordingTimerDisplay.textContent = `${minutes
          .toString()
          .padStart(2, "0")}:${displaySeconds.toString().padStart(2, "0")}`;
      }
    }, 1000);
  }

  stopRecordingTimer() {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
  }

  takeSnapshot() {
    if (!this.mediaStream) {
      alert("Please start the camera first");
      return;
    }

    // Simulate processing a single frame
    this.simulateFrameProcessing();
  }

  async processRecording() {
    this.showProcessingStatus();

    // Simulate the AI processing pipeline
    for (let i = 0; i < this.processingSteps.length; i++) {
      this.processingText.textContent = this.processingSteps[i];
      await this.delay(600 + Math.random() * 400); // 600-1000ms per step
    }

    // Generate mock results
    await this.generateMockResults();

    this.hideProcessingStatus();
    this.updateConnectionStatus("connected", "Camera connected");
  }

  async simulateFrameProcessing() {
    this.showProcessingStatus();

    // Shorter processing for single frame
    const quickSteps = this.processingSteps.slice(0, 5);
    for (let i = 0; i < quickSteps.length; i++) {
      this.processingText.textContent = quickSteps[i];
      await this.delay(300 + Math.random() * 200);
    }

    // Generate a single word
    const randomWord =
      this.mockWords[Math.floor(Math.random() * this.mockWords.length)];
    this.addRecognizedWord(randomWord);

    this.hideProcessingStatus();
  }

  async generateMockResults() {
    // Generate 2-4 words
    const numWords = 2 + Math.floor(Math.random() * 3);
    const selectedWords = [];

    for (let i = 0; i < numWords; i++) {
      const randomIndex = Math.floor(Math.random() * this.mockWords.length);
      const word = { ...this.mockWords[randomIndex] };
      // Add some variation to confidence
      word.confidence = Math.max(
        0.65,
        word.confidence + (Math.random() - 0.5) * 0.1
      );
      selectedWords.push(word);

      // Add word with delay for visual effect
      await this.delay(400);
      this.addRecognizedWord(word);
    }

    // Construct sentence
    await this.delay(800);
    this.constructSentence();
  }

  addRecognizedWord(wordData) {
    this.recognizedWords.push(wordData);

    // Remove empty state if present
    const emptyState = this.wordResults.querySelector(".empty-state");
    if (emptyState) {
      emptyState.remove();
    }

    // Create word item
    const wordItem = document.createElement("div");
    wordItem.className = "word-item fade-in";

    const confidencePercentage = Math.round(wordData.confidence * 100);

    wordItem.innerHTML = `
            <span class="word-text">${wordData.word}</span>
            <div class="confidence-score">
                <span>${confidencePercentage}%</span>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${confidencePercentage}%"></div>
                </div>
            </div>
        `;

    this.wordResults.appendChild(wordItem);

    // Scroll to bottom
    this.wordResults.scrollTop = this.wordResults.scrollHeight;
  }

  constructSentence() {
    // Simple sentence construction - just join the last few words
    const recentWords = this.recognizedWords.slice(-4).map((w) => w.word);

    // Try to match a sample sentence, otherwise create a simple sentence
    let constructedSentence = this.findBestSentenceMatch(recentWords);

    if (!constructedSentence) {
      constructedSentence = recentWords.join(" ");
      // Capitalize first letter
      constructedSentence =
        constructedSentence.charAt(0).toUpperCase() +
        constructedSentence.slice(1);
    }

    this.currentSentence = constructedSentence;
    this.displaySentence(constructedSentence);

    // Auto-speak if enabled
    if (this.settings.autoSpeak) {
      setTimeout(() => {
        this.playTextToSpeech();
      }, 1000);
    }
  }

  findBestSentenceMatch(words) {
    for (const sentence of this.sampleSentences) {
      const sentenceWords = sentence.toLowerCase().split(" ");
      const wordSet = new Set(words.map((w) => w.toLowerCase()));

      // Check if at least 2 words match
      const matches = sentenceWords.filter((w) => wordSet.has(w)).length;
      if (matches >= 2) {
        return sentence;
      }
    }
    return null;
  }

  displaySentence(sentence) {
    // Remove empty state
    const emptyState = this.sentenceDisplay.querySelector(".empty-state");
    if (emptyState) {
      emptyState.remove();
    }

    // Create or update sentence text
    let sentenceText = this.sentenceDisplay.querySelector(".sentence-text");
    if (!sentenceText) {
      sentenceText = document.createElement("p");
      sentenceText.className = "sentence-text";
      this.sentenceDisplay.appendChild(sentenceText);
    }

    sentenceText.textContent = sentence;
    this.sentenceDisplay.classList.add("slide-up");

    // Enable speech controls
    this.playBtn.disabled = false;

    // Remove animation class after animation completes
    setTimeout(() => {
      this.sentenceDisplay.classList.remove("slide-up");
    }, 300);
  }

  playTextToSpeech() {
    if (!this.currentSentence || !this.speechSynthesis) {
      // If no sentence, create a demo sentence
      if (!this.currentSentence) {
        this.currentSentence =
          "Hello, this is a test of the text to speech system";
      }
    }

    // Stop any current speech
    this.speechSynthesis.cancel();

    // Create new utterance
    this.currentUtterance = new SpeechSynthesisUtterance(this.currentSentence);

    // Configure utterance
    this.currentUtterance.volume = this.settings.volume;
    this.currentUtterance.rate = this.settings.rate;

    if (
      this.availableVoices.length > 0 &&
      this.availableVoices[this.settings.selectedVoice]
    ) {
      this.currentUtterance.voice =
        this.availableVoices[this.settings.selectedVoice];
    }

    // Event handlers
    this.currentUtterance.addEventListener("start", () => {
      this.playBtn.disabled = true;
      this.pauseBtn.disabled = false;
      this.stopBtn.disabled = false;
    });

    this.currentUtterance.addEventListener("end", () => {
      this.playBtn.disabled = false;
      this.pauseBtn.disabled = true;
      this.stopBtn.disabled = true;
    });

    this.currentUtterance.addEventListener("error", (e) => {
      console.error("Speech synthesis error:", e);
      this.playBtn.disabled = false;
      this.pauseBtn.disabled = true;
      this.stopBtn.disabled = true;
    });

    // Speak
    this.speechSynthesis.speak(this.currentUtterance);
  }

  pauseTextToSpeech() {
    if (this.speechSynthesis && this.speechSynthesis.speaking) {
      this.speechSynthesis.pause();
      this.playBtn.disabled = false;
      this.pauseBtn.disabled = true;
    }
  }

  stopTextToSpeech() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
      this.playBtn.disabled = false;
      this.pauseBtn.disabled = true;
      this.stopBtn.disabled = true;
    }
  }

  clearResults() {
    this.recognizedWords = [];
    this.currentSentence = "";

    // Clear word results
    this.wordResults.innerHTML =
      '<p class="empty-state">Start recording to see recognized words</p>';

    // Clear sentence display
    this.sentenceDisplay.innerHTML =
      '<p class="empty-state">Words will form sentences here</p>';

    // Disable speech controls
    this.playBtn.disabled = true;
    this.pauseBtn.disabled = true;
    this.stopBtn.disabled = true;
    this.stopTextToSpeech();
  }

  showProcessingStatus() {
    this.processingStatus.classList.remove("hidden");
  }

  hideProcessingStatus() {
    this.processingStatus.classList.add("hidden");
  }

  updateConnectionStatus(status, text) {
    this.connectionStatus.className = `status-dot ${status}`;
    this.statusText.textContent = text;
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
// Enhanced error handling
class ErrorHandler {
  static showUserFriendlyError(error, fallbackAction) {
    const errorMessages = {
      MODEL_LOAD_FAILED: "AI model failed to load. Using demonstration mode.",
      CAMERA_ACCESS_DENIED:
        "Camera access denied. Please enable camera permissions.",
      PREDICTION_FAILED:
        "Recognition temporarily unavailable. Please try again.",
      BROWSER_NOT_SUPPORTED:
        "Your browser doesn't support all required features.",
    };

    const message =
      errorMessages[error.type] || "An unexpected error occurred.";

    // Show user-friendly notification
    this.showNotification(message, "warning");

    // Execute fallback action
    if (fallbackAction) {
      fallbackAction();
    }
  }

  static showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

// Add performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      modelLoadTime: 0,
      averageInferenceTime: 0,
      totalPredictions: 0,
    };
  }

  startTimer() {
    return performance.now();
  }

  endTimer(startTime, operation) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (operation === "inference") {
      this.metrics.totalPredictions++;
      this.metrics.averageInferenceTime =
        (this.metrics.averageInferenceTime *
          (this.metrics.totalPredictions - 1) +
          duration) /
        this.metrics.totalPredictions;
    }

    return duration;
  }

  getMetrics() {
    return this.metrics;
  }
}

// Add to main app
const performanceMonitor = new PerformanceMonitor();

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new SignLanguageApp();
});

// Handle visibility change to properly manage camera resources
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    console.log("Page hidden - conserving resources");
  } else {
    console.log("Page visible - resuming operations");
  }
});
