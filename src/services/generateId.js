// groupeControleur.io.js
import { sequelize } from '../db/config/database.js';
import initModels from '../db/models/init-models.js';
const models = initModels(sequelize);
const PrefixSeparator = '-';

const messagePrefix = 'msg';
const groupeMessagePrefix = 'gu-message';
const groupeNamePrefix = 'gu-name';
const groupeMemberPrefix = 'gu-member';
const userPrefix = 'user';
const sessionPrefix = 'session';
const groupesPrefix = 'grp';
const postPrefix = 'post';
const commentPrefix = 'cmt';
const commentReactionPrefix = 'c_r';
const postReactionPrefix = 'p_r';
const messageReactionPrefix = 'm_r'
const commentReplyPrefix = 'cr';
const postHistoryModifPrefix = 'phm';
const notificationPrefix = 'notif';
const userSettingsPrefix = 'setting'; 
const userSettingsHistoryPrefix = 'set_h';
const historyGroupeAccesPrefix = 'hist_grp_a';
const userFieldVisibilityPrefix = 'ufv';
const reportPrefix = 'rpt'


//not used
const motDePasseOubliePrefix = 'mdpo';
const msgFileJointPrefix = 'msgFileJoint';
const msgRoomGroupePrefix = 'msgRoomGroupe';

// Fonction utilitaire pour générer des IDs
export async function generateId(tableName) {
	let lastData;
	let limit = 20;
	let prefix;
	let last_code;
	switch (tableName) {
		case 'Messages':
			lastData = await models.Messages.findAll({
				order: [['msg_created_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = messagePrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.msgCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;
		case 'GroupeUserName':
			lastData = await models.GroupeUserName.findAll({
				order: [['gun_created_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = groupeNamePrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.gunCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;

		case 'GroupeUserMember':
			lastData = await models.GroupeUserMember.findAll({
				order: [['gum_user_added_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = groupeMemberPrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.gumCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;

		case 'GroupeUserMessage':
			lastData = await models.GroupeUserMessage.findAll({
				order: [['gumes_created_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = groupeMessagePrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.gumesCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;

		case 'Users':
			lastData = await models.Users.findAll({
				order: [['usr_created_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = userPrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.usrCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;

		case 'Session':
			lastData = await models.Session.findAll({
				order: [['session_created_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = sessionPrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.sessionCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;

		case 'Groupes':
			lastData = await models.Groupes.findAll({
				order: [['grp_created_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = groupesPrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.grpCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;

		case 'Post':
			lastData = await models.Post.findAll({
				order: [['post_created_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = postPrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.postCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;
		case 'Comment':
			lastData = await models.Comment.findAll({
				order: [['cmt_created_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = commentPrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.cmtCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;
		case 'CommentReply':
			lastData = await models.CommentReply.findAll({
				order: [['cr_created_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = commentReplyPrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.crCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;

		case 'PostHistoryModif':
			lastData = await models.PostHistoryModif.findAll({
				order: [['phm_created_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = postHistoryModifPrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.phmCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;

		case 'MotDePasseOublie':
			lastData = await models.MotDePasseOublie.findAll({
				order: [['mdpo_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = motDePasseOubliePrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.mdpoCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;

		case 'MsgFileJoint':
			lastData = await models.MsgFileJoint.findAll({
				order: [['msg_file_created_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = msgFileJointPrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.msgFileCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;

		case 'MsgRoomGroupe':
			lastData = await models.MsgRoomGroupe.findAll({
				order: [['msg_room_grp_created_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = msgRoomGroupePrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.msgRoomGrpCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;

		case 'CommentReactions':
			lastData = await models.CommentReactions.findAll({
				order: [['c_react_created_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = commentReactionPrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.cReactCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;
		case 'PostReactions':
			lastData = await models.PostReactions.findAll({
				order: [['p_react_created_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = postReactionPrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.pReactCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;
		case 'MessageReactions':
			lastData = await models.MessageReactions.findAll({
				order: [['m_react_created_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = messageReactionPrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.mReactCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;
		case 'Notifications':
			lastData = await models.Notifications.findAll({
				order: [['notif_actor_created_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = notificationPrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.notifCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;
		case 'UserSettings':
			lastData = await models.UserSettings.findAll({
				order: [['usr_s_created_at', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = userSettingsPrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.usrSCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;
		case 'UserSettingsHistory':
			lastData = await models.UserSettingsHistory.findAll({
				order: [['usr_s_h_changed_at', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = userSettingsHistoryPrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.usrSHCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;
		case 'HistoryGroupeAcces':
			lastData = await models.HistoryGroupeAcces.findAll({
				order: [['hist_grp_a_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = historyGroupeAccesPrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.usrSHCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;
		case 'UserFieldVisibility':
			lastData = await models.UserFieldVisibility.findAll({
				order: [['ufv_created_date', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = userFieldVisibilityPrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.ufvCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;
		case 'Reports':
			lastData = await models.Reports.findAll({
				order: [['rpt_created_at', 'DESC']],
				raw: true,
				limit: limit,
			});
			prefix = userFieldVisibilityPrefix;
			last_code = !lastData.length
				? 0
				: lastData
						.map(function (id) {
							return parseInt(id.rptCode.match(/\d+/g));
						})
						.reduce((previousId, currentId) =>
							previousId > currentId ? previousId : currentId,
						);
			break;

		default:
			console.log(`table non prise en charge : ${tableName}.`);
	}

	//console.log('lastData', lastData);

	const code = prefix + PrefixSeparator + (last_code + 1);

	//console.log('code', code);

	return code;
}
