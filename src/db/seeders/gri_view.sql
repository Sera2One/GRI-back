/*==============================================================*/
/* Nom de SGBD :  PostgreSQL 8                                  */
/* DATE de cr�ation :  25/03/2024 09:45:26                      */
/*==============================================================*/

-- gri.groupe_acces_view source

CREATE OR REPLACE VIEW groupe_acces_view
AS SELECT g.grp_code,
    g.grp_name,
    g.grp_description,
    ga.acces_type AS entity_type,
    ga.acces_code AS entity_code,
    COALESCE(m.mdl_name, mn.menu_name, p.page_name, c.cmpn_name, b.btn_name) AS entity_name,
    COALESCE(m.mdl_description, mn.menu_description, p.page_description, c.cmpn_description, b.btn_description) AS entity_description,
    b.btn_modif,
    ga.grp_acces_is_active AS is_active,
    ga.grp_acces_extra_value AS extra_value,
    ga.grp_acces_created_at,
    ga.grp_acces_updated_at,
    ga.hist_grp_a_code,
        CASE
            WHEN ga.acces_type = 'MODULE'::acces_type_value THEN ga.acces_code
            WHEN ga.acces_type = 'MENU'::acces_type_value THEN mn.mdl_code
            WHEN ga.acces_type = 'PAGE'::acces_type_value THEN p.mdl_code
            WHEN ga.acces_type = 'COMPONENT'::acces_type_value THEN c.mdl_code
            WHEN ga.acces_type = 'BUTTON'::acces_type_value THEN b.mdl_code
            ELSE NULL::character varying
        END AS module_source
   FROM groupe_acces ga
     JOIN groupes g ON ga.grp_code::text = g.grp_code::text
     LEFT JOIN modules m ON ga.acces_type = 'MODULE'::acces_type_value AND ga.acces_code::text = m.mdl_code::text
     LEFT JOIN menu mn ON ga.acces_type = 'MENU'::acces_type_value AND ga.acces_code::text = mn.menu_code::text
     LEFT JOIN pages p ON ga.acces_type = 'PAGE'::acces_type_value AND ga.acces_code::text = p.page_code::text
     LEFT JOIN components c ON ga.acces_type = 'COMPONENT'::acces_type_value AND ga.acces_code::text = c.cmpn_code::text
     LEFT JOIN buttons b ON ga.acces_type = 'BUTTON'::acces_type_value AND ga.acces_code::text = b.btn_code::text;


-- gri.message_views source

CREATE OR REPLACE VIEW message_views
AS SELECT d.msg_code,
    d.usr_code AS dest_usr_code,
    d.dest_sender_code,
    d.dest_is_readed,
    d.dest_is_deleted,
    d.dest_created_date,
    d.dest_modif_date,
    m.usr_code AS msg_usr_code,
    m.msg_contenu,
    m.msg_created_date,
    m.msg_modif_date,
    sender.usr_code AS sender_usr_code,
    sender.usr_name AS sender_usr_name,
    sender.usr_firstname AS sender_usr_firstname,
    sender.usr_mail AS sender_usr_mail,
    sender.usr_img AS sender_usr_img,
    receiver.usr_code AS receiver_usr_code,
    receiver.usr_name AS receiver_usr_name,
    receiver.usr_firstname AS receiver_usr_firstname,
    receiver.usr_mail AS receiver_usr_mail,
    receiver.usr_img AS receiver_usr_img,
    fj.msg_file_code,
    fj.msg_file_path,
    fj.msg_file_size,
    fj.msg_file_type,
    fj.msg_file_extension,
    fj.msg_file_client_file_name,
    fj.msg_file_is_deleted,
    fj.msg_file_created_date
   FROM destination d
     JOIN messages m ON d.msg_code::text = m.msg_code::text
     LEFT JOIN users sender ON d.dest_sender_code::text = sender.usr_code::text
     LEFT JOIN users receiver ON d.usr_code::text = receiver.usr_code::text
     LEFT JOIN msg_file_joint fj ON m.msg_code::text = fj.msg_code::text;
