// Simple test to verify routes are mounted
import express from 'express';
import apiRoutes from './routes/api';

const app = express();

// Mount the API routes
app.use('/api', apiRoutes);

// Test endpoint to verify routes are working
app.get('/test-routes', (req, res) => {
  res.json({
    message: 'Routes are mounted successfully!',
    availableEndpoints: [
      'GET /api/ - API status',
      'GET /api/protected - Protected route example',
      'GET /api/tasks - General task management',
      'GET /api/food-tasks - Food task management',
      'GET /api/homework-tasks - Homework task management',
      'GET /api/email-tasks - Email task management',
      'GET /api/meeting-tasks - Meeting task management',
      'GET /api/project-tasks - Project task management',
      'GET /api/personal-tasks - Personal task management',
      'GET /api/work-tasks - Work task management',
      'GET /api/health-tasks - Health task management',
      'GET /api/social-tasks - Social task management',
      'GET /api/other-tasks - Other task management'
    ]
  });
});

export default app;
