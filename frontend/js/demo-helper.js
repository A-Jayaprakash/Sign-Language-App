// Demo helper functions
class DemoHelper {
  constructor(app) {
    this.app = app;
    this.demoSequence = ["A", "B", "C", "D", "E"];
    this.currentIndex = 0;
  }

  startDemo() {
    this.showDemoInstructions();
    this.setupDemoMode();
  }

  showDemoInstructions() {
    const instructions = [
      "Welcome to the Sign Language Recognition Demo!",
      "1. Click 'Start Recording' to begin",
      "2. Show ASL letters A, B, C, D, E to the camera",
      "3. Watch real-time recognition results",
      "4. See sentence construction and text-to-speech",
      "Ready to begin!",
    ];

    let delay = 0;
    instructions.forEach((instruction, index) => {
      setTimeout(() => {
        ErrorHandler.showNotification(instruction, "info");
      }, delay);
      delay += 2000;
    });
  }

  setupDemoMode() {
    // Add demo-specific enhancements
    this.app.isDemo = true;
    this.addDemoControls();
  }

  addDemoControls() {
    const demoControls = document.createElement("div");
    demoControls.className = "demo-controls";
    demoControls.innerHTML = `
            <h3>Demo Controls</h3>
            <button onclick="demoHelper.simulateLetterRecognition('A')">Simulate 'A'</button>
            <button onclick="demoHelper.simulateLetterRecognition('B')">Simulate 'B'</button>
            <button onclick="demoHelper.simulateLetterRecognition('C')">Simulate 'C'</button>
            <button onclick="demoHelper.resetDemo()">Reset Demo</button>
        `;

    document.querySelector(".main").appendChild(demoControls);
  }

  simulateLetterRecognition(letter) {
    const prediction = {
      word: letter.toLowerCase(),
      confidence: 0.95 + Math.random() * 0.04, // 95-99% confidence
    };

    this.app.updateRealTimeDisplay(prediction);
    this.app.addRecognizedWord(prediction.word, prediction.confidence);
  }

  resetDemo() {
    this.app.clearResults();
    this.currentIndex = 0;
    ErrorHandler.showNotification("Demo reset!", "success");
  }
}

// Initialize demo helper
const demoHelper = new DemoHelper(signLanguageApp);
