import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _AccesGroupeCreator from  "./acces_groupe_creator.js";
import _AdditionnalState from  "./additionnal_state.js";
import _Buttons from  "./buttons.js";
import _Call from  "./call.js";
import _CallDestCode from  "./call_dest_code.js";
import _CallRoomAutorizedUser from  "./call_room_autorized_user.js";
import _Comment from  "./comment.js";
import _CommentReactions from  "./comment_reactions.js";
import _Components from  "./components.js";
import _DestMsgRoomGrp from  "./dest_msg_room_grp.js";
import _Destination from  "./destination.js";
import _GroupeAcces from  "./groupe_acces.js";
import _GroupeAccesView from  "./groupe_acces_view.js";
import _GroupeUserFiles from  "./groupe_user_files.js";
import _GroupeUserMember from  "./groupe_user_member.js";
import _GroupeUserMessage from  "./groupe_user_message.js";
import _GroupeUserName from  "./groupe_user_name.js";
import _Groupes from  "./groupes.js";
import _HistoryGroupeAcces from  "./history_groupe_acces.js";
import _HistoryGroupeModif from  "./history_groupe_modif.js";
import _HistoryMetiersModif from  "./history_metiers_modif.js";
import _HistoryUserModified from  "./history_user_modified.js";
import _HistoryUsersOnLine from  "./history_users_on_line.js";
import _HistoryUsrCreateGroupe from  "./history_usr_create_groupe.js";
import _HistoryVarG from  "./history_var_g.js";
import _ListUserCreated from  "./list_user_created.js";
import _Menu from  "./menu.js";
import _MessageReactions from  "./message_reactions.js";
import _MessageViews from  "./message_views.js";
import _Messages from  "./messages.js";
import _Metiers from  "./metiers.js";
import _Modules from  "./modules.js";
import _MotDePasseOublie from  "./mot_de_passe_oublie.js";
import _MsgFileJoint from  "./msg_file_joint.js";
import _MsgRoomGroupe from  "./msg_room_groupe.js";
import _NotificationTypes from  "./notification_types.js";
import _Notifications from  "./notifications.js";
import _Pages from  "./pages.js";
import _PinnedPost from  "./pinned_post.js";
import _Post from  "./post.js";
import _PostFileJoint from  "./post_file_joint.js";
import _PostHistoryModif from  "./post_history_modif.js";
import _PostReactions from  "./post_reactions.js";
import _Reports from  "./reports.js";
import _Session from  "./session.js";
import _State from  "./state.js";
import _UserFieldVisibility from  "./user_field_visibility.js";
import _UserSettings from  "./user_settings.js";
import _UserSettingsHistory from  "./user_settings_history.js";
import _Users from  "./users.js";
import _UsrCreatorList from  "./usr_creator_list.js";
import _VariableGlobale from  "./variable_globale.js";

export default function initModels(sequelize) {
  const AccesGroupeCreator = _AccesGroupeCreator.init(sequelize, DataTypes);
  const AdditionnalState = _AdditionnalState.init(sequelize, DataTypes);
  const Buttons = _Buttons.init(sequelize, DataTypes);
  const Call = _Call.init(sequelize, DataTypes);
  const CallDestCode = _CallDestCode.init(sequelize, DataTypes);
  const CallRoomAutorizedUser = _CallRoomAutorizedUser.init(sequelize, DataTypes);
  const Comment = _Comment.init(sequelize, DataTypes);
  const CommentReactions = _CommentReactions.init(sequelize, DataTypes);
  const Components = _Components.init(sequelize, DataTypes);
  const DestMsgRoomGrp = _DestMsgRoomGrp.init(sequelize, DataTypes);
  const Destination = _Destination.init(sequelize, DataTypes);
  const GroupeAcces = _GroupeAcces.init(sequelize, DataTypes);
  const GroupeAccesView = _GroupeAccesView.init(sequelize, DataTypes);
  const GroupeUserFiles = _GroupeUserFiles.init(sequelize, DataTypes);
  const GroupeUserMember = _GroupeUserMember.init(sequelize, DataTypes);
  const GroupeUserMessage = _GroupeUserMessage.init(sequelize, DataTypes);
  const GroupeUserName = _GroupeUserName.init(sequelize, DataTypes);
  const Groupes = _Groupes.init(sequelize, DataTypes);
  const HistoryGroupeAcces = _HistoryGroupeAcces.init(sequelize, DataTypes);
  const HistoryGroupeModif = _HistoryGroupeModif.init(sequelize, DataTypes);
  const HistoryMetiersModif = _HistoryMetiersModif.init(sequelize, DataTypes);
  const HistoryUserModified = _HistoryUserModified.init(sequelize, DataTypes);
  const HistoryUsersOnLine = _HistoryUsersOnLine.init(sequelize, DataTypes);
  const HistoryUsrCreateGroupe = _HistoryUsrCreateGroupe.init(sequelize, DataTypes);
  const HistoryVarG = _HistoryVarG.init(sequelize, DataTypes);
  const ListUserCreated = _ListUserCreated.init(sequelize, DataTypes);
  const Menu = _Menu.init(sequelize, DataTypes);
  const MessageReactions = _MessageReactions.init(sequelize, DataTypes);
  const MessageViews = _MessageViews.init(sequelize, DataTypes);
  const Messages = _Messages.init(sequelize, DataTypes);
  const Metiers = _Metiers.init(sequelize, DataTypes);
  const Modules = _Modules.init(sequelize, DataTypes);
  const MotDePasseOublie = _MotDePasseOublie.init(sequelize, DataTypes);
  const MsgFileJoint = _MsgFileJoint.init(sequelize, DataTypes);
  const MsgRoomGroupe = _MsgRoomGroupe.init(sequelize, DataTypes);
  const NotificationTypes = _NotificationTypes.init(sequelize, DataTypes);
  const Notifications = _Notifications.init(sequelize, DataTypes);
  const Pages = _Pages.init(sequelize, DataTypes);
  const PinnedPost = _PinnedPost.init(sequelize, DataTypes);
  const Post = _Post.init(sequelize, DataTypes);
  const PostFileJoint = _PostFileJoint.init(sequelize, DataTypes);
  const PostHistoryModif = _PostHistoryModif.init(sequelize, DataTypes);
  const PostReactions = _PostReactions.init(sequelize, DataTypes);
  const Reports = _Reports.init(sequelize, DataTypes);
  const Session = _Session.init(sequelize, DataTypes);
  const State = _State.init(sequelize, DataTypes);
  const UserFieldVisibility = _UserFieldVisibility.init(sequelize, DataTypes);
  const UserSettings = _UserSettings.init(sequelize, DataTypes);
  const UserSettingsHistory = _UserSettingsHistory.init(sequelize, DataTypes);
  const Users = _Users.init(sequelize, DataTypes);
  const UsrCreatorList = _UsrCreatorList.init(sequelize, DataTypes);
  const VariableGlobale = _VariableGlobale.init(sequelize, DataTypes);

  Call.belongsToMany(Users, { as: 'usrCodeUsers', through: CallDestCode, foreignKey: "callCode", otherKey: "usrCode" });
  Groupes.belongsToMany(Users, { as: 'usrCodeUsersHistoryGroupeModifs', through: HistoryGroupeModif, foreignKey: "grpCode", otherKey: "usrCode" });
  Groupes.belongsToMany(Users, { as: 'usrCodeUsersHistoryUsrCreateGroupes', through: HistoryUsrCreateGroupe, foreignKey: "grpCode", otherKey: "usrCode" });
  Groupes.belongsToMany(UsrCreatorList, { as: 'usrCreatorCodeUsrCreatorLists', through: AccesGroupeCreator, foreignKey: "grpCode", otherKey: "usrCreatorCode" });
  Messages.belongsToMany(State, { as: 'stateCodeStates', through: AdditionnalState, foreignKey: "msgCode", otherKey: "stateCode" });
  Messages.belongsToMany(Users, { as: 'usrCodeUsersDestinations', through: Destination, foreignKey: "msgCode", otherKey: "usrCode" });
  Metiers.belongsToMany(Users, { as: 'usrCodeUsersHistoryMetiersModifs', through: HistoryMetiersModif, foreignKey: "mtrCode", otherKey: "usrCode" });
  MsgRoomGroupe.belongsToMany(Users, { as: 'usrCodeUsersCallRoomAutorizedUsers', through: CallRoomAutorizedUser, foreignKey: "msgRoomGrpCode", otherKey: "usrCode" });
  State.belongsToMany(Messages, { as: 'msgCodeMessages', through: AdditionnalState, foreignKey: "stateCode", otherKey: "msgCode" });
  Users.belongsToMany(Call, { as: 'callCodeCalls', through: CallDestCode, foreignKey: "usrCode", otherKey: "callCode" });
  Users.belongsToMany(Groupes, { as: 'grpCodeGroupesHistoryGroupeModifs', through: HistoryGroupeModif, foreignKey: "usrCode", otherKey: "grpCode" });
  Users.belongsToMany(Groupes, { as: 'grpCodeGroupesHistoryUsrCreateGroupes', through: HistoryUsrCreateGroupe, foreignKey: "usrCode", otherKey: "grpCode" });
  Users.belongsToMany(Messages, { as: 'msgCodeMessagesDestinations', through: Destination, foreignKey: "usrCode", otherKey: "msgCode" });
  Users.belongsToMany(Metiers, { as: 'mtrCodeMetiers', through: HistoryMetiersModif, foreignKey: "usrCode", otherKey: "mtrCode" });
  Users.belongsToMany(MsgRoomGroupe, { as: 'msgRoomGrpCodeMsgRoomGroupes', through: CallRoomAutorizedUser, foreignKey: "usrCode", otherKey: "msgRoomGrpCode" });
  Users.belongsToMany(UsrCreatorList, { as: 'usrCreatorCodeUsrCreatorListHistoryUserModifieds', through: HistoryUserModified, foreignKey: "usrCode", otherKey: "usrCreatorCode" });
  Users.belongsToMany(UsrCreatorList, { as: 'usrCreatorCodeUsrCreatorListListUserCreateds', through: ListUserCreated, foreignKey: "usrCode", otherKey: "usrCreatorCode" });
  Users.belongsToMany(VariableGlobale, { as: 'varGCodeVariableGlobales', through: HistoryVarG, foreignKey: "usrCode", otherKey: "varGCode" });
  UsrCreatorList.belongsToMany(Groupes, { as: 'grpCodeGroupes', through: AccesGroupeCreator, foreignKey: "usrCreatorCode", otherKey: "grpCode" });
  UsrCreatorList.belongsToMany(Users, { as: 'usrCodeUsersHistoryUserModifieds', through: HistoryUserModified, foreignKey: "usrCreatorCode", otherKey: "usrCode" });
  UsrCreatorList.belongsToMany(Users, { as: 'usrCodeUsersListUserCreateds', through: ListUserCreated, foreignKey: "usrCreatorCode", otherKey: "usrCode" });
  VariableGlobale.belongsToMany(Users, { as: 'usrCodeUsersHistoryVarGs', through: HistoryVarG, foreignKey: "varGCode", otherKey: "usrCode" });
  CallDestCode.belongsTo(Call, { as: "callCodeCall", foreignKey: "callCode"});
  Call.hasMany(CallDestCode, { as: "callDestCodes", foreignKey: "callCode"});
  GroupeUserFiles.belongsTo(GroupeUserMessage, { as: "gumesCodeGroupeUserMessage", foreignKey: "gumesCode"});
  GroupeUserMessage.hasMany(GroupeUserFiles, { as: "groupeUserFiles", foreignKey: "gumesCode"});
  GroupeUserMessage.belongsTo(GroupeUserMessage, { as: "gumesParentCodeGroupeUserMessage", foreignKey: "gumesParentCode"});
  GroupeUserMessage.hasMany(GroupeUserMessage, { as: "groupeUserMessages", foreignKey: "gumesParentCode"});
  GroupeUserFiles.belongsTo(GroupeUserName, { as: "gunCodeGroupeUserName", foreignKey: "gunCode"});
  GroupeUserName.hasMany(GroupeUserFiles, { as: "groupeUserFiles", foreignKey: "gunCode"});
  GroupeUserMember.belongsTo(GroupeUserName, { as: "gunCodeGroupeUserName", foreignKey: "gunCode"});
  GroupeUserName.hasMany(GroupeUserMember, { as: "groupeUserMembers", foreignKey: "gunCode"});
  GroupeUserMessage.belongsTo(GroupeUserName, { as: "gunCodeGroupeUserName", foreignKey: "gunCode"});
  GroupeUserName.hasMany(GroupeUserMessage, { as: "groupeUserMessages", foreignKey: "gunCode"});
  AccesGroupeCreator.belongsTo(Groupes, { as: "grpCodeGroupe", foreignKey: "grpCode"});
  Groupes.hasMany(AccesGroupeCreator, { as: "accesGroupeCreators", foreignKey: "grpCode"});
  GroupeAcces.belongsTo(Groupes, { as: "grpCodeGroupe", foreignKey: "grpCode"});
  Groupes.hasMany(GroupeAcces, { as: "groupeAcces", foreignKey: "grpCode"});
  HistoryGroupeAcces.belongsTo(Groupes, { as: "grpCodeGroupe", foreignKey: "grpCode"});
  Groupes.hasMany(HistoryGroupeAcces, { as: "historyGroupeAcces", foreignKey: "grpCode"});
  HistoryGroupeModif.belongsTo(Groupes, { as: "grpCodeGroupe", foreignKey: "grpCode"});
  Groupes.hasMany(HistoryGroupeModif, { as: "historyGroupeModifs", foreignKey: "grpCode"});
  HistoryUsrCreateGroupe.belongsTo(Groupes, { as: "grpCodeGroupe", foreignKey: "grpCode"});
  Groupes.hasMany(HistoryUsrCreateGroupe, { as: "historyUsrCreateGroupes", foreignKey: "grpCode"});
  Metiers.belongsTo(Groupes, { as: "grpCodeGroupe", foreignKey: "grpCode"});
  Groupes.hasMany(Metiers, { as: "metiers", foreignKey: "grpCode"});
  Users.belongsTo(Groupes, { as: "grpCodeGroupe", foreignKey: "grpCode"});
  Groupes.hasMany(Users, { as: "users", foreignKey: "grpCode"});
  GroupeAcces.belongsTo(HistoryGroupeAcces, { as: "histGrpACodeHistoryGroupeAcce", foreignKey: "histGrpACode"});
  HistoryGroupeAcces.hasMany(GroupeAcces, { as: "groupeAcces", foreignKey: "histGrpACode"});
  AdditionnalState.belongsTo(Messages, { as: "msgCodeMessage", foreignKey: "msgCode"});
  Messages.hasMany(AdditionnalState, { as: "additionnalStates", foreignKey: "msgCode"});
  DestMsgRoomGrp.belongsTo(Messages, { as: "msgCodeMessage", foreignKey: "msgCode"});
  Messages.hasMany(DestMsgRoomGrp, { as: "destMsgRoomGrps", foreignKey: "msgCode"});
  Destination.belongsTo(Messages, { as: "msgCodeMessage", foreignKey: "msgCode"});
  Messages.hasMany(Destination, { as: "destinations", foreignKey: "msgCode"});
  Messages.belongsTo(Messages, { as: "msgParentCodeMessage", foreignKey: "msgParentCode"});
  Messages.hasMany(Messages, { as: "messages", foreignKey: "msgParentCode"});
  MsgFileJoint.belongsTo(Messages, { as: "msgCodeMessage", foreignKey: "msgCode"});
  Messages.hasMany(MsgFileJoint, { as: "msgFileJoints", foreignKey: "msgCode"});
  Groupes.belongsTo(Metiers, { as: "mtrCodeMetier", foreignKey: "mtrCode"});
  Metiers.hasMany(Groupes, { as: "groupes", foreignKey: "mtrCode"});
  HistoryMetiersModif.belongsTo(Metiers, { as: "mtrCodeMetier", foreignKey: "mtrCode"});
  Metiers.hasMany(HistoryMetiersModif, { as: "historyMetiersModifs", foreignKey: "mtrCode"});
  Buttons.belongsTo(Modules, { as: "mdlCodeModule", foreignKey: "mdlCode"});
  Modules.hasMany(Buttons, { as: "buttons", foreignKey: "mdlCode"});
  Components.belongsTo(Modules, { as: "mdlCodeModule", foreignKey: "mdlCode"});
  Modules.hasMany(Components, { as: "components", foreignKey: "mdlCode"});
  Menu.belongsTo(Modules, { as: "mdlCodeModule", foreignKey: "mdlCode"});
  Modules.hasMany(Menu, { as: "menus", foreignKey: "mdlCode"});
  Pages.belongsTo(Modules, { as: "mdlCodeModule", foreignKey: "mdlCode"});
  Modules.hasMany(Pages, { as: "pages", foreignKey: "mdlCode"});
  CallRoomAutorizedUser.belongsTo(MsgRoomGroupe, { as: "msgRoomGrpCodeMsgRoomGroupe", foreignKey: "msgRoomGrpCode"});
  MsgRoomGroupe.hasMany(CallRoomAutorizedUser, { as: "callRoomAutorizedUsers", foreignKey: "msgRoomGrpCode"});
  DestMsgRoomGrp.belongsTo(MsgRoomGroupe, { as: "msgRoomGrpCodeMsgRoomGroupe", foreignKey: "msgRoomGrpCode"});
  MsgRoomGroupe.hasMany(DestMsgRoomGrp, { as: "destMsgRoomGrps", foreignKey: "msgRoomGrpCode"});
  Comment.belongsTo(Post, { as: "postCodePost", foreignKey: "postCode"});
  Post.hasMany(Comment, { as: "comments", foreignKey: "postCode"});
  CommentReactions.belongsTo(Post, { as: "postCodePost", foreignKey: "postCode"});
  Post.hasMany(CommentReactions, { as: "commentReactions", foreignKey: "postCode"});
  PinnedPost.belongsTo(Post, { as: "postCodePost", foreignKey: "postCode"});
  Post.hasMany(PinnedPost, { as: "pinnedPosts", foreignKey: "postCode"});
  PostFileJoint.belongsTo(Post, { as: "postCodePost", foreignKey: "postCode"});
  Post.hasMany(PostFileJoint, { as: "postFileJoints", foreignKey: "postCode"});
  PostHistoryModif.belongsTo(Post, { as: "postCodePost", foreignKey: "postCode"});
  Post.hasMany(PostHistoryModif, { as: "postHistoryModifs", foreignKey: "postCode"});
  PostReactions.belongsTo(Post, { as: "postCodePost", foreignKey: "postCode"});
  Post.hasMany(PostReactions, { as: "postReactions", foreignKey: "postCode"});
  AdditionnalState.belongsTo(State, { as: "stateCodeState", foreignKey: "stateCode"});
  State.hasMany(AdditionnalState, { as: "additionnalStates", foreignKey: "stateCode"});
  UserSettingsHistory.belongsTo(UserSettings, { as: "usrSCodeUserSetting", foreignKey: "usrSCode"});
  UserSettings.hasMany(UserSettingsHistory, { as: "userSettingsHistories", foreignKey: "usrSCode"});
  Call.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(Call, { as: "calls", foreignKey: "usrCode"});
  CallDestCode.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(CallDestCode, { as: "callDestCodes", foreignKey: "usrCode"});
  CallRoomAutorizedUser.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(CallRoomAutorizedUser, { as: "callRoomAutorizedUsers", foreignKey: "usrCode"});
  Comment.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(Comment, { as: "comments", foreignKey: "usrCode"});
  Comment.belongsTo(Users, { as: "cmtDeleteByUser", foreignKey: "cmtDeleteBy"});
  Users.hasMany(Comment, { as: "cmtDeleteByComments", foreignKey: "cmtDeleteBy"});
  CommentReactions.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(CommentReactions, { as: "commentReactions", foreignKey: "usrCode"});
  DestMsgRoomGrp.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(DestMsgRoomGrp, { as: "destMsgRoomGrps", foreignKey: "usrCode"});
  Destination.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(Destination, { as: "destinations", foreignKey: "usrCode"});
  GroupeUserFiles.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(GroupeUserFiles, { as: "groupeUserFiles", foreignKey: "usrCode"});
  GroupeUserMember.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(GroupeUserMember, { as: "groupeUserMembers", foreignKey: "usrCode"});
  GroupeUserMessage.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(GroupeUserMessage, { as: "groupeUserMessages", foreignKey: "usrCode"});
  GroupeUserMessage.belongsTo(Users, { as: "gumesForwardedFromUserUser", foreignKey: "gumesForwardedFromUser"});
  Users.hasMany(GroupeUserMessage, { as: "gumesForwardedFromUserGroupeUserMessages", foreignKey: "gumesForwardedFromUser"});
  GroupeUserName.belongsTo(Users, { as: "gunCreatedByUser", foreignKey: "gunCreatedBy"});
  Users.hasMany(GroupeUserName, { as: "groupeUserNames", foreignKey: "gunCreatedBy"});
  HistoryGroupeAcces.belongsTo(Users, { as: "histGrpAUserUser", foreignKey: "histGrpAUser"});
  Users.hasMany(HistoryGroupeAcces, { as: "historyGroupeAcces", foreignKey: "histGrpAUser"});
  HistoryGroupeModif.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(HistoryGroupeModif, { as: "historyGroupeModifs", foreignKey: "usrCode"});
  HistoryMetiersModif.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(HistoryMetiersModif, { as: "historyMetiersModifs", foreignKey: "usrCode"});
  HistoryUserModified.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(HistoryUserModified, { as: "historyUserModifieds", foreignKey: "usrCode"});
  HistoryUsersOnLine.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(HistoryUsersOnLine, { as: "historyUsersOnLines", foreignKey: "usrCode"});
  HistoryUsrCreateGroupe.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(HistoryUsrCreateGroupe, { as: "historyUsrCreateGroupes", foreignKey: "usrCode"});
  HistoryVarG.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(HistoryVarG, { as: "historyVarGs", foreignKey: "usrCode"});
  ListUserCreated.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(ListUserCreated, { as: "listUserCreateds", foreignKey: "usrCode"});
  MessageReactions.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(MessageReactions, { as: "messageReactions", foreignKey: "usrCode"});
  Messages.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(Messages, { as: "messages", foreignKey: "usrCode"});
  Messages.belongsTo(Users, { as: "msgForwardedFromUserUser", foreignKey: "msgForwardedFromUser"});
  Users.hasMany(Messages, { as: "msgForwardedFromUserMessages", foreignKey: "msgForwardedFromUser"});
  MsgFileJoint.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(MsgFileJoint, { as: "msgFileJoints", foreignKey: "usrCode"});
  MsgRoomGroupe.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(MsgRoomGroupe, { as: "msgRoomGroupes", foreignKey: "usrCode"});
  Notifications.belongsTo(Users, { as: "notifActorCodeUser", foreignKey: "notifActorCode"});
  Users.hasMany(Notifications, { as: "notifications", foreignKey: "notifActorCode"});
  Notifications.belongsTo(Users, { as: "userCodeUser", foreignKey: "userCode"});
  Users.hasMany(Notifications, { as: "userCodeNotifications", foreignKey: "userCode"});
  Post.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(Post, { as: "posts", foreignKey: "usrCode"});
  PostFileJoint.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(PostFileJoint, { as: "postFileJoints", foreignKey: "usrCode"});
  PostHistoryModif.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(PostHistoryModif, { as: "postHistoryModifs", foreignKey: "usrCode"});
  PostReactions.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(PostReactions, { as: "postReactions", foreignKey: "usrCode"});
  Reports.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(Reports, { as: "reports", foreignKey: "usrCode"});
  Session.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(Session, { as: "sessions", foreignKey: "usrCode"});
  UserFieldVisibility.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(UserFieldVisibility, { as: "userFieldVisibilities", foreignKey: "usrCode"});
  UserSettings.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(UserSettings, { as: "userSettings", foreignKey: "usrCode"});
  UserSettingsHistory.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(UserSettingsHistory, { as: "userSettingsHistories", foreignKey: "usrCode"});
  UsrCreatorList.belongsTo(Users, { as: "usrCodeUser", foreignKey: "usrCode"});
  Users.hasMany(UsrCreatorList, { as: "usrCreatorLists", foreignKey: "usrCode"});
  AccesGroupeCreator.belongsTo(UsrCreatorList, { as: "usrCreatorCodeUsrCreatorList", foreignKey: "usrCreatorCode"});
  UsrCreatorList.hasMany(AccesGroupeCreator, { as: "accesGroupeCreators", foreignKey: "usrCreatorCode"});
  HistoryUserModified.belongsTo(UsrCreatorList, { as: "usrCreatorCodeUsrCreatorList", foreignKey: "usrCreatorCode"});
  UsrCreatorList.hasMany(HistoryUserModified, { as: "historyUserModifieds", foreignKey: "usrCreatorCode"});
  ListUserCreated.belongsTo(UsrCreatorList, { as: "usrCreatorCodeUsrCreatorList", foreignKey: "usrCreatorCode"});
  UsrCreatorList.hasMany(ListUserCreated, { as: "listUserCreateds", foreignKey: "usrCreatorCode"});
  HistoryVarG.belongsTo(VariableGlobale, { as: "varGCodeVariableGlobale", foreignKey: "varGCode"});
  VariableGlobale.hasMany(HistoryVarG, { as: "historyVarGs", foreignKey: "varGCode"});

  return {
    AccesGroupeCreator,
    AdditionnalState,
    Buttons,
    Call,
    CallDestCode,
    CallRoomAutorizedUser,
    Comment,
    CommentReactions,
    Components,
    DestMsgRoomGrp,
    Destination,
    GroupeAcces,
    GroupeAccesView,
    GroupeUserFiles,
    GroupeUserMember,
    GroupeUserMessage,
    GroupeUserName,
    Groupes,
    HistoryGroupeAcces,
    HistoryGroupeModif,
    HistoryMetiersModif,
    HistoryUserModified,
    HistoryUsersOnLine,
    HistoryUsrCreateGroupe,
    HistoryVarG,
    ListUserCreated,
    Menu,
    MessageReactions,
    MessageViews,
    Messages,
    Metiers,
    Modules,
    MotDePasseOublie,
    MsgFileJoint,
    MsgRoomGroupe,
    NotificationTypes,
    Notifications,
    Pages,
    PinnedPost,
    Post,
    PostFileJoint,
    PostHistoryModif,
    PostReactions,
    Reports,
    Session,
    State,
    UserFieldVisibility,
    UserSettings,
    UserSettingsHistory,
    Users,
    UsrCreatorList,
    VariableGlobale,
  };
}
