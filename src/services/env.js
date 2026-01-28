// env.js
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename).replace("/src/services","");
dotenv.config({ path:`${__dirname}/.env` });