// Simple Express server to serve the Angular app
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

// Check if build directory exists
const distPath = path.join(__dirname, "dist/neural-angular-demo");
console.log("Checking for dist directory at:", distPath);
if (!fs.existsSync(distPath)) {
  console.error("ERROR: dist/neural-angular-demo directory not found!");
  console.error(
    "Make sure to run 'npm run build:prod' before starting the server"
  );
  process.exit(1);
}

// Add basic middleware for logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint for Railway
app.get("/health", (req, res) => {
  console.log("Health check requested");
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "neural-network-angular-demo",
    port: port,
    distPath: distPath,
  });
});

// Serve static files from the Angular app build directory
app.use(express.static(path.join(__dirname, "dist/neural-angular-demo")));

// Handle Angular routing - return all requests to Angular index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/neural-angular-demo/index.html"));
});

app
  .listen(port, "0.0.0.0", () => {
    console.log(`Neural Network Angular Demo running on port ${port}`);
    console.log(`Health check available at: http://0.0.0.0:${port}/health`);
  })
  .on("error", (err) => {
    console.error("Server failed to start:", err);
    process.exit(1);
  });
