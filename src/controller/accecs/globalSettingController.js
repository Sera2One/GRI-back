import { sequelize } from '../../db/config/database.js';
import initModels from '../../db/models/init-models.js';
import { generateId } from '../../services/generateId.js';
import { getPreciseGMTTime } from '../../services/timeSync.js';

const models = initModels(sequelize);

// GET all global settings
export const getGlobalSettings = async (req, res) => {
	try {
		const result = await models.VariableGlobale.findAll();
		return res.status(200).json({ success: true, data: result });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ success: false, message: 'Erreur serveur' });
	}
};

// UPDATE one global setting by var_g_code
export const updateGlobalSetting = async (req, res) => {
	const { code } = req.params;
	const { value } = req.body;

	if (value === undefined || value === null) {
		return res
			.status(400)
			.json({ success: false, message: 'Valeur manquante' });
	}

	try {
		const [rowCount] = await models.VariableGlobale.update(
			{ varGValue: String(value), varGCreatedDate: getPreciseGMTTime().iso },
			{ where: { varGCode: code } }
		);

		if (rowCount === 0) {
			return res
				.status(404)
				.json({ success: false, message: 'Variable non trouvée' });
		}

		// 🔁 Récupérer l'objet mis à jour
		const updatedRecord = await models.VariableGlobale.findOne({
			where: { varGCode: code }
		});

		if (!updatedRecord) {
			return res
				.status(500)
				.json({ success: false, message: 'Échec de récupération après mise à jour' });
		}

		return res.status(200).json({ success: true, data: updatedRecord });
	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ success: false, message: 'Erreur lors de la mise à jour' });
	}
};