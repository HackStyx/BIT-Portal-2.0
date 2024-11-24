module.exports = {
  // ... other configurations
  module: {
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      }
    ]
  },
  ignoreWarnings: [/Failed to parse source map/]
};

