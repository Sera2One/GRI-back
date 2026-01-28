import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Sequelize, DataTypes } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration Sequelize
const sequelize = new Sequelize(
	process.env.DB_NAME || 'videoapp',
	process.env.DB_USER || 'postgres',
	process.env.DB_PASSWORD || 'password',
	{
		host: process.env.DB_HOST || 'localhost',
		dialect: 'postgres',
		logging: false,
	},
);

// Modèle Video
const Video = sequelize.define(
	'Video',
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		filename: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		originalName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		mimetype: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		size: {
			type: DataTypes.BIGINT,
			allowNull: false,
		},
		duration: {
			type: DataTypes.FLOAT,
			allowNull: true,
		},
	},
	{
		timestamps: true,
		tableName: 'videos',
	},
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration Multer pour l'upload
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadsDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + path.extname(file.originalname));
	},
});

const upload = multer({
	storage,
	limits: {
		fileSize: 500 * 1024 * 1024, // 500MB max
	},
	fileFilter: (req, file, cb) => {
		const allowedMimes = [
			'video/mp4',
			'video/webm',
			'video/ogg',
			'video/quicktime',
		];
		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(
				new Error(
					'Format de fichier non supporté. Utilisez MP4, WebM, OGG ou MOV.',
				),
			);
		}
	},
});

// Routes

// Obtenir toutes les vidéos
app.get('/api/videos', async (req, res) => {
	try {
		const videos = await Video.findAll({
			order: [['createdAt', 'DESC']],
		});
		res.json(videos);
	} catch (error) {
		console.error('Erreur lors de la récupération des vidéos:', error);
		res.status(500).json({ error: 'Erreur serveur' });
	}
});

// Obtenir une vidéo par ID
app.get('/api/videos/:id', async (req, res) => {
	try {
		const video = await Video.findByPk(req.params.id);
		if (!video) {
			return res.status(404).json({ error: 'Vidéo non trouvée' });
		}
		res.json(video);
	} catch (error) {
		console.error('Erreur lors de la récupération de la vidéo:', error);
		res.status(500).json({ error: 'Erreur serveur' });
	}
});

// Upload une vidéo
app.post('/api/videos/upload', upload.single('video'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'Aucun fichier uploadé' });
		}

		const { title, description } = req.body;

		const video = await Video.create({
			title: title || req.file.originalname,
			description: description || '',
			filename: req.file.filename,
			originalName: req.file.originalname,
			mimetype: req.file.mimetype,
			size: req.file.size,
		});

		res.status(201).json(video);
	} catch (error) {
		console.error("Erreur lors de l'upload:", error);
		res.status(500).json({ error: "Erreur lors de l'upload" });
	}
});

// Streaming de vidéo
app.get('/api/videos/:id/stream', async (req, res) => {
	try {
		const video = await Video.findByPk(req.params.id);
		if (!video) {
			return res.status(404).json({ error: 'Vidéo non trouvée' });
		}

		const videoPath = path.join(uploadsDir, video.filename);
		const stat = fs.statSync(videoPath);
		const fileSize = stat.size;
		const range = req.headers.range;

		if (range) {
			const parts = range.replace(/bytes=/, '').split('-');
			const start = parseInt(parts[0], 10);
			const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
			const chunksize = end - start + 1;
			const file = fs.createReadStream(videoPath, { start, end });
			const head = {
				'Content-Range': `bytes ${start}-${end}/${fileSize}`,
				'Accept-Ranges': 'bytes',
				'Content-Length': chunksize,
				'Content-Type': video.mimetype,
			};
			res.writeHead(206, head);
			file.pipe(res);
		} else {
			const head = {
				'Content-Length': fileSize,
				'Content-Type': video.mimetype,
			};
			res.writeHead(200, head);
			fs.createReadStream(videoPath).pipe(res);
		}
	} catch (error) {
		console.error('Erreur lors du streaming:', error);
		res.status(500).json({ error: 'Erreur lors du streaming' });
	}
});

// Télécharger une vidéo
app.get('/api/videos/:id/download', async (req, res) => {
	try {
		const video = await Video.findByPk(req.params.id);
		if (!video) {
			return res.status(404).json({ error: 'Vidéo non trouvée' });
		}

		const videoPath = path.join(uploadsDir, video.filename);
		res.download(videoPath, video.originalName);
	} catch (error) {
		console.error('Erreur lors du téléchargement:', error);
		res.status(500).json({ error: 'Erreur lors du téléchargement' });
	}
});

// Supprimer une vidéo
app.delete('/api/videos/:id', async (req, res) => {
	try {
		const video = await Video.findByPk(req.params.id);
		if (!video) {
			return res.status(404).json({ error: 'Vidéo non trouvée' });
		}

		const videoPath = path.join(uploadsDir, video.filename);
		if (fs.existsSync(videoPath)) {
			fs.unlinkSync(videoPath);
		}

		await video.destroy();
		res.json({ message: 'Vidéo supprimée avec succès' });
	} catch (error) {
		console.error('Erreur lors de la suppression:', error);
		res.status(500).json({ error: 'Erreur lors de la suppression' });
	}
});

// Synchronisation de la base de données et démarrage du serveur
sequelize
	.sync({ alter: true })
	.then(() => {
		console.log('Base de données synchronisée');
		app.listen(PORT, () => {
			console.log(`Serveur démarré sur le port ${PORT}`);
		});
	})
	.catch(error => {
		console.error('Erreur de synchronisation:', error);
	});
