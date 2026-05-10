// Vercel Serverless Function — wraps the Express app.
// Uses createRequire so we can load the CommonJS server from this ESM context.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const app = require('../server/index.js');
export default app;
