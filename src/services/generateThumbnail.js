import { execFile } from 'node:child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ffmpegPath = join(__dirname, '../lib/ffmpeg/bin/ffmpeg');
const ffmpegLibPath = join(__dirname, '../lib/ffmpeg/lib'); 

/**
 * Génère une image (thumbnail) à partir d'une vidéo en utilisant ffmpeg.
 *
 * @param {string} videoPath - Chemin absolu ou relatif vers la vidéo source.
 * @param {string} outputPath - Chemin absolu ou relatif vers l'image de sortie (ex: 'thumb.jpg').
 * @param {number} [timeInSeconds=1] - Temps (en secondes) dans la vidéo où extraire l'image.
 * @returns {Promise<void>} - Résout si succès, rejette en cas d'erreur.
 */
export default function generateThumbnail(videoPath, outputPath, timeInSeconds = 1) {
	// Valider les extensions (optionnel mais utile)
	const validImageExt = ['.jpg', '.jpeg', '.png', '.webp'];
	const ext = path.extname(outputPath).toLowerCase();
	if (!validImageExt.includes(ext)) {
		return Promise.reject(
			new Error(
				`Format d'image non supporté : ${ext}. Utilisez ${validImageExt.join(
					', ',
				)}.`,
			),
		);
	}

	const args = [
		'-ss',
		String(timeInSeconds),
		'-i',
		videoPath,
		'-vframes',
		'1',
		'-q:v',
		'2',
		'-y',
		outputPath,
	];

	// On copie l’env actuel pour ne pas polluer le processus parent
	const env = { ...process.env };
	env.LD_LIBRARY_PATH = ffmpegLibPath + ':' + (env.LD_LIBRARY_PATH || '');

	// Commande ffmpeg : extraire une image à `timeInSeconds`
	return new Promise((resolve, reject) => {
		execFile(ffmpegPath, args, { env }, (error, stdout, stderr) => {
			if (error) {
				console.error('Erreur ffmpeg :', stderr || error.message);
				reject(
					new Error(`Échec de la génération du thumbnail : ${error.message}`),
				);
			} else {
				resolve();
			}
		});
	});
}
