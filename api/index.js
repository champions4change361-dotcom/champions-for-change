import express from 'express';

// This will be populated during build
let app;

export default async function handler(req, res) {
  if (!app) {
    // Import your built Express app
    const serverModule = await import('../dist/index.js');
    app = serverModule.default || serverModule.app;
  }
  
  return app(req, res);
}
