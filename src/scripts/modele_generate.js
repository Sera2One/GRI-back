import { SequelizeAuto } from 'sequelize-auto';
import { sequelize } from '../db/config/database.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cleanModelFolder = async () => {
	const modelFolder = path.join(__dirname, '../db/models');
      console.log('modelFolder', modelFolder);
      

	if (fs.existsSync(modelFolder)) {
		try {
			await fs.promises.rm(modelFolder, { recursive: true, force: true });
			console.log(`Folder '${modelFolder}' deleted successfully.`);
		} catch (err) {
			console.error(`Error deleting folder '${modelFolder}':`, err);
		}
	} else {
		console.log(`Folder '${modelFolder}' does not exist, skipping deletion.`);
	}
};

const generateModels = async () => {
	try {
		await cleanModelFolder();

		const options = {
			caseFile: 'l',
			caseModel: 'p',
			caseProp: 'c',
			lang: 'esm',
			views: true,
		};

		const auto = new SequelizeAuto(sequelize, null, null, options);
		await auto.run();

		console.log('Models generated successfully!');
	} catch (error) {
		console.error('Error generating models:', error);
	}
};

generateModels();
