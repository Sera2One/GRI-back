import { Router } from 'express';
import {
	getUser,
	getUserById,
	updateUser,
	deleteUser,
	getUserProfile,
	addUserProfile,
	getUserList,
} from '../controller/auth/usersController.js';
import { scanIP } from "../controller/network/nmap/nmapController.js";
import { getNetworkScanHistory } from "../controller/network/historyScanControleur.js";
import {
	postGroupe,
	getGroupe,
	getGroupeById,
	updateGroupe,
	deleteGroupe,
} from '../controller/groupe/groupeController.js';
import {
	appLogin,
	logout,
	postUser,
	refresh,
	MailIsExist,
	passwordReset,
	sendOTPETomail,
	getVerifyKey,
	getServerKey,
} from '../controller/auth/authController.js';

import {
	getMessage,
	updateMessage,
	deleteMessage,
	AddFileTmpMsg,
	deleteFilesTmpMsg,
	getAllFilesTmpMsg,
} from '../controller/message/messageController.js';
import auth from '../middleware/Auth.js';
import multer from 'multer';

import {
	AddFileTmpPost,
	PostEditRequest,
	deleteFilesTmpPost,
	deletePost,
	deleteRestoreDisableEnablePost,
	downloadVideo,
	getAllFilesTmpPost,
	getPost,
	getPostById,
	postPost,
	streamVideo,
	updatePost,
} from '../controller/post/postControler.js';
import {
	getComment,
	postComment,
} from '../controller/post/commentControleur.js';
import {
	getCall,
	postCall,
	updateCall,
} from '../controller/vision//CallController.js';
import 'dotenv/config';
import {
	getNotifications,
	markAllRead,
	markAsRead,
} from '../controller/notifications/notificationsControleur.js';
import {
	getSettings,
	getSettingsHistory,
	resetSettings,
	updateSettings,
} from '../controller/setting/settingController.js';
import {
	exportSessionsCSV,
	getSessionsList,
	getSessionStats,
	getUserSessionHistory,
	putDisconnectSession,
} from '../controller/session/sessionController.js';
import { getAdminStats, getUserStats } from '../controller/stats/statsController.js';
import {
	getGroupAccess,
	getUserAccess,
	updateGroupAccess,
} from '../controller/accecs/appAccesControleur.js';

import {
	getPrivacySettings,
	getVisibleData,
	resetPrivacySettings,
	updatePrivacySettings,
} from '../controller/auth/privacyController.js';
import { createReport, getReports, getReportStats, updateReportStatus } from '../controller/reports/reportsController.js';
import { handleAsk, handleHealth } from '../controller/Assistance/assistanceController.js';
import { getSystemInfo } from '../controller/system/systemController.js';
import { getGlobalSettings, updateGlobalSetting } from '../controller/accecs/globalSettingController.js';

const router = Router();
const publicFolder = process.env.APP_PUBLIC_FOLDER;
const tmpFolder = publicFolder + '/tmp';
const apiVersion = 'v1.0';

//Route for users
router.get(`/api/${apiVersion}/userListe`, auth, getUserList);
router.get(`/api/${apiVersion}/users`, auth, getUser);
router.get(`/api/${apiVersion}/users/:id`, getUserById);
router.put(`/api/${apiVersion}/users/:id`, auth, updateUser);
router.delete(`/api/${apiVersion}/users/:id`, auth, deleteUser);

router.get(`/api/${apiVersion}/get-user-profile-tmp/:id`, auth, getUserProfile);
router.post(
	`/api/${apiVersion}/add-user-profile-tmp/:id`,
	multer({ dest: tmpFolder }).single('file'),
	addUserProfile,
);

//Route for groupes
router.post(`/api/${apiVersion}/groupes`, auth, postGroupe);
router.get(`/api/${apiVersion}/groupes`, auth, getGroupe);
router.get(`/api/${apiVersion}/groupes/:id`, auth, getGroupeById);
router.put(`/api/${apiVersion}/groupes/:id`, auth, updateGroupe);
router.delete(`/api/${apiVersion}/groupes/:id`, auth, deleteGroupe);

router.get(`/api/${apiVersion}/admin/stats`, getAdminStats);
router.get(`/api/${apiVersion}/user/stats/:id`, getUserStats);
router.get(`/api/${apiVersion}/admin/sessions/stats`, getSessionStats);
router.get(`/api/${apiVersion}/admin/sessions/list`, getSessionsList);
router.post(`/api/${apiVersion}/admin/sessions/export`, exportSessionsCSV);
router.get(`/api/${apiVersion}/user/sessions`, getUserSessionHistory);
router.put(`/api/${apiVersion}/user/sessions`, putDisconnectSession);



//Route for Message
router.get(`/api/${apiVersion}/messages`, getMessage);
router.delete(`/api/${apiVersion}/messages/:id/user/:usrCode`, deleteMessage);
router.put(`/api/${apiVersion}/messages/:id`, updateMessage);
router.post(
	`/api/${apiVersion}/add-message-file-tmp`,
	multer({ dest: tmpFolder }).single('file'),
	AddFileTmpMsg,
);
router.delete(`/api/${apiVersion}/delete-message-file-tmp`, deleteFilesTmpMsg);
router.get(`/api/${apiVersion}/get-all-message-file-tmp`, getAllFilesTmpMsg);

// Route of all activitie historie
//router.get(`/api/${apiVersion}/history-event/button`, getBoutt );

// Route for
router.get(`/api/${apiVersion}/post`, getPost);
router.get(`/api/${apiVersion}/post-detail/:id`, getPostById);
router.post(`/api/${apiVersion}/post`, postPost);
router.put(`/api/${apiVersion}/post/:id`, updatePost);
router.delete(`/api/${apiVersion}/post/:id`, deletePost);
router.put(
	`/api/${apiVersion}/post-edit-admin/:id`,
	deleteRestoreDisableEnablePost,
);
router.post(
	`/api/${apiVersion}/post-file-tmp`,
	multer({ dest: tmpFolder }).array('file', 12),
	AddFileTmpPost,
);
router.get(`/api/${apiVersion}/videos/:id/stream`, streamVideo);
router.get(`/api/${apiVersion}/videos/:id/download`, downloadVideo);
router.delete(`/api/${apiVersion}/delete-file-tmp`, deleteFilesTmpPost);
router.get(`/api/${apiVersion}/get-all-file-tmp`, getAllFilesTmpPost);
router.get(
	`/api/${apiVersion}/postEditTmp/:usr_code/:post_code`,
	PostEditRequest,
);

// Route for notification
router.get(`/api/${apiVersion}/notifications`, getNotifications);
router.get(`/api/${apiVersion}/notifications/mark-all-read`, markAllRead);
router.get(`/api/${apiVersion}/notifications/mark-as-readed`, markAsRead);

// Route for comment
router.get(`/api/${apiVersion}/comments`, getComment);
router.post(`/api/${apiVersion}/comments`, postComment);

// Route for appel
router.get(`/api/${apiVersion}/appels`, getCall);
router.post(`/api/${apiVersion}/appels`, postCall);
router.put(`/api/${apiVersion}/appels/:id`, updateCall);

// Route for settings
router.get(`/api/${apiVersion}/settings/`, getSettings); // GET /api/v1/settings
router.post(`/api/${apiVersion}/settings/update`, updateSettings); // POST /api/v1/settings/update
router.post(`/api/${apiVersion}/settings/reset`, resetSettings); // POST /api/v1/settings/reset
router.get(`/api/${apiVersion}/settings/history`, getSettingsHistory); // GET /api/v1/settings/history

//Route for Auth
router.post(`/api/${apiVersion}/login`, appLogin);
router.get(`/api/${apiVersion}/refresh-token`, refresh);
router.get(`/api/${apiVersion}/logout`, logout);
router.post(`/api/${apiVersion}/create-account`, postUser);
router.get(`/api/${apiVersion}/server-key`, getServerKey);
router.post(`/api/${apiVersion}/verify-server-key`, getVerifyKey);

router.post(`/api/${apiVersion}/send_recovery_email`, sendOTPETomail);
router.post(`/api/${apiVersion}/verify_login_account`, MailIsExist);
router.post(`/api/${apiVersion}/reset_password`, passwordReset);

// Accès par groupe
router.get(`/api/${apiVersion}/acces/groupes/:grpCode`, getGroupAccess);
router.post(
	`/api/${apiVersion}/acces/groupes/:grpCode/update`,
	updateGroupAccess,
);

// Accès par utilisateur
router.get(`/api/${apiVersion}/acces/users/:usrCode`, getUserAccess);

// Acces global
router.get(`/api/${apiVersion}/global-setting-access`, getGlobalSettings);
router.put(
	`/api/${apiVersion}/global-setting-access/:code`,
	updateGlobalSetting,
);


  // Récupérer les données visibles d'un utilisateur
router.get(`/api/${apiVersion}/privacy/visible-data`, getVisibleData);  
router.get(`/api/${apiVersion}/privacy/privacy-settings`, getPrivacySettings);  
router.put(`/api/${apiVersion}/privacy/privacy-settings`, updatePrivacySettings);  
router.delete(`/api/${apiVersion}/privacy/privacy-settings`, resetPrivacySettings);


// 

// Routes utilisateurs
router.post(`/api/${apiVersion}/reports`, createReport);
router.get(`/api/${apiVersion}/reports`, getReports);
router.put(`/api/${apiVersion}/reports/:rptCode/status`, updateReportStatus);
router.get(`/api/${apiVersion}/reports/stats`,getReportStats);


router.post('/ask', handleAsk);
router.get('/health', handleHealth);


router.get(`/api/${apiVersion}/admin/system-info`, getSystemInfo);


// Route for scan all Ip
router.get(`/api/${apiVersion}/scan`, scanIP );
router.get(`/api/${apiVersion}/hisitory/scan`, getNetworkScanHistory)



export default router;
