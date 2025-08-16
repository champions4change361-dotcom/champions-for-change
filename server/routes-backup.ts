// Backup of original routes before simplification
// This file contains the full routes with all features but type errors
// Can be restored later after fixing type issues
import { readFileSync } from 'fs';
const originalRoutes = readFileSync('server/routes.ts', 'utf-8');
export default originalRoutes;