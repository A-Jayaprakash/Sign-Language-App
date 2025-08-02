// model-integration.js
class SignLanguageModelIntegration {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
    this.labels = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
    ];
  }

  async loadModel() {
    try {
      console.log("Loading TensorFlow.js model...");
      this.model = await tf.loadGraphModel("./models/tfjs_model/model.json");
      this.isModelLoaded = true;
      console.log("Model loaded successfully!");
      return true;
    } catch (error) {
      console.error("Error loading model:", error);
      return false;
    }
  }

  preprocessImage(imageData) {
    // Convert image data to tensor
    const tensor = tf.browser.fromPixels(imageData, 1); // grayscale

    // Resize to 28x28
    const resized = tf.image.resizeBilinear(tensor, [28, 28]);

    // Normalize to [0, 1]
    const normalized = resized.div(255.0);

    // Add batch dimension
    const batched = normalized.expandDims(0);

    return batched;
  }

  async predict(imageData) {
    if (!this.isModelLoaded) {
      throw new Error("Model not loaded yet");
    }

    try {
      // Preprocess the image
      const preprocessed = this.preprocessImage(imageData);

      // Make prediction
      const prediction = await this.model.predict(preprocessed);
      const probabilities = await prediction.data();

      // Get top prediction
      const maxIndex = probabilities.indexOf(Math.max(...probabilities));
      const confidence = probabilities[maxIndex];
      const predictedLetter = this.labels[maxIndex];

      // Clean up tensors
      preprocessed.dispose();
      prediction.dispose();

      return {
        letter: predictedLetter,
        confidence: confidence,
        allProbabilities: Array.from(probabilities),
      };
    } catch (error) {
      console.error("Prediction error:", error);
      return null;
    }
  }

  async predictFromCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return await this.predict(imageData);
  }
}

// Export for use in main application
window.SignLanguageModelIntegration = SignLanguageModelIntegration;
