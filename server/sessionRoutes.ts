import type { Express } from "express";

export function registerSessionRoutes(app: Express) {
  // Session backup endpoint
  app.post('/api/sessions/sync', async (req, res) => {
    try {
      const { sessionId, data, backup } = req.body;
      
      // Log session activity (could be stored in database later)
      console.log(`Session sync: ${sessionId} - ${backup ? 'backup' : 'regular'} - ${Date.now()}`);
      
      // For now, just acknowledge receipt
      // In production, this would store to Redis or database
      res.json({ success: true, sessionId });
    } catch (error) {
      console.error('Session sync error:', error);
      res.status(500).json({ error: 'Failed to sync session' });
    }
  });

  // Session migration endpoint for registered users
  app.post('/api/users/migrate-session', async (req, res) => {
    try {
      const { userId, sessionData, sessionId } = req.body;
      
      console.log(`Migrating session ${sessionId} to user ${userId}`);
      
      // This would integrate with user storage system
      // For now, log the data for debugging
      console.log('Session migration data:', {
        userId,
        sessionId,
        buildProgress: sessionData.buildProgress,
        aiHistoryLength: sessionData.aiHistory?.length || 0,
        suggestedNext: sessionData.suggestedNext,
        userContext: sessionData.userContext
      });
      
      res.json({ 
        success: true, 
        message: 'Session migrated successfully',
        userId,
        sessionId 
      });
    } catch (error) {
      console.error('Session migration error:', error);
      res.status(500).json({ error: 'Failed to migrate session' });
    }
  });
}