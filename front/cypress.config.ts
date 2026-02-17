import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    numTestsKeptInMemory: 50,
    env: {
      apiUrl: 'http://localhost:3000/api',
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
  
  retries: {
    runMode: 2,
    openMode: 0,
  },
  
  videoCompression: 32,
  
  screenshotsFolder: 'cypress/screenshots',
  
  videosFolder: 'cypress/videos',
  
  downloadsFolder: 'cypress/downloads',
  
  fixturesFolder: 'cypress/fixtures',
});

