//privacyController.js;

import { getUserPrivacySetting, getUserVisibleData, resetPrivacySetting, updatePrivacySetting } from "../../services/privacyService.js";


  /**
   * Récupère les données visibles d'un utilisateur
   */
export const  getVisibleData = async (req, res) => {
    try {
      const { userCode } = req.query;
      const viewerRelationship = req.query.relationship || 'public'; // 'self', 'friend', 'public'
      
       const visibleData = await getUserVisibleData({
					targetUserCode: userCode,
					viewerRelationship: viewerRelationship,
				});
      
      res.json({
        success: true,
        data: visibleData
      });
      
    } catch (error) {
      
			res.status(500).json({
				success: false,
				message: error.message,
			});
    }
  }
  
  /**
   * Récupère les paramètres de confidentialité
   */
export const  getPrivacySettings = async (req, res) => {
    try {
      const { userCode } = req.query      
      const settings = await getUserPrivacySetting(userCode);
      
      res.json({
        success: true,
        data: settings
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * Met à jour les paramètres de confidentialité
   */
export const  updatePrivacySettings = async (req, res) => {
    try {
      const { userCode } = req.query;
      const { defaultVisibility, fieldSettings } = req.body;
      console.log('req.body', req.body);
      
      
      const updatedSettings = await updatePrivacySetting(
        userCode, 
        { defaultVisibility, fieldSettings }
      );
      
      res.json({
        success: true,
        message: 'Paramètres mis à jour avec succès',
        data: updatedSettings
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * Réinitialise les paramètres de confidentialité
   */
export const  resetPrivacySettings = async (req, res) => {
    try {
      const { userCode } = req.query;
      
      const defaultSettings = await resetPrivacySetting(userCode);
      
      res.json({
        success: true,
        message: 'Paramètres réinitialisés avec succès',
        data: defaultSettings
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }