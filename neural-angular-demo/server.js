// Simple Express server to serve the Angular app
const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Health check endpoint for Railway
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "neural-network-angular-demo",
  });
});

// Serve static files from the Angular app build directory
app.use(express.static(path.join(__dirname, "dist/neural-angular-demo")));

// Handle Angular routing - return all requests to Angular index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/neural-angular-demo/index.html"));
});

app.listen(port, () => {
  console.log(`Neural Network Angular Demo running on port ${port}`);
});
