/*==============================================================*/
/* Nom de SGBD :  PostgreSQL 8                                  */
/* DATE de cr�ation :  25/03/2024 09:45:26                     */
/*==============================================================*/

-- DROP SCHEMA gri;

CREATE SCHEMA gri AUTHORIZATION postgres;

-- DROP TYPE gri."acces_type_value";

CREATE TYPE gri."acces_type_value" AS ENUM (
	'MODULE',
	'MENU',
	'PAGE',
	'COMPONENT',
	'BUTTON');

-- DROP TYPE gri."enum_comment_reactions_c_react_reaction";

CREATE TYPE gri."enum_comment_reactions_c_react_reaction" AS ENUM (
	'like',
	'love',
	'laugh',
	'wow',
	'sad',
	'angry');

-- DROP TYPE gri."enum_comment_reactions_creact_reaction";

CREATE TYPE gri."enum_comment_reactions_creact_reaction" AS ENUM (
	'like',
	'love',
	'laugh',
	'wow',
	'sad',
	'angry');

-- DROP TYPE gri."enum_groupe_acces_acces_type";

CREATE TYPE gri."enum_groupe_acces_acces_type" AS ENUM (
	'MODULE',
	'MENU',
	'PAGE',
	'COMPONENT',
	'BUTTON');

-- DROP TYPE gri."enum_groupe_acces_view_entity_type";

CREATE TYPE gri."enum_groupe_acces_view_entity_type" AS ENUM (
	'MODULE',
	'MENU',
	'PAGE',
	'COMPONENT',
	'BUTTON');

-- DROP TYPE gri."enum_history_groupe_acces_acces_type";

CREATE TYPE gri."enum_history_groupe_acces_acces_type" AS ENUM (
	'MODULE',
	'MENU',
	'PAGE',
	'COMPONENT',
	'BUTTON');

-- DROP TYPE gri."enum_message_reactions_m_react_reaction";

CREATE TYPE gri."enum_message_reactions_m_react_reaction" AS ENUM (
	'like',
	'love',
	'laugh',
	'wow',
	'sad',
	'angry');

-- DROP TYPE gri."enum_notification_types_notif_type";

CREATE TYPE gri."enum_notification_types_notif_type" AS ENUM (
	'COMMENT_POSTED',
	'COMMENT_REPLIED',
	'MESSAGE_RECEIVED',
	'CALL_INVITATION',
	'GROUP_INVITATION',
	'USER_VALIDATION_REQUEST',
	'USER_VALIDATED',
	'USER_REJECTED',
	'ACCESS_GRANTED',
	'FILE_ARCHIVED',
	'MENTION',
	'CALL_STARTED',
	'NEW_',
	'MISSED_CALL',
	'ROLE_CHANGED',
	'REPORT_CREATED');

-- DROP TYPE gri."enum_notifications_notif_channel";

CREATE TYPE gri."enum_notifications_notif_channel" AS ENUM (
	'in_app',
	'email',
	'push',
	'sms');

-- DROP TYPE gri."enum_notifications_notif_type";

CREATE TYPE gri."enum_notifications_notif_type" AS ENUM (
	'COMMENT_POSTED',
	'COMMENT_REPLIED',
	'MESSAGE_RECEIVED',
	'CALL_INVITATION',
	'GROUP_INVITATION',
	'USER_VALIDATION_REQUEST',
	'USER_VALIDATED',
	'USER_REJECTED',
	'ACCESS_GRANTED',
	'FILE_ARCHIVED',
	'MENTION',
	'CALL_STARTED',
	'NEW_',
	'MISSED_CALL',
	'ROLE_CHANGED',
	'REPORT_CREATED');

-- DROP TYPE gri."enum_post_reactions_p_react_reaction";

CREATE TYPE gri."enum_post_reactions_p_react_reaction" AS ENUM (
	'like',
	'love',
	'laugh',
	'wow',
	'sad',
	'angry');

-- DROP TYPE gri."enum_post_reactions_preact_reaction";

CREATE TYPE gri."enum_post_reactions_preact_reaction" AS ENUM (
	'like',
	'love',
	'laugh',
	'wow',
	'sad',
	'angry');

-- DROP TYPE gri."notification_channel_enum";

CREATE TYPE gri."notification_channel_enum" AS ENUM (
	'in_app',
	'email',
	'push',
	'sms');

-- DROP TYPE gri."notification_type_enum";

CREATE TYPE gri."notification_type_enum" AS ENUM (
	'COMMENT_POSTED',
	'COMMENT_REPLIED',
	'MESSAGE_RECEIVED',
	'CALL_INVITATION',
	'GROUP_INVITATION',
	'USER_VALIDATION_REQUEST',
	'USER_VALIDATED',
	'USER_REJECTED',
	'ACCESS_GRANTED',
	'FILE_ARCHIVED',
	'MENTION',
	'CALL_STARTED',
	'NEW_',
	'MISSED_CALL',
	'ROLE_CHANGED',
	'REPORT_CREATED');

-- DROP TYPE gri."reaction_type";

CREATE TYPE gri."reaction_type" AS ENUM (
	'like',
	'love',
	'laugh',
	'wow',
	'sad',
	'angry');

-- DROP SEQUENCE grp_acces_id_seq;

CREATE SEQUENCE grp_acces_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;-- gri.modules definition

-- Drop table

-- DROP TABLE modules;

CREATE TABLE modules (
	mdl_code varchar(50) NOT NULL,
	mdl_name varchar(50) NOT NULL,
	mdl_description text NOT NULL,
	CONSTRAINT pk_modules PRIMARY KEY (mdl_code)
);
CREATE UNIQUE INDEX modules_pk ON gri.modules USING btree (mdl_code);

-- Table Triggers

create trigger trg_create_accesses_on_new_module after
insert
    on
    gri.modules for each row execute function create_accesses_for_new_module();
create trigger trg_delete_accesses_on_module_delete before
delete
    on
    gri.modules for each row execute function delete_accesses_for_module();


-- gri.mot_de_passe_oublie definition

-- Drop table

-- DROP TABLE mot_de_passe_oublie;

CREATE TABLE mot_de_passe_oublie (
	mdpo_code varchar(250) NOT NULL,
	usr_code varchar(250) NULL,
	mdpo_date timestamp NULL,
	mdpo_expire_date timestamp NULL,
	mdpo_info text NULL,
	mdp_otp varchar(50) NULL,
	mdp_status varchar(250) NULL,
	CONSTRAINT pk_mot_de_passe_oublie PRIMARY KEY (mdpo_code)
);


-- gri.notification_types definition

-- Drop table

-- DROP TABLE notification_types;

CREATE TABLE notification_types (
	notif_type gri."notification_type_enum" NOT NULL,
	description text NULL,
	default_ttl_hours int2 NULL,
	CONSTRAINT notification_types_pkey PRIMARY KEY (notif_type)
);


-- gri.state definition

-- Drop table

-- DROP TABLE state;

CREATE TABLE state (
	state_code varchar(50) NOT NULL,
	state_name varchar(50) NULL,
	state_description text NULL,
	state_modif text NULL,
	state_is_readed bool NULL,
	state_is_deleted bool NULL,
	state_created_date timestamp NULL,
	state_modif_date timestamp NULL,
	CONSTRAINT pk_state PRIMARY KEY (state_code)
);
CREATE UNIQUE INDEX state_pk ON gri.state USING btree (state_code);


-- gri.variable_globale definition

-- Drop table

-- DROP TABLE variable_globale;

CREATE TABLE variable_globale (
	var_g_code varchar(50) NOT NULL,
	var_g_name varchar(250) NOT NULL,
	var_g_type varchar(50) NULL,
	var_g_description text NULL,
	var_g_value varchar(50) NULL,
	var_g_created_date timestamp NULL,
	CONSTRAINT pk_variable_globale PRIMARY KEY (var_g_code)
);
CREATE UNIQUE INDEX variable_globale_pk ON gri.variable_globale USING btree (var_g_code);


-- gri.buttons definition

-- Drop table

-- DROP TABLE buttons;

CREATE TABLE buttons (
	btn_code varchar(50) NOT NULL,
	mdl_code varchar(50) NULL,
	btn_name varchar(50) NOT NULL,
	btn_description text NOT NULL,
	btn_modif text NULL,
	CONSTRAINT pk_buttons PRIMARY KEY (btn_code),
	CONSTRAINT fk_buttons_module_co_modules FOREIGN KEY (mdl_code) REFERENCES modules(mdl_code) ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE UNIQUE INDEX buttons_pk ON gri.buttons USING btree (btn_code);
CREATE INDEX module_contient_btn_fk ON gri.buttons USING btree (mdl_code);

-- Table Triggers

create trigger trg_create_accesses_on_new_button after
insert
    on
    gri.buttons for each row execute function create_accesses_for_new_button();
create trigger trg_delete_accesses_on_button_delete before
delete
    on
    gri.buttons for each row execute function delete_accesses_for_button();


-- gri.components definition

-- Drop table

-- DROP TABLE components;

CREATE TABLE components (
	cmpn_code varchar(50) NOT NULL,
	mdl_code varchar(50) NULL,
	cmpn_name varchar(50) NULL,
	cmpn_description text NULL,
	CONSTRAINT pk_components PRIMARY KEY (cmpn_code),
	CONSTRAINT fk_componen_module_co_modules FOREIGN KEY (mdl_code) REFERENCES modules(mdl_code) ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE UNIQUE INDEX components_pk ON gri.components USING btree (cmpn_code);
CREATE INDEX module_contient_cmpn_fk ON gri.components USING btree (mdl_code);

-- Table Triggers

create trigger trg_create_accesses_on_new_component after
insert
    on
    gri.components for each row execute function create_accesses_for_new_component();
create trigger trg_delete_accesses_on_component_delete before
delete
    on
    gri.components for each row execute function delete_accesses_for_component();


-- gri.menu definition

-- Drop table

-- DROP TABLE menu;

CREATE TABLE menu (
	menu_code varchar(50) NOT NULL,
	mdl_code varchar(50) NULL,
	menu_name varchar(50) NULL,
	menu_description text NULL,
	CONSTRAINT pk_menu PRIMARY KEY (menu_code),
	CONSTRAINT fk_menu_module_co_modules FOREIGN KEY (mdl_code) REFERENCES modules(mdl_code) ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE UNIQUE INDEX menu_pk ON gri.menu USING btree (menu_code);
CREATE INDEX module_contient_menu_fk ON gri.menu USING btree (mdl_code);

-- Table Triggers

create trigger trg_create_accesses_on_new_menu after
insert
    on
    gri.menu for each row execute function create_accesses_for_new_menu();
create trigger trg_delete_accesses_on_menu_delete before
delete
    on
    gri.menu for each row execute function delete_accesses_for_menu();


-- gri.pages definition

-- Drop table

-- DROP TABLE pages;

CREATE TABLE pages (
	page_code varchar(50) NOT NULL,
	mdl_code varchar(255) NULL,
	page_name varchar(50) NOT NULL,
	page_description text NOT NULL,
	CONSTRAINT pk_pages PRIMARY KEY (page_code),
	CONSTRAINT fk_pages_module_co_modules FOREIGN KEY (mdl_code) REFERENCES modules(mdl_code) ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX module_contient_page_fk ON gri.pages USING btree (mdl_code);
CREATE UNIQUE INDEX pages_pk ON gri.pages USING btree (page_code);

-- Table Triggers

create trigger trg_delete_accesses_on_page_delete before
delete
    on
    gri.pages for each row execute function delete_accesses_for_page();


-- gri.acces_groupe_creator definition

-- Drop table

-- DROP TABLE acces_groupe_creator;

CREATE TABLE acces_groupe_creator (
	grp_code varchar(50) NOT NULL,
	usr_creator_code varchar(50) NOT NULL,
	CONSTRAINT pk_acces_groupe_creator PRIMARY KEY (grp_code, usr_creator_code)
);
CREATE INDEX acces_groupe_creator2_fk ON gri.acces_groupe_creator USING btree (usr_creator_code);
CREATE INDEX acces_groupe_creator_fk ON gri.acces_groupe_creator USING btree (grp_code);
CREATE UNIQUE INDEX acces_groupe_creator_pk ON gri.acces_groupe_creator USING btree (grp_code, usr_creator_code);


-- gri.additionnal_state definition

-- Drop table

-- DROP TABLE additionnal_state;

CREATE TABLE additionnal_state (
	msg_code varchar(50) NOT NULL,
	state_code varchar(50) NOT NULL,
	CONSTRAINT pk_additionnal_state PRIMARY KEY (msg_code, state_code)
);
CREATE INDEX additionnal_state2_fk ON gri.additionnal_state USING btree (state_code);
CREATE INDEX additionnal_state_fk ON gri.additionnal_state USING btree (msg_code);
CREATE UNIQUE INDEX additionnal_state_pk ON gri.additionnal_state USING btree (msg_code, state_code);


-- gri."call" definition

-- Drop table

-- DROP TABLE "call";

CREATE TABLE "call" (
	call_code varchar(50) NOT NULL,
	usr_code varchar(50) NOT NULL,
	call_is_missed bool NULL,
	call_created_date timestamp NULL,
	CONSTRAINT pk_call PRIMARY KEY (call_code)
);
CREATE UNIQUE INDEX call_pk ON gri.call USING btree (call_code);
CREATE INDEX calling_user_fk ON gri.call USING btree (usr_code);


-- gri.call_dest_code definition

-- Drop table

-- DROP TABLE call_dest_code;

CREATE TABLE call_dest_code (
	usr_code varchar(50) NOT NULL,
	call_code varchar(50) NOT NULL,
	call_dest_is_accepted bool NULL,
	call_dest varchar(50) NULL,
	call_dest_created_date timestamp NULL,
	CONSTRAINT pk_call_dest_code PRIMARY KEY (usr_code, call_code)
);
CREATE INDEX call_dest_code2_fk ON gri.call_dest_code USING btree (call_code);
CREATE INDEX call_dest_code_fk ON gri.call_dest_code USING btree (usr_code);
CREATE UNIQUE INDEX call_dest_code_pk ON gri.call_dest_code USING btree (usr_code, call_code);


-- gri.call_room_autorized_user definition

-- Drop table

-- DROP TABLE call_room_autorized_user;

CREATE TABLE call_room_autorized_user (
	msg_room_grp_code varchar(255) NOT NULL,
	usr_code varchar(50) NOT NULL,
	msg_room_grp_user_add_date timestamp NULL,
	msg_room_grp_user_is_remouved bool NULL,
	msg_room_grp_user_is_admin bool NULL,
	msg_room_grp_user_is_add_by varchar(255) NULL,
	msg_room_grp_user_is_remove_by varchar(255) NULL,
	msg_room_grp_user_admin_add_by varchar(255) NULL,
	CONSTRAINT pk_call_room_autorized_user PRIMARY KEY (msg_room_grp_code, usr_code)
);
CREATE INDEX call_room_autorized_user2_fk ON gri.call_room_autorized_user USING btree (usr_code);
CREATE INDEX call_room_autorized_user_fk ON gri.call_room_autorized_user USING btree (msg_room_grp_code);
CREATE UNIQUE INDEX call_room_autorized_user_pk ON gri.call_room_autorized_user USING btree (msg_room_grp_code, usr_code);


-- gri."comment" definition

-- Drop table

-- DROP TABLE "comment";

CREATE TABLE "comment" (
	cmt_code varchar(50) NOT NULL,
	post_code varchar(50) NOT NULL,
	usr_code varchar(50) NOT NULL,
	cmt_root_code varchar(50) NULL,
	cmt_parent_code varchar(50) NULL,
	cmt_delete_by varchar(50) NULL,
	cmt_response_lv int4 NULL,
	cmt_content text NULL,
	cmt_is_deleted bool DEFAULT false NULL,
	cmt_save_as_history bool DEFAULT false NULL,
	cmt_created_date timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	cmt_modif_date timestamp NULL,
	CONSTRAINT pk_comment PRIMARY KEY (cmt_code)
);
CREATE INDEX comment_cmt_code_idx ON gri.comment USING btree (cmt_code);
CREATE INDEX comment_delete_by_idx ON gri.comment USING btree (cmt_delete_by);
CREATE INDEX comment_delete_idx ON gri.comment USING btree (cmt_is_deleted);
CREATE INDEX comment_parent_cmt_code_idx ON gri.comment USING btree (cmt_parent_code);
CREATE INDEX comment_post_code_idx ON gri.comment USING btree (post_code);
CREATE INDEX comment_root_cmt_code_idx ON gri.comment USING btree (cmt_root_code);
CREATE INDEX comment_save_as_history_idx ON gri.comment USING btree (cmt_save_as_history);
CREATE INDEX comment_usr_code_idx ON gri.comment USING btree (usr_code);


-- gri.comment_reactions definition

-- Drop table

-- DROP TABLE comment_reactions;

CREATE TABLE comment_reactions (
	c_react_code varchar(50) NOT NULL,
	post_code varchar(50) NOT NULL,
	cmt_code varchar(50) NOT NULL,
	usr_code varchar(50) NOT NULL,
	c_react_reaction gri."reaction_type" NOT NULL,
	c_react_created_date timestamp DEFAULT now() NOT NULL,
	CONSTRAINT comment_reactions_pkey PRIMARY KEY (c_react_code),
	CONSTRAINT comment_reactions_post_code_cmt_code_usr_code_c_react_react_key UNIQUE (post_code, cmt_code, usr_code, c_react_reaction)
);
CREATE INDEX idx_comment_reactions_comment_id ON gri.comment_reactions USING btree (cmt_code);
CREATE INDEX idx_comment_reactions_comment_post_id ON gri.comment_reactions USING btree (post_code);
CREATE INDEX idx_comment_reactions_comment_user_id ON gri.comment_reactions USING btree (usr_code);


-- gri.dest_msg_room_grp definition

-- Drop table

-- DROP TABLE dest_msg_room_grp;

CREATE TABLE dest_msg_room_grp (
	msg_room_grp_code varchar(255) NOT NULL,
	msg_code varchar(50) NOT NULL,
	usr_code varchar(50) NOT NULL,
	dest_msg_room_grp_sender_code bpchar(255) NULL,
	dest_msg_room_grp_is_readed bool NULL,
	dest_msg_room_grp_is_deleted bool NULL,
	dest_msg_room_grp_created_date timestamp NULL,
	dest_msg_room_grp_modif_date timestamp NULL,
	CONSTRAINT pk_dest_msg_room_grp PRIMARY KEY (msg_room_grp_code, msg_code, usr_code)
);
CREATE INDEX dest_msg_room_grp2_fk ON gri.dest_msg_room_grp USING btree (msg_code);
CREATE INDEX dest_msg_room_grp3_fk ON gri.dest_msg_room_grp USING btree (usr_code);
CREATE INDEX dest_msg_room_grp_fk ON gri.dest_msg_room_grp USING btree (msg_room_grp_code);
CREATE UNIQUE INDEX dest_msg_room_grp_pk ON gri.dest_msg_room_grp USING btree (msg_room_grp_code, msg_code, usr_code);


-- gri.destination definition

-- Drop table

-- DROP TABLE destination;

CREATE TABLE destination (
	msg_code varchar(50) NOT NULL,
	usr_code varchar(50) NOT NULL,
	dest_sender_code varchar(50) NULL,
	dest_is_readed bool NULL,
	dest_is_deleted bool NULL,
	dest_created_date timestamp NULL,
	dest_modif_date timestamp NULL,
	CONSTRAINT pk_destination PRIMARY KEY (msg_code, usr_code)
);
CREATE INDEX destination2_fk ON gri.destination USING btree (usr_code);
CREATE INDEX destination_fk ON gri.destination USING btree (msg_code);
CREATE UNIQUE INDEX destination_pk ON gri.destination USING btree (msg_code, usr_code);


-- gri.groupe_acces definition

-- Drop table

-- DROP TABLE groupe_acces;

CREATE TABLE groupe_acces (
	grp_acces_code varchar(50) DEFAULT (('grp-acces-'::text || nextval('grp_acces_id_seq'::regclass))) NOT NULL,
	grp_code varchar(50) NOT NULL,
	acces_type gri."acces_type_value" NOT NULL,
	acces_code varchar(50) NOT NULL,
	hist_grp_a_code varchar(50) NOT NULL,
	grp_acces_is_active bool DEFAULT true NOT NULL,
	grp_acces_created_at timestamp DEFAULT now() NOT NULL,
	grp_acces_updated_at timestamp NULL,
	grp_acces_extra_value varchar(50) NULL,
	CONSTRAINT pk_groupe_acces PRIMARY KEY (grp_code, acces_type, acces_code)
);
CREATE INDEX idx_grp_acces_active ON gri.groupe_acces USING btree (grp_acces_is_active);
CREATE INDEX idx_grp_acces_entity ON gri.groupe_acces USING btree (acces_type, acces_code);
CREATE INDEX idx_grp_acces_hist ON gri.groupe_acces USING btree (hist_grp_a_code);


-- gri.groupe_user_files definition

-- Drop table

-- DROP TABLE groupe_user_files;

CREATE TABLE groupe_user_files (
	guf_code varchar(50) NOT NULL,
	gumes_code varchar(50) NOT NULL,
	gun_code varchar(50) NOT NULL,
	usr_code varchar(50) NOT NULL,
	guf_name varchar(255) NULL,
	guf_path varchar(255) NULL,
	guf_type varchar(255) NULL,
	guf_size int4 NULL,
	guf_is_deleted bool DEFAULT false NULL,
	guf_created_date timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	guf_deleted_date timestamp NULL,
	CONSTRAINT pk_groupe_user_files PRIMARY KEY (guf_code)
);


-- gri.groupe_user_member definition

-- Drop table

-- DROP TABLE groupe_user_member;

CREATE TABLE groupe_user_member (
	gum_code varchar(50) NOT NULL,
	gun_code varchar(50) NOT NULL,
	usr_code varchar(50) NOT NULL,
	gum_role varchar(20) DEFAULT 'member'::character varying NOT NULL,
	gum_is_admin bool DEFAULT false NOT NULL,
	gum_user_accept_join bool DEFAULT false NOT NULL,
	gum_user_refuse_join bool DEFAULT false NOT NULL,
	gum_refuse_accept_date timestamp NULL,
	gum_user_added_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	gum_user_is_deleted bool DEFAULT false NULL,
	gum_user_is_deleted_by varchar(50) NULL,
	gum_user_is_add_by varchar(50) NULL,
	CONSTRAINT pk_groupe_user_member PRIMARY KEY (gum_code)
);
CREATE INDEX idx_gum_groupe ON gri.groupe_user_member USING btree (gun_code);
CREATE INDEX idx_gum_role ON gri.groupe_user_member USING btree (gum_role);
CREATE INDEX idx_gum_user ON gri.groupe_user_member USING btree (usr_code);


-- gri.groupe_user_message definition

-- Drop table

-- DROP TABLE groupe_user_message;

CREATE TABLE groupe_user_message (
	gumes_code varchar(50) NOT NULL,
	gun_code varchar(50) NOT NULL,
	usr_code varchar(50) NOT NULL,
	gumes_content text NULL,
	gumes_is_deleted bool DEFAULT false NULL,
	gumes_created_date timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	gumes_updated_date timestamp NULL,
	gumes_parent_code varchar(50) NULL,
	gumes_forwarded_from varchar(50) NULL,
	gumes_forwarded_from_user varchar(50) NULL,
	CONSTRAINT pk_groupe_user_message PRIMARY KEY (gumes_code)
);
CREATE INDEX groupe_messages_parent_code_idx ON gri.groupe_user_message USING btree (gumes_parent_code);
CREATE INDEX idm_gum_groupe ON gri.groupe_user_message USING btree (gun_code);
CREATE INDEX idm_gum_user ON gri.groupe_user_message USING btree (usr_code);
CREATE INDEX idx_gumes_forwarded_from ON gri.groupe_user_message USING btree (gumes_forwarded_from);
CREATE INDEX idx_gumes_forwarded_from_user ON gri.groupe_user_message USING btree (gumes_forwarded_from_user);


-- gri.groupe_user_name definition

-- Drop table

-- DROP TABLE groupe_user_name;

CREATE TABLE groupe_user_name (
	gun_code varchar(50) NOT NULL,
	gun_name varchar(50) NOT NULL,
	gun_description text NULL,
	gun_img varchar(255) NULL,
	gun_created_by varchar(50) NOT NULL,
	gun_is_deleted bool DEFAULT false NOT NULL,
	gun_created_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT pk_groupe_user_name PRIMARY KEY (gun_code)
);
CREATE INDEX idx_gun_created_by ON gri.groupe_user_name USING btree (gun_created_by);
CREATE INDEX idx_gun_is_deleted ON gri.groupe_user_name USING btree (gun_is_deleted);


-- gri.groupes definition

-- Drop table

-- DROP TABLE groupes;

CREATE TABLE groupes (
	grp_code varchar(50) NOT NULL,
	mtr_code varchar(50) NULL,
	grp_name varchar(50) NOT NULL,
	grp_description text NOT NULL,
	grp_created_date timestamp NULL,
	CONSTRAINT pk_groupes PRIMARY KEY (grp_code)
);
CREATE INDEX association_groupe_metier2_fk ON gri.groupes USING btree (mtr_code);
CREATE UNIQUE INDEX groupes_pk ON gri.groupes USING btree (grp_code);

-- Table Triggers

create trigger trg_create_accesses_on_new_group after
insert
    on
    gri.groupes for each row execute function create_accesses_for_new_group();
create trigger trg_delete_accesses_on_group_delete before
delete
    on
    gri.groupes for each row execute function delete_accesses_for_group();


-- gri.history_groupe_acces definition

-- Drop table

-- DROP TABLE history_groupe_acces;

CREATE TABLE history_groupe_acces (
	hist_grp_a_code varchar(50) NOT NULL,
	hist_grp_a_date timestamp DEFAULT now() NOT NULL,
	hist_grp_a_action varchar(20) NOT NULL,
	hist_grp_a_user varchar(50) NULL,
	hist_grp_a_comment text NULL,
	grp_code varchar(50) NOT NULL,
	acces_type gri."acces_type_value" NOT NULL,
	acces_code varchar(50) NOT NULL,
	is_active bool DEFAULT true NOT NULL,
	CONSTRAINT pk_history_groupe_acces PRIMARY KEY (hist_grp_a_code)
);


-- gri.history_groupe_modif definition

-- Drop table

-- DROP TABLE history_groupe_modif;

CREATE TABLE history_groupe_modif (
	usr_code varchar(50) NOT NULL,
	grp_code varchar(50) NOT NULL,
	history_grp_modif_date timestamp NULL,
	history_grp_modi_description text NULL,
	CONSTRAINT pk_history_groupe_modif PRIMARY KEY (usr_code, grp_code)
);
CREATE INDEX history_groupe_modif2_fk ON gri.history_groupe_modif USING btree (grp_code);
CREATE INDEX history_groupe_modif_fk ON gri.history_groupe_modif USING btree (usr_code);
CREATE UNIQUE INDEX history_groupe_modif_pk ON gri.history_groupe_modif USING btree (usr_code, grp_code);


-- gri.history_metiers_modif definition

-- Drop table

-- DROP TABLE history_metiers_modif;

CREATE TABLE history_metiers_modif (
	usr_code varchar(50) NOT NULL,
	mtr_code varchar(50) NOT NULL,
	history_mtr_modif_date timestamp NULL,
	history_mtr_modif_description text NULL,
	CONSTRAINT pk_history_metiers_modif PRIMARY KEY (usr_code, mtr_code)
);
CREATE INDEX history_metiers_modif2_fk ON gri.history_metiers_modif USING btree (mtr_code);
CREATE INDEX history_metiers_modif_fk ON gri.history_metiers_modif USING btree (usr_code);
CREATE UNIQUE INDEX history_metiers_modif_pk ON gri.history_metiers_modif USING btree (usr_code, mtr_code);


-- gri.history_user_modified definition

-- Drop table

-- DROP TABLE history_user_modified;

CREATE TABLE history_user_modified (
	usr_code varchar(50) NOT NULL,
	usr_creator_code varchar(50) NOT NULL,
	history_usr_modif_date timestamp NULL,
	history_usr_modif_description text NULL,
	CONSTRAINT pk_history_user_modified PRIMARY KEY (usr_code, usr_creator_code)
);
CREATE INDEX history_user_modified2_fk ON gri.history_user_modified USING btree (usr_creator_code);
CREATE INDEX history_user_modified_fk ON gri.history_user_modified USING btree (usr_code);
CREATE UNIQUE INDEX history_user_modified_pk ON gri.history_user_modified USING btree (usr_code, usr_creator_code);


-- gri.history_users_on_line definition

-- Drop table

-- DROP TABLE history_users_on_line;

-- gri.history_usr_create_groupe definition

-- Drop table

-- DROP TABLE history_usr_create_groupe;

CREATE TABLE history_usr_create_groupe (
	usr_code varchar(50) NOT NULL,
	grp_code varchar(50) NOT NULL,
	history_create_grp_date timestamp NULL,
	CONSTRAINT pk_history_usr_create_groupe PRIMARY KEY (usr_code, grp_code)
);
CREATE INDEX history_usr_create_groupe2_fk ON gri.history_usr_create_groupe USING btree (grp_code);
CREATE INDEX history_usr_create_groupe_fk ON gri.history_usr_create_groupe USING btree (usr_code);
CREATE UNIQUE INDEX history_usr_create_groupe_pk ON gri.history_usr_create_groupe USING btree (usr_code, grp_code);


-- gri.history_var_g definition

-- Drop table

-- DROP TABLE history_var_g;

CREATE TABLE history_var_g (
	var_g_code varchar(50) NOT NULL,
	usr_code varchar(50) NOT NULL,
	var_global_date_history timestamp NULL,
	var_global_modif_description text NULL,
	CONSTRAINT pk_history_var_g PRIMARY KEY (var_g_code, usr_code)
);
CREATE INDEX history_var_g2_fk ON gri.history_var_g USING btree (usr_code);
CREATE INDEX history_var_g_fk ON gri.history_var_g USING btree (var_g_code);
CREATE UNIQUE INDEX history_var_g_pk ON gri.history_var_g USING btree (var_g_code, usr_code);


-- gri.list_user_created definition

-- Drop table

-- DROP TABLE list_user_created;

CREATE TABLE list_user_created (
	usr_code varchar(50) NOT NULL,
	usr_creator_code varchar(50) NOT NULL,
	created_date timestamp NULL,
	CONSTRAINT pk_list_user_created PRIMARY KEY (usr_code, usr_creator_code)
);
CREATE INDEX list_user_created2_fk ON gri.list_user_created USING btree (usr_creator_code);
CREATE INDEX list_user_created_fk ON gri.list_user_created USING btree (usr_code);
CREATE UNIQUE INDEX list_user_created_pk ON gri.list_user_created USING btree (usr_code, usr_creator_code);


-- gri.message_reactions definition

-- Drop table

-- DROP TABLE message_reactions;

CREATE TABLE message_reactions (
	m_react_code varchar(50) NOT NULL,
	msg_code varchar(50) NOT NULL,
	usr_code varchar(50) NOT NULL,
	m_react_reaction gri."reaction_type" NOT NULL,
	m_react_created_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT message_reactions_msg_code_usr_code_m_react_reaction_key UNIQUE (msg_code, usr_code, m_react_reaction),
	CONSTRAINT message_reactions_pkey PRIMARY KEY (m_react_code)
);
CREATE INDEX idx_message_reactions_msg_code ON gri.message_reactions USING btree (msg_code);
CREATE INDEX idx_message_reactions_reaction ON gri.message_reactions USING btree (m_react_reaction);
CREATE INDEX idx_message_reactions_usr_code ON gri.message_reactions USING btree (usr_code);


-- gri.messages definition

-- Drop table

-- DROP TABLE messages;

CREATE TABLE messages (
	msg_code varchar(50) NOT NULL,
	usr_code varchar(50) NOT NULL,
	msg_contenu text NOT NULL,
	msg_has_piece_joint bool NULL,
	msg_modif text NULL,
	msg_created_date timestamp NULL,
	msg_modif_date timestamp NULL,
	msg_parent_code varchar(50) NULL,
	msg_forwarded_from varchar(50) NULL,
	msg_forwarded_from_user varchar(50) NULL,
	CONSTRAINT pk_messages PRIMARY KEY (msg_code)
);
CREATE INDEX messages_parent_code_idx ON gri.messages USING btree (msg_parent_code);
CREATE UNIQUE INDEX messages_pk ON gri.messages USING btree (msg_code);
CREATE INDEX sender_fk ON gri.messages USING btree (usr_code);


-- gri.metiers definition

-- Drop table

-- DROP TABLE metiers;

CREATE TABLE metiers (
	mtr_code varchar(50) NOT NULL,
	grp_code varchar(50) NOT NULL,
	mtr_name varchar(50) NOT NULL,
	mtr_description text NOT NULL,
	CONSTRAINT pk_metiers PRIMARY KEY (mtr_code)
);
CREATE INDEX association_groupe_metier_fk ON gri.metiers USING btree (grp_code);
CREATE UNIQUE INDEX metiers_pk ON gri.metiers USING btree (mtr_code);


-- gri.msg_file_joint definition

-- Drop table

-- DROP TABLE msg_file_joint;

-- gri.msg_room_groupe definition

-- Drop table

-- DROP TABLE msg_room_groupe;

CREATE TABLE msg_room_groupe (
	msg_room_grp_code varchar(255) NOT NULL,
	usr_code varchar(50) NOT NULL,
	msg_room_grp_name varchar(255) NULL,
	msg_room_grp_is_used_only_msg bool NULL,
	msg_room_grp_is_used_only_room bool NULL,
	msg_room_grp_is_used_only_grp bool NULL,
	msg_room_grp_is_permanent bool NULL,
	msg_room_grp_is_public bool NULL,
	msg_room_grp_is_deleted bool NULL,
	msg_room_grp_created_date timestamp NULL,
	msg_room_grp_deleted_date timestamp NULL,
	CONSTRAINT pk_msg_room_groupe PRIMARY KEY (msg_room_grp_code)
);
CREATE INDEX call_room_creator_fk ON gri.msg_room_groupe USING btree (usr_code);
CREATE UNIQUE INDEX msg_room_groupe_pk ON gri.msg_room_groupe USING btree (msg_room_grp_code);


-- gri.notifications definition

-- Drop table

-- DROP TABLE notifications;

-- gri.pinned_post definition

-- Drop table

-- DROP TABLE pinned_post;

CREATE TABLE pinned_post (
	pp_code varchar(50) NOT NULL,
	post_code varchar(50) NOT NULL,
	pp_custome_title text NULL,
	pp_order int4 NULL,
	pp_is_deleted bool NULL,
	pp_user_code varchar(50) NULL,
	pp_created_date timestamp NULL,
	CONSTRAINT pk_pinned_post PRIMARY KEY (pp_code)
);
CREATE INDEX add_pinned_post_fk ON gri.pinned_post USING btree (post_code);
CREATE UNIQUE INDEX pinned_post_pk ON gri.pinned_post USING btree (pp_code);


-- gri.post definition

-- Drop table

-- DROP TABLE post;

CREATE TABLE post (
	post_code varchar(50) NOT NULL,
	usr_code varchar(50) NULL,
	post_title varchar(255) NULL,
	post_description text NULL,
	post_nbr_seen varchar(255) NULL,
	post_usr_code_seen_list text NULL,
	post_is_valided bool NULL,
	post_is_deleted bool NULL,
	post_modif text NULL,
	post_created_date timestamp NULL,
	post_modif_date timestamp NULL,
	post_is_public bool NULL,
	CONSTRAINT pk_post PRIMARY KEY (post_code)
);
CREATE INDEX add_post_fk ON gri.post USING btree (usr_code);
CREATE UNIQUE INDEX post_pk ON gri.post USING btree (post_code);


-- gri.post_file_joint definition

-- Drop table

-- DROP TABLE post_file_joint;

CREATE TABLE post_file_joint (
	pfj_code varchar(50) NOT NULL,
	post_code varchar(50) NOT NULL,
	usr_code varchar(50) NOT NULL,
	pfj_path varchar(255) NULL,
	pfj_type varchar(50) NULL,
	pfj_size varchar(50) NULL,
	pfj_name varchar(255) NULL,
	pfj_is_deleted bool DEFAULT false NULL,
	pfj_is_deleted_by varchar(50) NULL,
	pfj_created_date timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	pfj_deleted_date timestamp NULL,
	CONSTRAINT pk_pfj PRIMARY KEY (pfj_code)
);


-- gri.post_history_modif definition

-- Drop table

-- DROP TABLE post_history_modif;

CREATE TABLE post_history_modif (
	phm_code varchar(50) NOT NULL,
	usr_code varchar(50) NOT NULL,
	post_code varchar(50) NOT NULL,
	phm_modif_description text NULL,
	phm_created_date timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT pk_phm PRIMARY KEY (phm_code)
);


-- gri.post_reactions definition

-- Drop table

-- DROP TABLE post_reactions;

CREATE TABLE post_reactions (
	p_react_code varchar(50) NOT NULL,
	post_code varchar(50) NOT NULL,
	usr_code varchar(50) NOT NULL,
	p_react_reaction gri."reaction_type" NOT NULL,
	p_react_created_date timestamp DEFAULT now() NOT NULL,
	CONSTRAINT post_reactions_pkey PRIMARY KEY (p_react_code),
	CONSTRAINT post_reactions_post_code_usr_code_p_react_reaction_key UNIQUE (post_code, usr_code, p_react_reaction)
);
CREATE INDEX idx_post_reactions_post_id ON gri.post_reactions USING btree (post_code);
CREATE INDEX idx_post_reactions_user_id ON gri.post_reactions USING btree (usr_code);


-- gri.reports definition

-- Drop table

-- DROP TABLE reports;

CREATE TABLE reports (
	rpt_code varchar(50) NOT NULL,
	rpt_type varchar(20) NOT NULL,
	rpt_target_code varchar(50) NOT NULL,
	usr_code varchar(50) NOT NULL,
	rpt_reason varchar(50) NOT NULL,
	rpt_description text NULL,
	rpt_status varchar(20) DEFAULT 'pending'::character varying NULL,
	rpt_severity int4 DEFAULT 1 NULL,
	rpt_created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	rpt_updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT reports_pkey PRIMARY KEY (rpt_code),
	CONSTRAINT reports_rpt_reason_check CHECK (((rpt_reason)::text = ANY ((ARRAY['spam'::character varying, 'harcelement'::character varying, 'haine'::character varying, 'nudite'::character varying, 'desinformation'::character varying, 'autre'::character varying])::text[]))),
	CONSTRAINT reports_rpt_severity_check CHECK (((rpt_severity >= 1) AND (rpt_severity <= 5))),
	CONSTRAINT reports_rpt_status_check CHECK (((rpt_status)::text = ANY ((ARRAY['pending'::character varying, 'reviewed'::character varying, 'dismissed'::character varying])::text[]))),
	CONSTRAINT reports_rpt_type_check CHECK (((rpt_type)::text = ANY ((ARRAY['post'::character varying, 'comment'::character varying, 'message'::character varying])::text[])))
);
CREATE INDEX idx_reports_created_at ON gri.reports USING btree (rpt_created_at DESC);
CREATE INDEX idx_reports_status_severity ON gri.reports USING btree (rpt_status, rpt_severity DESC);
CREATE INDEX idx_reports_target ON gri.reports USING btree (rpt_type, rpt_target_code);
CREATE INDEX idx_reports_usr_code ON gri.reports USING btree (usr_code);


-- gri."session" definition

-- Drop table

-- DROP TABLE "session";

CREATE TABLE "session" (
	session_code varchar(50) NOT NULL,
	usr_code varchar(50) NOT NULL,
	session_created_date timestamp DEFAULT now() NOT NULL,
	session_last_active timestamp DEFAULT now() NOT NULL,
	session_expires_at timestamp NOT NULL,
	session_refresh_token text NOT NULL,
	session_is_active bool DEFAULT true NOT NULL,
	session_user_is_online bool DEFAULT false NOT NULL,
	session_is_trusted bool DEFAULT false NOT NULL,
	session_browser_info jsonb NULL,
	session_ip varchar(50) NOT NULL,
	session_device_id varchar(100) NULL,
	CONSTRAINT session_pkey PRIMARY KEY (session_code)
);
CREATE INDEX idx_session_active ON gri.session USING btree (session_is_active);
CREATE INDEX idx_session_browser_name ON gri.session USING btree ((((session_browser_info -> 'browser'::text) ->> 'name'::text))) WHERE (session_browser_info IS NOT NULL);
CREATE INDEX idx_session_created_date ON gri.session USING btree (session_created_date);
CREATE INDEX idx_session_device ON gri.session USING btree (session_device_id);
CREATE INDEX idx_session_expires ON gri.session USING btree (session_expires_at);
CREATE INDEX idx_session_os_name ON gri.session USING btree ((((session_browser_info -> 'os'::text) ->> 'name'::text))) WHERE (session_browser_info IS NOT NULL);
CREATE INDEX idx_session_user ON gri.session USING btree (usr_code);
CREATE INDEX idx_session_usr_last_active ON gri.session USING btree (usr_code, session_last_active DESC);
CREATE UNIQUE INDEX pk_session ON gri.session USING btree (session_code);
CREATE INDEX user_session_fk ON gri.session USING btree (usr_code);

-- Table Triggers

create trigger trigger_update_session_last_active before
update
    on
    gri.session for each row execute function update_session_last_active();


-- gri.user_field_visibility definition

-- Drop table

-- DROP TABLE user_field_visibility;

CREATE TABLE user_field_visibility (
	ufv_code varchar(50) NOT NULL,
	usr_code varchar(50) NOT NULL,
	ufv_field_name varchar(50) NOT NULL,
	ufv_visibility varchar(20) NOT NULL,
	ufv_created_date timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT chk_visibility CHECK (((ufv_visibility)::text = ANY (ARRAY[('public'::character varying)::text, ('private'::character varying)::text, ('friends'::character varying)::text]))),
	CONSTRAINT pk_user_field_visibility PRIMARY KEY (ufv_code)
);
CREATE INDEX idx_ufv_user ON gri.user_field_visibility USING btree (usr_code);
CREATE UNIQUE INDEX idx_ufv_user_field ON gri.user_field_visibility USING btree (usr_code, ufv_field_name);


-- gri.user_settings definition

-- Drop table

-- DROP TABLE user_settings;

CREATE TABLE user_settings (
	usr_s_code varchar(50) NOT NULL,
	usr_code varchar(50) NOT NULL,
	usr_s_scope varchar(20) NOT NULL,
	usr_s_device_code varchar(100) NULL,
	usr_s_value jsonb DEFAULT '{}'::jsonb NOT NULL,
	usr_s_created_at timestamp DEFAULT now() NULL,
	usr_s_updated_at timestamp DEFAULT now() NULL,
	CONSTRAINT user_settings_pkey PRIMARY KEY (usr_s_code),
	CONSTRAINT user_settings_usr_code_usr_s_scope_usr_s_device_code_key UNIQUE (usr_code, usr_s_scope, usr_s_device_code),
	CONSTRAINT user_settings_usr_s_scope_check CHECK (((usr_s_scope)::text = ANY ((ARRAY['APP_GLOBAL'::character varying, 'DEVICE_LOCAL'::character varying])::text[])))
);
CREATE UNIQUE INDEX idx_user_settings_app_global ON gri.user_settings USING btree (usr_code, usr_s_scope) WHERE ((usr_s_scope)::text = 'APP_GLOBAL'::text);
CREATE INDEX idx_user_settings_device ON gri.user_settings USING btree (usr_s_device_code);
CREATE INDEX idx_user_settings_scope ON gri.user_settings USING btree (usr_s_scope);
CREATE INDEX idx_user_settings_updated ON gri.user_settings USING btree (usr_s_updated_at);
CREATE INDEX idx_user_settings_user ON gri.user_settings USING btree (usr_code);

-- Table Triggers

create trigger update_user_settings_updated_at before
update
    on
    gri.user_settings for each row execute function update_updated_at_column();


-- gri.user_settings_history definition

-- Drop table

-- DROP TABLE user_settings_history;

CREATE TABLE user_settings_history (
	usr_s_h_code varchar(50) NOT NULL,
	usr_s_code varchar(50) NULL,
	usr_code varchar(50) NOT NULL,
	usr_s_h_scope varchar(20) NULL,
	usr_s_h_device_code varchar(100) NULL,
	usr_s_h_old_value jsonb NULL,
	usr_s_h_new_value jsonb NULL,
	usr_s_h_changed_by varchar(50) NULL,
	usr_s_h_changed_at timestamp DEFAULT now() NULL,
	CONSTRAINT user_settings_history_pkey PRIMARY KEY (usr_s_h_code)
);


-- gri.users definition

-- Drop table

-- DROP TABLE users;

CREATE TABLE users (
	usr_code varchar(50) not null,
	grp_code varchar(50) not null,
	usr_name varchar(255) not null,
	usr_firstname varchar(255) null,
	usr_contact varchar(50) null,
	usr_mail varchar(255) not null,
	usr_login varchar(255) null,
	usr_img varchar(255) null,
	usr_gender varchar(15) null,
	usr_description text null,
	usr_password varchar(255) null,
	usr_is_deleted bool null,
	usr_is_valided bool null,
	usr_created_date timestamp null,
	usr_nick_name varchar(250) null,
	usr_addresse varchar(250) null,
	usr_bio text null,
	usr_language varchar(50) null,
	usr_work varchar(250) null,
	usr_theme varchar(50) null,
	usr_default_visibility varchar(20) default 'public'::character varying null,
	usr_is_online bool default false null,
	usr_hide_online_state bool default false null,
	usr_last_online_date timestamp null,
	constraint pk_users primary key (usr_code)
);
CREATE INDEX membre_fk ON gri.users USING btree (grp_code);
CREATE UNIQUE INDEX users_pk ON gri.users USING btree (usr_code);


-- gri.usr_creator_list definition

-- Drop table

-- DROP TABLE usr_creator_list;

CREATE TABLE usr_creator_list (
	usr_creator_code varchar(50) NOT NULL,
	usr_code varchar(50) NOT NULL,
	usr_creator_date timestamp NULL,
	CONSTRAINT pk_usr_creator_list PRIMARY KEY (usr_creator_code)
);
CREATE INDEX add_user_creator_fk ON gri.usr_creator_list USING btree (usr_code);
CREATE UNIQUE INDEX usr_creator_list_pk ON gri.usr_creator_list USING btree (usr_creator_code);

-- gri.groupe_ip definition

-- Drop table

-- DROP TABLE groupe_ip;

CREATE TABLE groupe_ip (
	g_ip_code varchar(50) NOT NULL,
	g_ip_name varchar(50) NULL,
	g_ip_description text NULL,
	g_ip_plage varchar(250) NULL,
	g_ip_created_date timestamp NULL,
	CONSTRAINT pk_groupe_ip PRIMARY KEY (g_ip_code)
);
CREATE UNIQUE INDEX groupe_ip_pk ON gri.groupe_ip USING btree (g_ip_code);


-- gri.network_scan definition

-- Drop table

-- DROP TABLE network_scan;

CREATE TABLE network_scan (
	net_scan_code varchar(50) NOT NULL,
	net_scan_date timestamp NULL,
	net_scan_ip_address varchar(255) NULL,
	net_scan_mac varchar(255) NULL,
	net_scan_snmp_is_on bool NULL,
	net_scan_has_client_app bool NULL,
	net_scan_hostname varchar(255) NULL,
	net_scan_operating_system varchar(255) NULL,
	net_scan_devices_type varchar(255) NULL,
	net_scan_info text NULL,
	net_devices_is_ok bool NULL,
	CONSTRAINT pk_network_scan PRIMARY KEY (net_scan_code)
);
CREATE INDEX network_scan_net_scan_mac_idx ON gri.network_scan USING btree (net_scan_mac);
CREATE UNIQUE INDEX network_scan_pk ON gri.network_scan USING btree (net_scan_code);


-- gri.terminal_type definition

-- Drop table

-- DROP TABLE terminal_type;

CREATE TABLE terminal_type (
	term_type_code varchar(255) NOT NULL,
	term_type_user_code_add varchar(50) NULL,
	term_type_description text NULL,
	term_type_img_description varchar(50) NULL,
	term_type_created_date timestamp NULL,
	term_type_name varchar(50) NULL,
	CONSTRAINT pk_term_type_code PRIMARY KEY (term_type_code)
);


-- gri.divices_is_scaned definition

-- Drop table

-- DROP TABLE divices_is_scaned;

CREATE TABLE divices_is_scaned (
	net_scan_code varchar(50) NOT NULL,
	term_code varchar(50) NOT NULL,
	devices_is_scaned bool NULL,
	CONSTRAINT pk_divices_is_scaned PRIMARY KEY (net_scan_code, term_code)
);
CREATE INDEX divices_is_scaned2_fk ON gri.divices_is_scaned USING btree (term_code);
CREATE INDEX divices_is_scaned_fk ON gri.divices_is_scaned USING btree (net_scan_code);
CREATE UNIQUE INDEX divices_is_scaned_pk ON gri.divices_is_scaned USING btree (net_scan_code, term_code);


-- gri.history_ip_address definition

-- Drop table

-- DROP TABLE history_ip_address;

CREATE TABLE history_ip_address (
	hipa_code varchar(50) NOT NULL,
	term_code varchar(50) NOT NULL,
	g_ip_code varchar(50) NULL,
	hipa_ip_addresse varchar(50) NULL,
	hipa_created_date timestamp NULL,
	CONSTRAINT pk_history_ip_address PRIMARY KEY (hipa_code)
);
CREATE INDEX association_ip_fk ON gri.history_ip_address USING btree (g_ip_code);
CREATE UNIQUE INDEX history_ip_address_pk ON gri.history_ip_address USING btree (hipa_code);
CREATE INDEX ip_adresse_fk ON gri.history_ip_address USING btree (term_code);


-- gri.history_term_modif definition

-- Drop table

-- DROP TABLE history_term_modif;

CREATE TABLE history_term_modif (
	usr_code varchar(50) NOT NULL,
	term_code varchar(50) NOT NULL,
	history_term_modif_date timestamp NULL,
	history_term_modif_description text NULL,
	CONSTRAINT pk_history_term_modif PRIMARY KEY (usr_code, term_code)
);
CREATE INDEX history_term_modif2_fk ON gri.history_term_modif USING btree (term_code);
CREATE INDEX history_term_modif_fk ON gri.history_term_modif USING btree (usr_code);
CREATE UNIQUE INDEX history_term_modif_pk ON gri.history_term_modif USING btree (usr_code, term_code);


-- gri.terminaux definition

-- Drop table

-- DROP TABLE terminaux;

CREATE TABLE terminaux (
	term_code varchar(50) NOT NULL,
	usr_code varchar(50) NULL,
	g_ip_code varchar(50) NULL,
	term_type_code varchar(255) NULL,
	term_marque varchar(50) NULL,
	term_modele varchar(50) NULL,
	term_numero_de_serie varchar(50) NULL,
	term_adresse_mac varchar(50) NOT NULL,
	term_probleme_detecte text NULL,
	term_images text NULL,
	term_is_smnp_actived bool NULL,
	term_is_client_app_installed bool NULL,
	term_is_online bool NULL,
	term_cpu_soc varchar(50) NULL,
	term_number_of_cpu int4 NULL,
	term_ram varchar(50) NULL,
	term_start_up_time timestamp NULL,
	term_interface_connexion varchar(50) NULL,
	term_additionnal_informations text NULL,
	term_created_date timestamp NULL,
	term_modif_date timestamp NULL,
	term_is_deleted bool NULL,
	hipa_code varchar(50) NULL,
	CONSTRAINT pk_terminaux PRIMARY KEY (term_code)
);
CREATE INDEX devices_owner_fk ON gri.terminaux USING btree (usr_code);
CREATE INDEX include_fk ON gri.terminaux USING btree (g_ip_code);
CREATE INDEX include_terminal_type_fk ON gri.terminaux USING btree (term_type_code);
CREATE INDEX terminaux_hipa_code_idx ON gri.terminaux USING btree (hipa_code);
CREATE UNIQUE INDEX terminaux_pk ON gri.terminaux USING btree (term_code);
CREATE INDEX terminaux_term_adresse_mac_idx ON gri.terminaux USING btree (term_adresse_mac);


-- gri.trafics definition

-- Drop table

-- DROP TABLE trafics;

CREATE TABLE trafics (
	trafic_code varchar(50) NOT NULL,
	term_code varchar(50) NOT NULL,
	trafic_info varchar(255) NULL,
	trafic_modif text NULL,
	trafic_created_date timestamp NULL,
	CONSTRAINT pk_trafics PRIMARY KEY (trafic_code)
);
CREATE INDEX generate_fk ON gri.trafics USING btree (term_code);
CREATE UNIQUE INDEX trafics_pk ON gri.trafics USING btree (trafic_code);


-- gri.divices_is_scaned foreign keys

ALTER TABLE gri.divices_is_scaned ADD CONSTRAINT fk_divices__divices_i_network_ FOREIGN KEY (net_scan_code) REFERENCES network_scan(net_scan_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.divices_is_scaned ADD CONSTRAINT fk_divices__divices_i_terminau FOREIGN KEY (term_code) REFERENCES terminaux(term_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.history_ip_address foreign keys

ALTER TABLE gri.history_ip_address ADD CONSTRAINT fk_history__associati_groupe_i FOREIGN KEY (g_ip_code) REFERENCES groupe_ip(g_ip_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.history_ip_address ADD CONSTRAINT fk_history__ip_adress_terminau FOREIGN KEY (term_code) REFERENCES terminaux(term_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.history_term_modif foreign keys

ALTER TABLE gri.history_term_modif ADD CONSTRAINT fk_history__history_t_terminau FOREIGN KEY (term_code) REFERENCES terminaux(term_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.terminaux foreign keys

ALTER TABLE gri.terminaux ADD CONSTRAINT fk_terminau_include_groupe_i FOREIGN KEY (g_ip_code) REFERENCES groupe_ip(g_ip_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.terminaux ADD CONSTRAINT fk_terminaux_include_terminal FOREIGN KEY (term_type_code) REFERENCES terminal_type(term_type_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.terminaux ADD CONSTRAINT terminaux_history_ip_address_fk FOREIGN KEY (hipa_code) REFERENCES history_ip_address(hipa_code) ON DELETE SET NULL ON UPDATE RESTRICT;
ALTER TABLE gri.terminaux ADD CONSTRAINT terminaux_users_fk FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE SET NULL ON UPDATE RESTRICT;


-- gri.trafics foreign keys

ALTER TABLE gri.trafics ADD CONSTRAINT fk_trafics_generate_terminau FOREIGN KEY (term_code) REFERENCES terminaux(term_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.acces_groupe_creator foreign keys

ALTER TABLE gri.acces_groupe_creator ADD CONSTRAINT fk_acces_gr_acces_gro_groupes FOREIGN KEY (grp_code) REFERENCES groupes(grp_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.acces_groupe_creator ADD CONSTRAINT fk_acces_gr_acces_gro_usr_crea FOREIGN KEY (usr_creator_code) REFERENCES usr_creator_list(usr_creator_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.additionnal_state foreign keys

ALTER TABLE gri.additionnal_state ADD CONSTRAINT fk_addition_additionn_messages FOREIGN KEY (msg_code) REFERENCES messages(msg_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.additionnal_state ADD CONSTRAINT fk_addition_additionn_state FOREIGN KEY (state_code) REFERENCES state(state_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri."call" foreign keys

ALTER TABLE gri."call" ADD CONSTRAINT fk_call_calling_u_users FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.call_dest_code foreign keys

ALTER TABLE gri.call_dest_code ADD CONSTRAINT fk_call_des_call_dest_call FOREIGN KEY (call_code) REFERENCES "call"(call_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.call_dest_code ADD CONSTRAINT fk_call_des_call_dest_users FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.call_room_autorized_user foreign keys

ALTER TABLE gri.call_room_autorized_user ADD CONSTRAINT fk_call_roo_call_room_msg_room FOREIGN KEY (msg_room_grp_code) REFERENCES msg_room_groupe(msg_room_grp_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.call_room_autorized_user ADD CONSTRAINT fk_call_roo_call_room_users FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri."comment" foreign keys

ALTER TABLE gri."comment" ADD CONSTRAINT fk_cmt_post FOREIGN KEY (post_code) REFERENCES post(post_code) ON DELETE CASCADE;
ALTER TABLE gri."comment" ADD CONSTRAINT fk_cmt_user FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE CASCADE;
ALTER TABLE gri."comment" ADD CONSTRAINT fk_cmt_user_delete FOREIGN KEY (cmt_delete_by) REFERENCES users(usr_code) ON DELETE CASCADE;


-- gri.comment_reactions foreign keys

ALTER TABLE gri.comment_reactions ADD CONSTRAINT comment_reactions_post_code_fkey FOREIGN KEY (post_code) REFERENCES post(post_code) ON DELETE CASCADE;
ALTER TABLE gri.comment_reactions ADD CONSTRAINT comment_reactions_usr_code_fkey FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE CASCADE;


-- gri.dest_msg_room_grp foreign keys

ALTER TABLE gri.dest_msg_room_grp ADD CONSTRAINT fk_dest_msg_dest_msg__messages FOREIGN KEY (msg_code) REFERENCES messages(msg_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.dest_msg_room_grp ADD CONSTRAINT fk_dest_msg_dest_msg__msg_room FOREIGN KEY (msg_room_grp_code) REFERENCES msg_room_groupe(msg_room_grp_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.dest_msg_room_grp ADD CONSTRAINT fk_dest_msg_dest_msg__users FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.destination foreign keys

ALTER TABLE gri.destination ADD CONSTRAINT fk_destinat_destinati_messages FOREIGN KEY (msg_code) REFERENCES messages(msg_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.destination ADD CONSTRAINT fk_destinat_destinati_users FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.groupe_acces foreign keys

ALTER TABLE gri.groupe_acces ADD CONSTRAINT fk_grp_acces_groupe FOREIGN KEY (grp_code) REFERENCES groupes(grp_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.groupe_acces ADD CONSTRAINT fk_grp_acces_history FOREIGN KEY (hist_grp_a_code) REFERENCES history_groupe_acces(hist_grp_a_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.groupe_user_files foreign keys

ALTER TABLE gri.groupe_user_files ADD CONSTRAINT fk_guf_groupe FOREIGN KEY (gumes_code) REFERENCES groupe_user_message(gumes_code) ON DELETE CASCADE;
ALTER TABLE gri.groupe_user_files ADD CONSTRAINT fk_guf_groupe_name FOREIGN KEY (gun_code) REFERENCES groupe_user_name(gun_code) ON DELETE CASCADE;
ALTER TABLE gri.groupe_user_files ADD CONSTRAINT fk_guf_user FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE CASCADE;


-- gri.groupe_user_member foreign keys

ALTER TABLE gri.groupe_user_member ADD CONSTRAINT fk_gum_groupe FOREIGN KEY (gun_code) REFERENCES groupe_user_name(gun_code) ON DELETE CASCADE;
ALTER TABLE gri.groupe_user_member ADD CONSTRAINT fk_gum_user FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE CASCADE;


-- gri.groupe_user_message foreign keys

ALTER TABLE gri.groupe_user_message ADD CONSTRAINT fk_gum_groupe FOREIGN KEY (gun_code) REFERENCES groupe_user_name(gun_code) ON DELETE CASCADE;
ALTER TABLE gri.groupe_user_message ADD CONSTRAINT fk_gum_user FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE SET NULL;
ALTER TABLE gri.groupe_user_message ADD CONSTRAINT fk_gumes_forwarded_from_user FOREIGN KEY (gumes_forwarded_from_user) REFERENCES users(usr_code) ON DELETE SET NULL;
ALTER TABLE gri.groupe_user_message ADD CONSTRAINT fk_gumes_parent FOREIGN KEY (gumes_parent_code) REFERENCES groupe_user_message(gumes_code) ON DELETE CASCADE;


-- gri.groupe_user_name foreign keys

ALTER TABLE gri.groupe_user_name ADD CONSTRAINT fk_gun_created_by FOREIGN KEY (gun_created_by) REFERENCES users(usr_code) ON DELETE CASCADE;


-- gri.groupes foreign keys

ALTER TABLE gri.groupes ADD CONSTRAINT fk_groupes_associati_metiers FOREIGN KEY (mtr_code) REFERENCES metiers(mtr_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.history_groupe_acces foreign keys

ALTER TABLE gri.history_groupe_acces ADD CONSTRAINT fk_hist_grp_a_groupe FOREIGN KEY (grp_code) REFERENCES groupes(grp_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.history_groupe_acces ADD CONSTRAINT fk_hist_grp_a_user FOREIGN KEY (hist_grp_a_user) REFERENCES users(usr_code) ON DELETE SET NULL ON UPDATE RESTRICT;


-- gri.history_groupe_modif foreign keys

ALTER TABLE gri.history_groupe_modif ADD CONSTRAINT fk_history__history_g_groupes FOREIGN KEY (grp_code) REFERENCES groupes(grp_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.history_groupe_modif ADD CONSTRAINT fk_history__history_g_users FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.history_metiers_modif foreign keys

ALTER TABLE gri.history_metiers_modif ADD CONSTRAINT fk_history__history_m_metiers FOREIGN KEY (mtr_code) REFERENCES metiers(mtr_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.history_metiers_modif ADD CONSTRAINT fk_history__history_m_users FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.history_user_modified foreign keys

ALTER TABLE gri.history_user_modified ADD CONSTRAINT fk_history__history_u_users FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.history_user_modified ADD CONSTRAINT fk_history__history_u_usr_crea FOREIGN KEY (usr_creator_code) REFERENCES usr_creator_list(usr_creator_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.history_users_on_line foreign keys

ALTER TABLE gri.history_users_on_line ADD CONSTRAINT fk_history__add_user__users FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.history_usr_create_groupe foreign keys

ALTER TABLE gri.history_usr_create_groupe ADD CONSTRAINT fk_history__history_u_groupes FOREIGN KEY (grp_code) REFERENCES groupes(grp_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.history_usr_create_groupe ADD CONSTRAINT fk_history__history_u_users FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.history_var_g foreign keys

ALTER TABLE gri.history_var_g ADD CONSTRAINT fk_history__history_v_users FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.history_var_g ADD CONSTRAINT fk_history__history_v_variable FOREIGN KEY (var_g_code) REFERENCES variable_globale(var_g_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.list_user_created foreign keys

ALTER TABLE gri.list_user_created ADD CONSTRAINT fk_list_use_list_user_users FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.list_user_created ADD CONSTRAINT fk_list_use_list_user_usr_crea FOREIGN KEY (usr_creator_code) REFERENCES usr_creator_list(usr_creator_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.message_reactions foreign keys

ALTER TABLE gri.message_reactions ADD CONSTRAINT message_reactions_usr_code_fkey FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE CASCADE;


-- gri.messages foreign keys

ALTER TABLE gri.messages ADD CONSTRAINT fk_messages_sender_users FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.messages ADD CONSTRAINT fk_msg_forwarded_from_user FOREIGN KEY (msg_forwarded_from_user) REFERENCES users(usr_code) ON DELETE SET NULL;
ALTER TABLE gri.messages ADD CONSTRAINT fk_msg_parent FOREIGN KEY (msg_parent_code) REFERENCES messages(msg_code) ON DELETE CASCADE;


-- gri.metiers foreign keys

ALTER TABLE gri.metiers ADD CONSTRAINT fk_metiers_associati_groupes FOREIGN KEY (grp_code) REFERENCES groupes(grp_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.msg_file_joint foreign keys

ALTER TABLE gri.msg_file_joint ADD CONSTRAINT fk_msg_file_add_file__messages FOREIGN KEY (msg_code) REFERENCES messages(msg_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE gri.msg_file_joint ADD CONSTRAINT fk_msg_file_msg_file__users FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.msg_room_groupe foreign keys

ALTER TABLE gri.msg_room_groupe ADD CONSTRAINT fk_msg_room_call_room_users FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.notifications foreign keys

ALTER TABLE gri.notifications ADD CONSTRAINT notifications_notif_actor_code_fkey FOREIGN KEY (notif_actor_code) REFERENCES users(usr_code) ON DELETE SET NULL;
ALTER TABLE gri.notifications ADD CONSTRAINT notifications_user_code_fkey FOREIGN KEY (user_code) REFERENCES users(usr_code) ON DELETE CASCADE;


-- gri.pinned_post foreign keys

ALTER TABLE gri.pinned_post ADD CONSTRAINT fk_pinned_p_add_pinne_post FOREIGN KEY (post_code) REFERENCES post(post_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.post foreign keys

ALTER TABLE gri.post ADD CONSTRAINT fk_post_add_post_users FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.post_file_joint foreign keys

ALTER TABLE gri.post_file_joint ADD CONSTRAINT fk_pfj_post FOREIGN KEY (post_code) REFERENCES post(post_code) ON DELETE CASCADE;
ALTER TABLE gri.post_file_joint ADD CONSTRAINT fk_pfj_user FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE CASCADE;


-- gri.post_history_modif foreign keys

ALTER TABLE gri.post_history_modif ADD CONSTRAINT fk_phm_post FOREIGN KEY (post_code) REFERENCES post(post_code) ON DELETE CASCADE;
ALTER TABLE gri.post_history_modif ADD CONSTRAINT fk_phm_user FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE CASCADE;


-- gri.post_reactions foreign keys

ALTER TABLE gri.post_reactions ADD CONSTRAINT post_reactions_post_code_fkey FOREIGN KEY (post_code) REFERENCES post(post_code) ON DELETE CASCADE;
ALTER TABLE gri.post_reactions ADD CONSTRAINT post_reactions_usr_code_fkey FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE CASCADE;


-- gri.reports foreign keys

ALTER TABLE gri.reports ADD CONSTRAINT reports_usr_code_fkey FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE SET NULL;


-- gri."session" foreign keys

ALTER TABLE gri."session" ADD CONSTRAINT session_usr_code_fkey FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE CASCADE;


-- gri.user_field_visibility foreign keys

ALTER TABLE gri.user_field_visibility ADD CONSTRAINT fk_ufv_user FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE CASCADE;


-- gri.user_settings foreign keys

ALTER TABLE gri.user_settings ADD CONSTRAINT user_settings_usr_code_fkey FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE CASCADE;


-- gri.user_settings_history foreign keys

ALTER TABLE gri.user_settings_history ADD CONSTRAINT user_settings_history_usr_code_fkey FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE CASCADE;
ALTER TABLE gri.user_settings_history ADD CONSTRAINT user_settings_history_usr_s_code_fkey FOREIGN KEY (usr_s_code) REFERENCES user_settings(usr_s_code);


-- gri.users foreign keys

ALTER TABLE gri.users ADD CONSTRAINT fk_users_membre_groupes FOREIGN KEY (grp_code) REFERENCES groupes(grp_code) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- gri.usr_creator_list foreign keys

ALTER TABLE gri.usr_creator_list ADD CONSTRAINT fk_usr_crea_add_user__users FOREIGN KEY (usr_code) REFERENCES users(usr_code) ON DELETE RESTRICT ON UPDATE RESTRICT;
