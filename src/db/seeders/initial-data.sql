/*==============================================================*/
/* INITIAL DATA TO GRI > GESTION RESEAU INFORMATIQUE            */
/* TO RUN : psql -U pe -d armp -f initial-data.sql             */
/*==============================================================*/

-- Ordre de module
-- Accuiel mdl-1
-- Message mdl-2
-- Vision mdl-3
-- Profile mdl-4
-- Parametre mdl-6


/*==============================================================*/
/* Table : GROUPES                                              */
/*==============================================================*/
INSERT INTO pe.groupes (grp_code, grp_name, grp_description) VALUES('grp-1', 'Normal', 'groupe normal');
INSERT INTO pe.groupes (grp_code, grp_name, grp_description) VALUES('grp-2', 'Admin', 'groupe admin');
INSERT INTO pe.groupes (grp_code, grp_name, grp_description) VALUES('grp-3', 'DSI', 'groupe DSI');



/*==============================================================*/
/* Table : USERS                                                */
/*==============================================================*/
/*==============================================================*/
/* Table : USERS                                                */
/*==============================================================*/
INSERT INTO pe.users (usr_code, grp_code, usr_name, usr_firstname, usr_contact, usr_login, usr_mail, usr_password, usr_img, usr_is_deleted, usr_is_valided, usr_created_date) VALUES('user-1', 'grp-1', 'Jean Jacques Séraphin', 'Herinandriana', '+261343121213', 'sera0', 'herinandrianajjs@gmail.com', '$2b$10$k.nV1QI8mieWsjyLdREuUug/Wr.KYkkiYSt7GY1q7v9y5YTV07ljG', '/Images/Profile/user-1_04-03-2024.jpg', false, true, '2024-03-04 22:52:45.000');
INSERT INTO pe.users (usr_code, grp_code, usr_name, usr_firstname, usr_contact, usr_login, usr_mail, usr_password, usr_img, usr_is_deleted, usr_is_valided, usr_created_date) VALUES('user-2', 'grp-1', 'PE', 'Super admin', '+261343121213', 'pe', 'pea@gmail.com', '$2b$10$k.nV1QI8mieWsjyLdREuUug/Wr.KYkkiYSt7GY1q7v9y5YTV07ljG', '/Images/Profile/user-2_04-03-2024.jpg', false, true, '2024-03-04 22:52:45.000');
INSERT INTO pe.users (usr_code, grp_code, usr_name, usr_firstname, usr_contact, usr_mail, usr_login, usr_img, usr_password, usr_gender, usr_is_deleted, usr_is_valided, usr_created_date) VALUES('user-6', 'grp-3', 'Dino', 'Dino', NULL, 'dino@gmail.com', 'dino', NULL, '$2b$10$fFKf5zlcfrSevM0jcCvwrOg28jQMq6mYTpyDRUjPizSxYA0Qi7gPu', 'Homme', false, true, '2024-06-04 07:04:06.000');
INSERT INTO pe.users (usr_code, grp_code, usr_name, usr_firstname, usr_contact, usr_mail, usr_login, usr_img, usr_password, usr_gender, usr_is_deleted, usr_is_valided, usr_created_date) VALUES('user-7', 'grp-3', 'Hasina', 'Hasina', NULL, 'hasina@gmail.com', 'hasina', NULL, '$2b$10$pdkek8FDKKbdSyK2E4PBs.xYvR21sWWg5ld9eaiMYtRiupdMmhZnq', 'Homme', false, true, '2024-06-04 07:06:13.000');
INSERT INTO pe.users (usr_code, grp_code, usr_name, usr_firstname, usr_contact, usr_mail, usr_login, usr_img, usr_password, usr_gender, usr_is_deleted, usr_is_valided, usr_created_date) VALUES('user-8', 'grp-3', 'Dera', 'Dera', NULL, 'dera@gmail.com', 'dera', NULL, '$2b$10$xAe18OwgvEDxLDgmRGHlEukO1ePb21TWwAxZujzWrSSL4d/8Jrt0W', 'Homme', false, true, '2024-06-04 07:06:08.000');
INSERT INTO pe.users (usr_code, grp_code, usr_name, usr_firstname, usr_contact, usr_mail, usr_login, usr_img, usr_password, usr_gender, usr_is_deleted, usr_is_valided, usr_created_date) VALUES('user-9', 'grp-3', 'Bauchie', 'Bauchie', NULL, 'bauchie@gmail.com', 'bauchie', NULL, '$2b$10$oL1vxonzCIebmn0jCvFAVuFC7Sbpilec1KlPai/rzzDY45Amb6WIC', 'Homme', false, true, '2024-06-04 07:07:38.000');
INSERT INTO pe.users (usr_code, grp_code, usr_name, usr_firstname, usr_contact, usr_mail, usr_login, usr_img, usr_password, usr_gender, usr_is_deleted, usr_is_valided, usr_created_date) VALUES('user-10', 'grp-3', 'dsi', 'dsi', NULL, 'dsi@gmail.com', 'dsi', NULL, '$2b$10$h1bkcJf.md4V2XBXSodKOONNfo3FwAb5/QNGercj0filOXDK7XXP2', 'Homme', false, true, '2024-06-04 07:09:44.000');


/*==============================================================*/
/* Table : MODULES                                                */
/*==============================================================*/
-- Accuiel mdl-1
INSERT INTO pe.modules (mdl_code, mdl_name, mdl_descption) VALUES('mdl-1', 'Module accueil', 'Permet de faire des post et voir des posts des utilisateurs');

-- Message mdl-2
INSERT INTO pe.modules (mdl_code, mdl_name, mdl_descption) VALUES('mdl-2', 'Module messagerie', 'Messagerie description');

-- Vision mdl-3
INSERT INTO pe.modules (mdl_code, mdl_name, mdl_descption) VALUES('mdl-3', 'Module vision conférence', 'Permet de modifier l''acces à la vision conference ');

-- Profile mdl-4
INSERT INTO pe.modules (mdl_code, mdl_name, mdl_descption) VALUES('mdl-4', 'Module profile', 'Description de l''utilisateur');

-- Profile mdl-5
INSERT INTO pe.modules (mdl_code, mdl_name, mdl_descption) VALUES('mdl-5', 'Module aide', 'Description de l''utilisateur');

-- Parametre mdl-6
INSERT INTO pe.modules (mdl_code, mdl_name, mdl_descption) VALUES('mdl-6', 'Module parametre', 'Parametre description');

/*==============================================================*/
/* Table : PAGES                                                */
/*==============================================================*/

-- Accuiel mdl-1
INSERT INTO pe.pages (page_code, mdl_code, page_name, page_description) VALUES('page-010', 'mdl-1', 'Page accueil', 'Voire le poste');

-- Message mdl-2
INSERT INTO pe.pages (page_code, mdl_code, page_name, page_description) values('page-020','mdl-2', 'Page messagerie', 'Messagerie description');

-- Vision mdl-3
INSERT INTO pe.pages (page_code, mdl_code, page_name, page_description) values('page-030','mdl-3', 'Page vision conférence', 'Vision conference déscription');

-- Profile mdl-4
INSERT INTO pe.pages (page_code, mdl_code, page_name, page_description) values('page-040','mdl-4', 'Page profile', 'Description d''un utilisateur');

-- Profile mdl-5
INSERT INTO pe.pages (page_code, mdl_code, page_name, page_description) values('page-050','mdl-5', 'Page aide', 'Page aide');


-- Parametre mdl-6 
INSERT INTO pe.pages (page_code, mdl_code, page_name, page_description) values('page-060','mdl-6', 'Gestion utilisateur', '');
INSERT INTO pe.pages (page_code, mdl_code, page_name, page_description) values('page-061','mdl-6', 'Paramêtre globale', '');
INSERT INTO pe.pages (page_code, mdl_code, page_name, page_description) values('page-062','mdl-6', 'Gestion groupe et ACL', '');
INSERT INTO pe.pages (page_code, mdl_code, page_name, page_description) values('page-063','mdl-6', 'Historiques des activité', '');


/*==============================================================*/
/* Table : COMPONENTS                                           */
/*==============================================================*/

-- Accuiel mdl-1
-- Message mdl-2
-- Vision mdl-3
-- Profile mdl-4
-- Parametre mdl-6
INSERT INTO pe.components (cmpn_code, mdl_code, cmpn_name, cmpn_description) VALUES('cmpn-060', 'mdl-6', 'Liste groupe', 'Liste des groupes');
INSERT INTO pe.components (cmpn_code, mdl_code, cmpn_name, cmpn_description) VALUES('cmpn-061', 'mdl-6', 'Création groupe', 'Créer des groupes');
INSERT INTO pe.components (cmpn_code, mdl_code, cmpn_name, cmpn_description) VALUES('cmpn-063', 'mdl-6', 'Modification ACL', 'modification ACL');

/*==============================================================*/
/* Table : Buttons                                              */
/*==============================================================*/
-- Accuiel mdl-1
INSERT INTO pe.buttons (btn_code, mdl_code, btn_name, btn_description, btn_modif) VALUES('btn-000', 'mdl-1', 'Poster', 'Permet de poster des arcticles, des images, et des fichiers', NULL);
INSERT INTO pe.buttons (btn_code, mdl_code, btn_name, btn_description, btn_modif) VALUES('btn-001', 'mdl-1', 'Poster non validé', 'Permet de validé des poster', NULL);
INSERT INTO pe.buttons (btn_code, mdl_code, btn_name, btn_description, btn_modif) VALUES('btn-002', 'mdl-1', 'Poster supprimé', 'Permet de voir et de retorer des poster', NULL);
-- Message mdl-2
INSERT INTO pe.buttons (btn_code, mdl_code, btn_name, btn_description, btn_modif) VALUES('btn-020', 'mdl-2', 'Ajouter un fichier', 'Permet d''ajouter un fichier', NULL);
INSERT INTO pe.buttons (btn_code, mdl_code, btn_name, btn_description, btn_modif) VALUES('btn-021', 'mdl-2', 'Ajouter un image', 'Permet d''ajouter un image', NULL);
INSERT INTO pe.buttons (btn_code, mdl_code, btn_name, btn_description, btn_modif) VALUES('btn-022', 'mdl-2', 'Multiple message', 'Permet d''envoyer plusieur message à une personne ', NULL);

-- Vision mdl-3
-- Profile mdl-4
-- Parametre mdl-6
INSERT INTO pe.buttons (btn_code, mdl_code, btn_name, btn_description, btn_modif) VALUES('btn-060', 'mdl-6', 'Switch valider un utilisateur', 'Permet de valider un utilisateur', NULL);
INSERT INTO pe.buttons (btn_code, mdl_code, btn_name, btn_description, btn_modif) VALUES('btn-061', 'mdl-6', 'Switch supprimer un utilisateur', 'Permet de suppremer un utilisateur', NULL);
INSERT INTO pe.buttons (btn_code, mdl_code, btn_name, btn_description, btn_modif) VALUES('btn-062', 'mdl-6', 'Mise à jour ACL', 'Permet de mettre à jour l''ACL', NULL);
INSERT INTO pe.buttons (btn_code, mdl_code, btn_name, btn_description, btn_modif) VALUES('btn-063', 'mdl-6', 'Switch changer groupe d'' un utilisateur', 'Permet de changer groupe d'' un utilisateur', NULL);

/* 

INSERT INTO pe.post (post_code, usr_code, post_title, post_description, post_nbr_seen, post_modif, post_is_valided, post_is_deleted, post_created_date, post_modif_date)
VALUES('post-1', 'user-2', 'Bienvenue sur GRI - Votre nouvel outil de gestion réseau !', '<p>Cher(e) utilisateur(trice),</p>
<p>Nous<span style="color: #000000;"> sommes </span>ravis de vous accueillir sur notre nouvelle application <strong>GRI </strong>(<strong>G</strong>estion<strong> R</strong>&eacute;seau <strong>I</strong>nformatique). Cette plateforme innovante a &eacute;t&eacute; con&ccedil;ue pour simplifier la gestion de votre r&eacute;seau informatique et faciliter la collaboration au sein de votre organisation.</p>
<p style="text-align: justify;">Gr&acirc;ce &agrave; GRI, vous pourrez d&eacute;sormais g&eacute;rer efficacement la distribution des adresses IP pour vos ordinateurs, smartphones et imprimantes. Plus besoin de vous soucier des conflits d''adresses ou de la redondance des informations. Notre syst&egrave;me centralis&eacute; vous permettra d''attribuer et de suivre les adresses IP de mani&egrave;re simple et intuitive.</p>
<p>Actuellement en version b&ecirc;ta, cette fonctionnalit&eacute; sera progressivement am&eacute;lior&eacute;e et enrichie pour r&eacute;pondre au mieux &agrave; vos besoins. N''h&eacute;sitez pas &agrave; nous faire part de vos commentaires et suggestions afin que nous puissions l''optimiser.</p>
<p>Mais GRI ne se limite pas &agrave; la gestion des adresses IP. Vous pourrez &eacute;galement profiter d''un espace collaboratif complet o&ugrave; vous pourrez :</p>
<ul style="list-style-type: square;">
<li>Publier des articles et partager des informations avec votre &eacute;quipe</li>
<li>Joindre des images et des documents pour illustrer vos publications</li>
<li>Envoyer des messages instantan&eacute;s pour communiquer en temps r&eacute;el</li>
<li>Organiser des appels vid&eacute;o pour des r&eacute;unions &agrave; distance</li>
</ul>
<p>Toutes ces fonctionnalit&eacute;s ont &eacute;t&eacute; soigneusement test&eacute;es et sont parfaitement op&eacute;rationnelles d&egrave;s aujourd''hui.</p>
<p style="text-align: justify;">Nous tenons &agrave; remercier la Direction des Syst&egrave;mes d''Information (DSI) et son &eacute;quipe pour leur soutien et leur implication dans le d&eacute;veloppement de cette application. Leur expertise et leurs pr&eacute;cieux conseils nous ont permis de cr&eacute;er un outil r&eacute;pondant aux exigences les plus strictes en mati&egrave;re de s&eacute;curit&eacute; et de performance.</p>
<p style="text-align: justify;">Nous esp&eacute;rons que GRI deviendra rapidement un outil indispensable pour votre travail quotidien et qu''il facilitera la collaboration au sein de votre entreprise.</p>
<p style="text-align: justify;">N''h&eacute;sitez pas &agrave; explorer toutes les fonctionnalit&eacute;s de l''application et &agrave; nous faire part de vos retours. Notre &eacute;quipe est &agrave; votre &eacute;coute pour vous accompagner dans l''utilisation de pe.</p>
<p>Cordialement,<br>L''&eacute;quipe DSI ARMP&nbsp;</p>', NULL, NULL, true, false, '2024-06-27 10:42:57.000', NULL);
 */

/*==============================================================*/
/* Table History                                                */
/*==============================================================*/
INSERT INTO pe.history_module_access (hist_mdl_code, hist_mdl_created_date) VALUES('mdl-1-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_module_access (hist_mdl_code, hist_mdl_created_date) VALUES('mdl-2-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_module_access (hist_mdl_code, hist_mdl_created_date) VALUES('mdl-3-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_module_access (hist_mdl_code, hist_mdl_created_date) VALUES('mdl-4-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_module_access (hist_mdl_code, hist_mdl_created_date) VALUES('mdl-5-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_module_access (hist_mdl_code, hist_mdl_created_date) VALUES('mdl-6-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_module_access (hist_mdl_code, hist_mdl_created_date) VALUES('mdl-1-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_module_access (hist_mdl_code, hist_mdl_created_date) VALUES('mdl-2-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_module_access (hist_mdl_code, hist_mdl_created_date) VALUES('mdl-3-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_module_access (hist_mdl_code, hist_mdl_created_date) VALUES('mdl-4-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_module_access (hist_mdl_code, hist_mdl_created_date) VALUES('mdl-5-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_module_access (hist_mdl_code, hist_mdl_created_date) VALUES('mdl-6-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_module_access (hist_mdl_code, hist_mdl_created_date) VALUES('mdl-1-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_module_access (hist_mdl_code, hist_mdl_created_date) VALUES('mdl-2-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_module_access (hist_mdl_code, hist_mdl_created_date) VALUES('mdl-3-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_module_access (hist_mdl_code, hist_mdl_created_date) VALUES('mdl-4-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_module_access (hist_mdl_code, hist_mdl_created_date) VALUES('mdl-5-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_module_access (hist_mdl_code, hist_mdl_created_date) VALUES('mdl-6-grp-3', '2024-06-24 10:01:24.000');


INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-010-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-020-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-030-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-040-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-050-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-060-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-061-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-062-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-063-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-010-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-020-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-030-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-040-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-050-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-060-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-061-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-062-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-063-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-010-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-020-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-030-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-040-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-050-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-060-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-061-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-062-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_page_access (hist_page_code, hist_page_created_date) VALUES('page-063-grp-3', '2024-06-24 10:01:24.000');


INSERT INTO pe.history_component_access (hist_cmpn_code, hist_cmpn_created_date) VALUES('cmpn-060-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_component_access (hist_cmpn_code, hist_cmpn_created_date) VALUES('cmpn-061-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_component_access (hist_cmpn_code, hist_cmpn_created_date) VALUES('cmpn-063-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_component_access (hist_cmpn_code, hist_cmpn_created_date) VALUES('cmpn-060-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_component_access (hist_cmpn_code, hist_cmpn_created_date) VALUES('cmpn-061-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_component_access (hist_cmpn_code, hist_cmpn_created_date) VALUES('cmpn-063-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_component_access (hist_cmpn_code, hist_cmpn_created_date) VALUES('cmpn-060-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_component_access (hist_cmpn_code, hist_cmpn_created_date) VALUES('cmpn-061-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_component_access (hist_cmpn_code, hist_cmpn_created_date) VALUES('cmpn-063-grp-3', '2024-06-24 10:01:24.000');



INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-000-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-001-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-002-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-020-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-021-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-022-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-060-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-061-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-062-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-063-grp-1', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-000-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-001-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-002-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-020-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-021-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-022-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-060-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-061-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-062-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-063-grp-2', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-000-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-001-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-002-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-020-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-021-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-022-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-060-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-061-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-062-grp-3', '2024-06-24 10:01:24.000');
INSERT INTO pe.history_button_access (hist_btn_code, hist_btn_created_date) VALUES('btn-063-grp-3', '2024-06-24 10:01:24.000');

/*==============================================================*/
/* Table : Access Modules                                                */
/*==============================================================*/
INSERT INTO pe.acces_groupe_module (grp_code, mdl_code, hist_mdl_code, mdl_is_active) VALUES('grp-1', 'mdl-1', 'mdl-1-grp-1', true);
INSERT INTO pe.acces_groupe_module (grp_code, mdl_code, hist_mdl_code, mdl_is_active) VALUES('grp-1', 'mdl-2', 'mdl-2-grp-1', true);
INSERT INTO pe.acces_groupe_module (grp_code, mdl_code, hist_mdl_code, mdl_is_active) VALUES('grp-1', 'mdl-6', 'mdl-6-grp-1', true);
INSERT INTO pe.acces_groupe_module (grp_code, mdl_code, hist_mdl_code, mdl_is_active) VALUES('grp-1', 'mdl-3', 'mdl-3-grp-1', true);
INSERT INTO pe.acces_groupe_module (grp_code, mdl_code, hist_mdl_code, mdl_is_active) VALUES('grp-1', 'mdl-4', 'mdl-4-grp-1', true);
INSERT INTO pe.acces_groupe_module (grp_code, mdl_code, hist_mdl_code, mdl_is_active) VALUES('grp-1', 'mdl-5', 'mdl-5-grp-1', true);
INSERT INTO pe.acces_groupe_module (grp_code, mdl_code, hist_mdl_code, mdl_is_active) VALUES('grp-2', 'mdl-1', 'mdl-1-grp-2', true);
INSERT INTO pe.acces_groupe_module (grp_code, mdl_code, hist_mdl_code, mdl_is_active) VALUES('grp-2', 'mdl-4', 'mdl-4-grp-2', true);
INSERT INTO pe.acces_groupe_module (grp_code, mdl_code, hist_mdl_code, mdl_is_active) VALUES('grp-2', 'mdl-5', 'mdl-5-grp-2', true);
INSERT INTO pe.acces_groupe_module (grp_code, mdl_code, hist_mdl_code, mdl_is_active) VALUES('grp-2', 'mdl-2', 'mdl-2-grp-2', true);
INSERT INTO pe.acces_groupe_module (grp_code, mdl_code, hist_mdl_code, mdl_is_active) VALUES('grp-2', 'mdl-3', 'mdl-3-grp-2', true);
INSERT INTO pe.acces_groupe_module (grp_code, mdl_code, hist_mdl_code, mdl_is_active) VALUES('grp-2', 'mdl-6', 'mdl-6-grp-2', true);
INSERT INTO pe.acces_groupe_module (grp_code, mdl_code, hist_mdl_code, mdl_is_active) VALUES('grp-3', 'mdl-1', 'mdl-1-grp-3', true);
INSERT INTO pe.acces_groupe_module (grp_code, mdl_code, hist_mdl_code, mdl_is_active) VALUES('grp-3', 'mdl-4', 'mdl-4-grp-3', true);
INSERT INTO pe.acces_groupe_module (grp_code, mdl_code, hist_mdl_code, mdl_is_active) VALUES('grp-3', 'mdl-2', 'mdl-2-grp-3', true);
INSERT INTO pe.acces_groupe_module (grp_code, mdl_code, hist_mdl_code, mdl_is_active) VALUES('grp-3', 'mdl-3', 'mdl-3-grp-3', true);
INSERT INTO pe.acces_groupe_module (grp_code, mdl_code, hist_mdl_code, mdl_is_active) VALUES('grp-3', 'mdl-5', 'mdl-5-grp-3', true);
INSERT INTO pe.acces_groupe_module (grp_code, mdl_code, hist_mdl_code, mdl_is_active) VALUES('grp-3', 'mdl-6', 'mdl-6-grp-3', true);


INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-3', 'page-010', 'page-010-grp-3', false);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-3', 'page-050', 'page-050-grp-3', false);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-3', 'page-040', 'page-040-grp-3', false);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-3', 'page-020', 'page-020-grp-3', false);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-3', 'page-030', 'page-030-grp-3', false);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-3', 'page-060', 'page-060-grp-3', false);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-3', 'page-061', 'page-061-grp-3', false);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-3', 'page-062', 'page-062-grp-3', false);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-3', 'page-063', 'page-063-grp-3', false);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-2', 'page-020', 'page-020-grp-2', true);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-1', 'page-010', 'page-010-grp-1', true);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-1', 'page-020', 'page-020-grp-1', true);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-1', 'page-030', 'page-030-grp-1', true);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-1', 'page-040', 'page-040-grp-1', true);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-1', 'page-050', 'page-050-grp-1', true);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-1', 'page-062', 'page-062-grp-1', true);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-1', 'page-060', 'page-060-grp-1', true);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-1', 'page-063', 'page-063-grp-1', true);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-1', 'page-061', 'page-061-grp-1', true);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-2', 'page-030', 'page-030-grp-2', true);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-2', 'page-040', 'page-040-grp-2', true);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-2', 'page-050', 'page-050-grp-2', true);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-2', 'page-062', 'page-062-grp-2', true);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-2', 'page-060', 'page-060-grp-2', true);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-2', 'page-063', 'page-063-grp-2', true);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-2', 'page-061', 'page-061-grp-2', true);
INSERT INTO pe.acces_groupe_page (grp_code, page_code, hist_page_code, page_is_active) VALUES('grp-2', 'page-010', 'page-010-grp-2', true);



INSERT INTO pe.acces_groupe_component (grp_code, cmpn_code, hist_cmpn_code, cmpn_is_active) VALUES('grp-3', 'cmpn-060', 'cmpn-060-grp-3', false);
INSERT INTO pe.acces_groupe_component (grp_code, cmpn_code, hist_cmpn_code, cmpn_is_active) VALUES('grp-3', 'cmpn-063', 'cmpn-063-grp-3', false);
INSERT INTO pe.acces_groupe_component (grp_code, cmpn_code, hist_cmpn_code, cmpn_is_active) VALUES('grp-3', 'cmpn-061', 'cmpn-061-grp-3', false);
INSERT INTO pe.acces_groupe_component (grp_code, cmpn_code, hist_cmpn_code, cmpn_is_active) VALUES('grp-1', 'cmpn-061', 'cmpn-061-grp-1', true);
INSERT INTO pe.acces_groupe_component (grp_code, cmpn_code, hist_cmpn_code, cmpn_is_active) VALUES('grp-1', 'cmpn-060', 'cmpn-060-grp-1', true);
INSERT INTO pe.acces_groupe_component (grp_code, cmpn_code, hist_cmpn_code, cmpn_is_active) VALUES('grp-1', 'cmpn-063', 'cmpn-063-grp-1', true);
INSERT INTO pe.acces_groupe_component (grp_code, cmpn_code, hist_cmpn_code, cmpn_is_active) VALUES('grp-2', 'cmpn-061', 'cmpn-061-grp-2', true);
INSERT INTO pe.acces_groupe_component (grp_code, cmpn_code, hist_cmpn_code, cmpn_is_active) VALUES('grp-2', 'cmpn-060', 'cmpn-060-grp-2', true);
INSERT INTO pe.acces_groupe_component (grp_code, cmpn_code, hist_cmpn_code, cmpn_is_active) VALUES('grp-2', 'cmpn-063', 'cmpn-063-grp-2', true);




INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-3', 'btn-000', 'btn-000-grp-3', false);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-3', 'btn-021', 'btn-021-grp-3', false);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-3', 'btn-020', 'btn-020-grp-3', false);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-3', 'btn-001', 'btn-001-grp-3', false);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-3', 'btn-002', 'btn-002-grp-3', false);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-3', 'btn-022', 'btn-022-grp-3', false);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-3', 'btn-063', 'btn-063-grp-3', false);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-3', 'btn-060', 'btn-060-grp-3', false);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-3', 'btn-062', 'btn-062-grp-3', false);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-3', 'btn-061', 'btn-061-grp-3', false);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-2', 'btn-000', 'btn-000-grp-2', true);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-2', 'btn-001', 'btn-001-grp-2', true);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-2', 'btn-002', 'btn-002-grp-2', true);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-2', 'btn-021', 'btn-021-grp-2', true);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-2', 'btn-020', 'btn-020-grp-2', true);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-2', 'btn-022', 'btn-022-grp-2', true);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-1', 'btn-000', 'btn-000-grp-1', true);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-1', 'btn-001', 'btn-001-grp-1', true);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-1', 'btn-002', 'btn-002-grp-1', true);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-1', 'btn-020', 'btn-020-grp-1', true);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-1', 'btn-021', 'btn-021-grp-1', true);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-1', 'btn-022', 'btn-022-grp-1', true);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-1', 'btn-063', 'btn-063-grp-1', true);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-1', 'btn-062', 'btn-062-grp-1', true);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-1', 'btn-061', 'btn-061-grp-1', true);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-1', 'btn-060', 'btn-060-grp-1', true);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-2', 'btn-062', 'btn-062-grp-2', true);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-2', 'btn-063', 'btn-063-grp-2', true);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-2', 'btn-061', 'btn-061-grp-2', true);
INSERT INTO pe.acces_groupe_button (grp_code, btn_code, hist_btn_code, btn_is_active) VALUES('grp-2', 'btn-060', 'btn-060-grp-2', true);




INSERT INTO pe.post (post_code, usr_code, post_title, post_description, post_nbr_seen, post_is_valided, post_is_deleted, post_modif_date, post_modif, post_created_date) VALUES('post-1', 'user-2', 'Bienvenue sur la Plateforme d''échange de l''ARMP!', '<p>Nous sommes ravis de vous pr&eacute;senter cette plateforme qui a pour vocation de faciliter les &eacute;changes entre les membres de la Commission Nationale des March&eacute;s (CNM), de la Banque africaine de d&eacute;veloppement (BAD) et des Personnes responsables des March&eacute;s Publics (PRMP).</p>
<p>Nous avons con&ccedil;u cette plateforme pour vous offrir une exp&eacute;rience utilisateur agr&eacute;able et fonctionnelle. Vous pouvez y poster des articles, commenter ces articles, ajouter des fichiers, des images et des vid&eacute;os. Vous pouvez &eacute;galement envoyer et recevoir des messages priv&eacute;s entre membres, ainsi que passer des appels vid&eacute;o priv&eacute;s.</p>
<p>Nous tenons &agrave; vous informer que certaines fonctionnalit&eacute;s de la plateforme sont encore en cours de d&eacute;veloppement et que nous travaillons activement pour les am&eacute;liorer. La version actuelle est donc une version b&ecirc;ta, et nous sommes conscients que certaines fonctionnalit&eacute;s ne sont pas encore 100% op&eacute;rationnelles. Parmi les fonctionnalit&eacute;s en cours de d&eacute;veloppement, citons la responsivit&eacute; mobile, les messages de groupe et les appels en groupe.</p>
<p>Nous sommes convaincus que cette plateforme sera un outil pr&eacute;cieux pour vous permettre de collaborer plus facilement et plus efficacement. Nous sommes &eacute;galement ouverts &agrave; toutes les critiques et &agrave; tous les conseils qui nous permettront d''am&eacute;liorer cette plateforme de jour en jour.</p>
<p>Nous vous remercions de votre confiance et nous esp&eacute;rons que vous appr&eacute;cierez cette plateforme autant que nous avons appr&eacute;ci&eacute; la concevoir pour vous.</p>
<p>N''h&eacute;sitez pas &agrave; nous contacter si vous avez des questions ou des suggestions.</p>
<p>Bonne navigation sur notre plateforme d''&eacute;change !</p>', NULL, true, false, '2024-06-24 11:07:39.000', '[{"adminCode":"user-2","adminAction":"Désactivation.","postModifDate":"2024-06-24 14:07:39"}]', '2024-06-24 11:07:08.000');

