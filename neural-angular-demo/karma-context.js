// Karma context file to patch reload error detection
// This runs in the Karma iframe context before any tests

(function (window) {
  "use strict";

  // Save the original error function
  const originalError = window.console.error;

  // Override console.error to filter out the "full page reload" message
  window.console.error = function (...args) {
    const message = args.join(" ");

    // Filter out the specific Karma reload error
    if (
      message &&
      typeof message === "string" &&
      message.includes("full page reload")
    ) {
      // Silently ignore this error
      return;
    }

    // Pass through all other errors
    return originalError.apply(console, args);
  };

  // Also intercept any karma.error calls
  if (window.__karma__) {
    const originalKarmaError = window.__karma__.error;
    window.__karma__.error = function (message, ...args) {
      if (
        message &&
        typeof message === "string" &&
        message.includes("full page reload")
      ) {
        // Silently ignore
        return;
      }
      return originalKarmaError.call(window.__karma__, message, ...args);
    };
  }
})(window);
