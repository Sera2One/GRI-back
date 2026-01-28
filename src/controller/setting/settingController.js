//Attention model //models.UserSettings.findAll suit une convention lower camel case dans les l'app (exption sequelize  et include );
import { sequelize } from '../../db/config/database.js';
import initModels from '../../db/models/init-models.js';
import {
	getUserSettings,
	upsertUserSetting,
	resetUserGlobalSettings,
	getSettingsHistoryService,
} from '../../services/settingService.js';

const models = initModels(sequelize);

// =========================================================
// GET /api/v1/settings?usrCode=xxx&deviceId=yyy
// =========================================================
export const getSettings = async (req, res) => {
	try {
		const { usrCode, deviceId } = req.query;

		if (!usrCode) {
			return res.status(400).json({ error: 'usrCode is required' });
		}

		const settings = await getUserSettings(usrCode, deviceId);

		res.json({
			success: true,
			data: settings,
		});
	} catch (error) {
		console.error('Error fetching settings:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

// =========================================================
// POST /api/v1/settings/update
// Body: { usrCode, settingScope, settingsValue, deviceId? }
// =========================================================
export const updateSettings = async (req, res) => {
	try {
		const { usrCode, settingScope, settingsValue, deviceId } = req.body;
            console.log('req.body', req.body);
            

		if (!usrCode || !settingScope || !settingsValue) {
			return res.status(400).json({ error: 'Missing required fields' });
		}

		const changedBy = req.user?.usrCode || 'system'; // Si tu as un middleware d'auth

		const updatedSetting = await upsertUserSetting(
			{
				usrCode,
				settingScope,
				settingsValue,
				deviceId,
			},
			changedBy,
		);

		res.json({
			success: true,
			data: updatedSetting,
			message: 'Settings updated successfully',
		});
	} catch (error) {
		console.error('Error updating settings:', error);
		res.status(500).json({ error: error.message || 'Internal server error' });
	}
};

// =========================================================
// POST /api/v1/settings/reset
// Body: { usrCode }
// =========================================================
export const resetSettings = async (req, res) => {
	try {
		const { usrCode } = req.body;

		if (!usrCode) {
			return res.status(400).json({ error: 'usrCode is required' });
		}

		const changedBy = req.user?.usrCode || 'system';

		const resetSetting = await resetUserGlobalSettings(
			usrCode,
			models,
			changedBy,
		);

		res.json({
			success: true,
			data: resetSetting,
			message: 'Global settings reset to default',
		});
	} catch (error) {
		console.error('Error resetting settings:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};


// =========================================================
// GET /api/v1/settings/history?usrCode=xxx&scope=APP_GLOBAL&page=1&limit=20
// =========================================================
export const getSettingsHistory = async (req, res) => {
  try {
    const {
      usrCode,
      scope,
      deviceCode,
      page = 1,
      limit = 20,
      startDate,
      endDate,
    } = req.query;

    if (!usrCode) {
      return res.status(400).json({ error: 'usrCode is required' });
    }

    const history = await getSettingsHistoryService(
      usrCode,
      {
        scope,
        deviceCode,
        page,
        limit,
        startDate,
        endDate,
      }
    );

    res.json({
      success: true,
       history,
      message: `Historique des paramètres pour ${usrCode}`,
    });
  } catch (error) {
    console.error('Error fetching settings history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};