module.exports = {
  ci: {
    collect: {
      startServerCommand: "bun run serve:lhci",
      startServerReadyPattern: "Ready",
      startServerReadyTimeout: 20000,
      url: ["http://localhost:3000/", "http://localhost:3000/blog"],
      numberOfRuns: 3,
    },
    assert: {
      // Keep the first baseline advisory while the site establishes its scores.
      assertions: {
        "categories:performance": ["warn", { minScore: 0.75 }],
        "categories:accessibility": ["warn", { minScore: 0.75 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
