import express from 'express';
//import session from "express-session";
import cors from 'cors';
import morgan from 'morgan';
import { sequelize } from './src/db/config/database.js';
import cron from 'node-cron';

import bodyParser from 'body-parser';
import router from './src/router/route.js';
import cookieParser from 'cookie-parser';

import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { Server } from 'socket.io';
import { visionController } from './src/controller/vision/visionController.js';
import './src/services/env.js';
import config from './src/config/environment.js';
import { messageIO } from './src/controller/message/message.io.js';
import socketMiddleware from './src/middleware/socketMiddleware.js';
import { userListeSocket } from './src/controller/message/userList.io.js';
import { broadcastACL } from './src/controller/accecs/broadcastACL.io.js';
import initGroupSocket from './src/controller/groupe/groupeControleur.io.js';
import { ExpressPeerServer } from 'peer';
import initCommentSocket from './src/controller/post/commentControleur.io.js';
import reaction from './src/controller/reaction/reaction.io.js';
import { cleanupExpiredSessions } from './src/scripts/cleanupSessions.js';
import {
	getPreciseGMTTime,
	getPreciseTimestamp,
	initializeTimeSync,
	preciseTimeMiddleware,
} from './src/services/timeSync.js';
import {
	initVectorStore,
	loadFromCache,
} from './src/services/assistanceService.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import llamaRoutes from './src/router/llamaRoutes.js';

// Valider la configuration
config.validate();
const port = process.env.APP_BACKEND_PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicFolder = process.env.APP_PUBLIC_FOLDER;

const options = {
	key: fs.readFileSync(process.env.APP_SSL_KEY_PATH, 'utf-8'), //Change Private Key Path here
	cert: fs.readFileSync(process.env.APP_SSL_CERT_PATH, 'utf-8'), //Change Main Certificate Path here
	// ca: path.join(__dirname,'certs/server.csr'),             //Change Intermediate Certificate Path here
};

/* ------------------------------------------------------- */
/* ---------- SERVEUR EXPRESS   --------------------- */
/* ------------------------------------------------------- */
const app = express();
const authorizedOrigine = [
	process.env.APP_URL,
	process.env.APP_BACKEND_IP + ':' + process.env.APP_FRONTED_DEV_PORT,
	process.env.APP_FRONTED_IP + ':' + process.env.APP_FRONTED_PORT,
	process.env.APP_FRONTED_IP_2 + ':' + process.env.APP_FRONTED_PORT_2,
	'http://localhost:3000',
	'https://localhost:3000',
	'http://localhost:3001',
	'http://localhost:3002',
	'http://127.0.0.1:3000',
	'https://192.168.200.227:3000/',
	'http://192.168.200.217:3000/',
];

console.log('authorizedOrigine', authorizedOrigine);

const server = https.createServer(options, app);

app.use(preciseTimeMiddleware);
await initializeTimeSync();

console.log('getPreciseGMTTime()', getPreciseGMTTime().iso);

/* ------------------------------------------------------- */
/* ---------- PEER SERVICES   --------------------- */
/* ------------------------------------------------------- */
const peerServer = ExpressPeerServer(server, {
	debug: true,
	path: '/myapp',
});

app.use('/', peerServer);

peerServer.on('connection', client => {
	console.log(`Client connecté: ${client.getId()}`);
});

peerServer.on('disconnect', client => {
	console.log(`Client déconnecté: ${client.getId()}`);
});

peerServer.on('error', error => {
	console.error('Erreur serveur PeerJS:', error);
});

// Statistiques du serveur
app.get('/stats', (req, res) => {
	res.json({
		connectedClients: peerServer._clients
			? Object.keys(peerServer._clients).length
			: 0,
		uptime: process.uptime(),
		memory: process.memoryUsage(),
	});
});

app
	.use(
		cors({
			origin: authorizedOrigine,
			allowedHeaders: ['Content-Type', 'Authorization'],
			credentials: true,
		}),
	)
	.use(bodyParser.json()) // Middleware for parsing JSON bodies from HTTP requests
	.use(cookieParser())
	.use(express.urlencoded({ extended: true }));

if (process.env.APP_DEBUG) {
	app.use(morgan('dev'));
}

//Désactiver la mise en cache pour eviter l'erreur 304 not modified pour certain navigateur
app.disable('etag');
app.use(express.static(publicFolder));
app.use(router);
app.use('/api/llama', llamaRoutes);

// Gestion des erreurs
app.use(notFoundHandler);
app.use(errorHandler);

app.get('/*', (req, res) => {
	res.sendFile(path.join(publicFolder, 'index.html'));
});

/* ------------------------------------------------------- */
/* ---------- SOCKET SERVICES   --------------------- */
/* ------------------------------------------------------- */

const io = new Server(server, {
	cors: {
		origin: authorizedOrigine,
		credentials: true,
	},
	maxHttpBufferSize: 1e8, // 100 MB
});

io.use(socketMiddleware);

io.on('connection', socket => {
	//Create a room associate in usrCode;
	socket.userID = socket.handshake.auth.usrCode;
	socket.join(socket.userID);
	userListeSocket(socket, io);
	messageIO(socket, io);
	visionController(socket, io);
	broadcastACL(socket, io);
	initGroupSocket(socket, io);
	initCommentSocket(socket, io);
	reaction(socket, io);
});

export const getIo = () => {
	if (!io) throw new Error('Socket.io not initialized');
	return io;
};

//loadFromCache();
/* 
let vectorStoreReady = false;
initVectorStore()
  .then(() => {
    vectorStoreReady = true;
    console.log('✅ Base de connaissances prête.');
  })
  .catch((err) => {
    console.error('❌ Échec de l’initialisation de la base :', err.message);
  }); */

// Cron Syntax '* * * * *' on of * represente
// second | minute | hour | day | month | day of week
cron.schedule('0 0 2 * *', async () => {
	console.log('🕗 Lancement du nettoyage des sessions expirées...');
	await cleanupExpiredSessions();
});

cron.schedule('0 0 23 * *', async () => {
	console.log(`🕗 Lancement du synchronisation date tous les 23 d'interval`);
	await initializeTimeSync();
});

/* ------------------------------------------------------- */
/* ---------- BASE DE DONNEE SERVICES   --------------------- */
/* ------------------------------------------------------- */
sequelize
	.sync()
	.then(() => {
		server.listen(port, () => {
			console.log(`App is listening on port ${port}`);
		});
	})
	.catch(error => {
		console.error('Unable to connect to the database:', error);
	});

/* ------------------------------------------------------- */
/* ---------- IA SERVICES   --------------------- */
/* ------------------------------------------------------- */

// Gestion gracieuse de l'arrêt
process.on('SIGINT', async () => {
	console.log('\nArrêt en cours...');

	// Import dynamique pour éviter les dépendances circulaires
	const { default: llamaService } = await import('./src/services/llamaService.js');

	if (llamaService.llamaProcess) {
		console.log('Arrêt du serveur Llama...');
		await llamaService.stopServer();
	}

	process.exit(0);
});
