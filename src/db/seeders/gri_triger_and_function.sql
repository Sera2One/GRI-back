/*==============================================================*/
/* Nom de SGBD :  PostgreSQL 8                                  */
/* DATE de cr�ation :  25/03/2024 09:45:26                      */
/*==============================================================*/

-- DROP FUNCTION gri.create_access_for_all_groups(gri."acces_type_value", varchar);

CREATE OR REPLACE FUNCTION gri.create_access_for_all_groups(p_entity_type acces_type_value, p_entity_code character varying)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_grp RECORD;
    v_hist_code VARCHAR(50);
BEGIN
    -- Parcourir tous les groupes
    FOR v_grp IN SELECT grp_code FROM gri.groupes LOOP

        -- Générer un code historique unique (tu peux adapter la logique)
        v_hist_code := 'HGA-' || nextval('gri.grp_acces_id_seq');

        -- Insérer dans l'historique
        INSERT INTO gri.history_groupe_acces (
            hist_grp_a_code,
            hist_grp_a_action,
            grp_code,
            acces_type,
            acces_code,
            is_active
        ) VALUES (
            v_hist_code,
            'CREATED',
            v_grp.grp_code,
            p_entity_type,
            p_entity_code,
            FALSE  -- inactif par défaut
        );

        -- Insérer dans groupe_acces
        INSERT INTO gri.groupe_acces (
            grp_acces_code,
            grp_code,
            acces_type,
            acces_code,
            hist_grp_a_code,
            grp_acces_is_active
        ) VALUES (
            'grp-acces-' || nextval('gri.grp_acces_id_seq'),
            v_grp.grp_code,
            p_entity_type,
            p_entity_code,
            v_hist_code,
            FALSE
        );

    END LOOP;
END;
$function$
;

-- DROP FUNCTION gri.create_access_for_single_group(gri."acces_type_value", varchar, varchar);

CREATE OR REPLACE FUNCTION gri.create_access_for_single_group(p_entity_type acces_type_value, p_entity_code character varying, p_grp_code character varying)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_hist_code VARCHAR(50);
BEGIN
    -- Générer un code historique
    v_hist_code := 'HGA-' || nextval('gri.grp_acces_id_seq');

    -- Insérer dans l'historique
    INSERT INTO gri.history_groupe_acces (
        hist_grp_a_code,
        hist_grp_a_action,
        grp_code,
        acces_type,
        acces_code,
        is_active
    ) VALUES (
        v_hist_code,
        'CREATED',
        p_grp_code,
        p_entity_type,
        p_entity_code,
        FALSE
    );

    -- Insérer dans groupe_acces
    INSERT INTO gri.groupe_acces (
        grp_acces_code,
        grp_code,
        acces_type,
        acces_code,
        hist_grp_a_code,
        grp_acces_is_active
    ) VALUES (
        'grp-acces-' || nextval('gri.grp_acces_id_seq'),
        p_grp_code,
        p_entity_type,
        p_entity_code,
        v_hist_code,
        FALSE
    );
END;
$function$
;

-- DROP FUNCTION gri.create_accesses_for_new_button();

CREATE OR REPLACE FUNCTION gri.create_accesses_for_new_button()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM gri.create_access_for_all_groups('BUTTON', NEW.btn_code);
    RETURN NEW;
END;
$function$
;

-- DROP FUNCTION gri.create_accesses_for_new_component();

CREATE OR REPLACE FUNCTION gri.create_accesses_for_new_component()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM gri.create_access_for_all_groups('COMPONENT', NEW.cmpn_code);
    RETURN NEW;
END;
$function$
;

-- DROP FUNCTION gri.create_accesses_for_new_group();

CREATE OR REPLACE FUNCTION gri.create_accesses_for_new_group()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    r RECORD;
BEGIN
    -- Pour chaque module existant → créer un accès POUR LE NOUVEAU GROUPE (NEW.grp_code)
    FOR r IN SELECT mdl_code AS code FROM gri.modules LOOP
        PERFORM gri.create_access_for_single_group('MODULE', r.code, NEW.grp_code);
    END LOOP;

    FOR r IN SELECT menu_code AS code FROM gri.menu LOOP
        PERFORM gri.create_access_for_single_group('MENU', r.code, NEW.grp_code);
    END LOOP;

    FOR r IN SELECT page_code AS code FROM gri.pages LOOP
        PERFORM gri.create_access_for_single_group('PAGE', r.code, NEW.grp_code);
    END LOOP;

    FOR r IN SELECT cmpn_code AS code FROM gri.components LOOP
        PERFORM gri.create_access_for_single_group('COMPONENT', r.code, NEW.grp_code);
    END LOOP;

    FOR r IN SELECT btn_code AS code FROM gri.buttons LOOP
        PERFORM gri.create_access_for_single_group('BUTTON', r.code, NEW.grp_code);
    END LOOP;

    RETURN NEW;
END;
$function$
;

-- DROP FUNCTION gri.create_accesses_for_new_menu();

CREATE OR REPLACE FUNCTION gri.create_accesses_for_new_menu()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM gri.create_access_for_all_groups('MENU', NEW.menu_code);
    RETURN NEW;
END;
$function$
;

-- DROP FUNCTION gri.create_accesses_for_new_module();

CREATE OR REPLACE FUNCTION gri.create_accesses_for_new_module()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM gri.create_access_for_all_groups('MODULE', NEW.mdl_code);
    RETURN NEW;
END;
$function$
;

-- DROP FUNCTION gri.delete_accesses_for_button();

CREATE OR REPLACE FUNCTION gri.delete_accesses_for_button()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    DELETE FROM gri.groupe_acces
    WHERE acces_type = 'BUTTON' AND acces_code = OLD.btn_code;

    DELETE FROM gri.history_groupe_acces
    WHERE acces_type = 'BUTTON' AND acces_code = OLD.btn_code;

    RETURN OLD;
END;
$function$
;

-- DROP FUNCTION gri.delete_accesses_for_component();

CREATE OR REPLACE FUNCTION gri.delete_accesses_for_component()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    DELETE FROM gri.groupe_acces
    WHERE acces_type = 'COMPONENT' AND acces_code = OLD.cmpn_code;

    DELETE FROM gri.history_groupe_acces
    WHERE acces_type = 'COMPONENT' AND acces_code = OLD.cmpn_code;

    RETURN OLD;
END;
$function$
;

-- DROP FUNCTION gri.delete_accesses_for_group();

CREATE OR REPLACE FUNCTION gri.delete_accesses_for_group()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Supprimer d'abord dans groupe_acces (à cause de la FK)
    DELETE FROM gri.groupe_acces
    WHERE grp_code = OLD.grp_code;

    -- Puis dans history_groupe_acces
    DELETE FROM gri.history_groupe_acces
    WHERE grp_code = OLD.grp_code;

    RETURN OLD;
END;
$function$
;

-- DROP FUNCTION gri.delete_accesses_for_menu();

CREATE OR REPLACE FUNCTION gri.delete_accesses_for_menu()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    DELETE FROM gri.groupe_acces
    WHERE acces_type = 'MENU' AND acces_code = OLD.menu_code;

    DELETE FROM gri.history_groupe_acces
    WHERE acces_type = 'MENU' AND acces_code = OLD.menu_code;

    RETURN OLD;
END;
$function$
;

-- DROP FUNCTION gri.delete_accesses_for_module();

CREATE OR REPLACE FUNCTION gri.delete_accesses_for_module()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    DELETE FROM gri.groupe_acces
    WHERE acces_type = 'MODULE' AND acces_code = OLD.mdl_code;

    DELETE FROM gri.history_groupe_acces
    WHERE acces_type = 'MODULE' AND acces_code = OLD.mdl_code;

    RETURN OLD;
END;
$function$
;

-- DROP FUNCTION gri.delete_accesses_for_page();

CREATE OR REPLACE FUNCTION gri.delete_accesses_for_page()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    DELETE FROM gri.groupe_acces
    WHERE acces_type = 'PAGE' AND acces_code = OLD.page_code;

    DELETE FROM gri.history_groupe_acces
    WHERE acces_type = 'PAGE' AND acces_code = OLD.page_code;

    RETURN OLD;
END;
$function$
;

-- DROP FUNCTION gri.get_user_visible_data(varchar, varchar);

CREATE OR REPLACE FUNCTION gri.get_user_visible_data(target_user_code character varying, viewer_relationship character varying)
 RETURNS TABLE(user_code character varying, user_name character varying, user_firstname character varying, user_img character varying, user_nick_name character varying, user_gender character varying, user_bio text, user_work character varying, user_language character varying, user_email character varying, user_contact character varying, user_address character varying, user_created_date timestamp without time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        u.usr_code,
        u.usr_name,
        u.usr_firstname,
        u.usr_img,
        CASE WHEN viewer_relationship = 'self' THEN u.usr_nick_name
             WHEN COALESCE(ufv_nick_name.ufv_visibility, u.usr_default_visibility) IN ('public','friends')
                  AND viewer_relationship IN ('friend','self') THEN u.usr_nick_name
             ELSE NULL END,
        CASE WHEN viewer_relationship = 'self' THEN u.usr_gender
             WHEN COALESCE(ufv_gender.ufv_visibility,   u.usr_default_visibility) IN ('public','friends')
                  AND viewer_relationship IN ('friend','self') THEN u.usr_gender
             ELSE NULL END,
        CASE WHEN viewer_relationship = 'self' THEN u.usr_bio
             WHEN COALESCE(ufv_bio.ufv_visibility,      u.usr_default_visibility) IN ('public','friends')
                  AND viewer_relationship IN ('friend','self') THEN u.usr_bio
             ELSE NULL END,
        CASE WHEN viewer_relationship = 'self' THEN u.usr_work
             WHEN COALESCE(ufv_work.ufv_visibility,     u.usr_default_visibility) IN ('public','friends')
                  AND viewer_relationship IN ('friend','self') THEN u.usr_work
             ELSE NULL END,
        CASE WHEN viewer_relationship = 'self' THEN u.usr_language
             WHEN COALESCE(ufv_language.ufv_visibility, u.usr_default_visibility) IN ('public','friends')
                  AND viewer_relationship IN ('friend','self') THEN u.usr_language
             ELSE NULL END,
        CASE WHEN viewer_relationship = 'self' THEN u.usr_mail
             WHEN COALESCE(ufv_email.ufv_visibility,    u.usr_default_visibility) IN ('public','friends')
                  AND viewer_relationship IN ('friend','self') THEN u.usr_mail
             ELSE NULL END,
        CASE WHEN viewer_relationship = 'self' THEN u.usr_contact
             WHEN COALESCE(ufv_contact.ufv_visibility,  u.usr_default_visibility) IN ('public','friends')
                  AND viewer_relationship IN ('friend','self') THEN u.usr_contact
             ELSE NULL END,
        CASE WHEN viewer_relationship = 'self' THEN u.usr_addresse
             WHEN COALESCE(ufv_address.ufv_visibility,  u.usr_default_visibility) IN ('public','friends')
                  AND viewer_relationship IN ('friend','self') THEN u.usr_addresse
             ELSE NULL END,
        u.usr_created_date          -- <-- placé en dernière position
    FROM gri.users u
    LEFT JOIN gri.user_field_visibility ufv_email    ON ufv_email.usr_code   = u.usr_code AND ufv_email.ufv_field_name   = 'usr_mail'
    LEFT JOIN gri.user_field_visibility ufv_contact  ON ufv_contact.usr_code = u.usr_code AND ufv_contact.ufv_field_name = 'usr_contact'
    LEFT JOIN gri.user_field_visibility ufv_address  ON ufv_address.usr_code = u.usr_code AND ufv_address.ufv_field_name = 'usr_addresse'
    LEFT JOIN gri.user_field_visibility ufv_nick_name ON ufv_nick_name.usr_code = u.usr_code AND ufv_nick_name.ufv_field_name = 'usr_nick_name'
    LEFT JOIN gri.user_field_visibility ufv_gender   ON ufv_gender.usr_code  = u.usr_code AND ufv_gender.ufv_field_name  = 'usr_gender'
    LEFT JOIN gri.user_field_visibility ufv_bio      ON ufv_bio.usr_code     = u.usr_code AND ufv_bio.ufv_field_name     = 'usr_bio'
    LEFT JOIN gri.user_field_visibility ufv_work     ON ufv_work.usr_code    = u.usr_code AND ufv_work.ufv_field_name    = 'usr_work'
    LEFT JOIN gri.user_field_visibility ufv_language ON ufv_language.usr_code= u.usr_code AND ufv_language.ufv_field_name= 'usr_language'
    WHERE u.usr_code = target_user_code;
END;
$function$
;

-- DROP FUNCTION gri.purge_expired_notifications();

CREATE OR REPLACE FUNCTION gri.purge_expired_notifications()
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
DECLARE
  deleted_cnt bigint;
BEGIN
  DELETE FROM notifications
  WHERE notif_actor_is_read = true
    AND notif_expires_at IS NOT NULL
    AND notif_expires_at < now();
  GET DIAGNOSTICS deleted_cnt = ROW_COUNT;
  RETURN deleted_cnt;
END;
$function$
;

-- DROP FUNCTION gri.trg_set_notif_expires();

CREATE OR REPLACE FUNCTION gri.trg_set_notif_expires()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_ttl_hours smallint;
BEGIN
  IF NEW.notif_expires_at IS NULL THEN
    SELECT default_ttl_hours INTO v_ttl_hours
    FROM notification_types
    WHERE notif_type = NEW.notif_type;

    IF v_ttl_hours IS NOT NULL THEN
      NEW.notif_expires_at := NEW.notif_actor_created_date + interval '1 hour' * v_ttl_hours;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$
;

-- DROP FUNCTION gri.update_groupe_acces(varchar, gri."acces_type_value", varchar, bool, varchar, text);

CREATE OR REPLACE FUNCTION gri.update_groupe_acces(p_grp_code character varying, p_acces_type acces_type_value, p_acces_code character varying, p_new_is_active boolean, p_user_code character varying, p_comment text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_new_hist_code VARCHAR(50);
    v_current_is_active BOOLEAN;
BEGIN
    -- Vérifier que l'accès existe
    SELECT grp_acces_is_active INTO v_current_is_active
    FROM gri.groupe_acces
    WHERE grp_code = p_grp_code
      AND acces_type = p_acces_type
      AND acces_code = p_acces_code;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Accès introuvable pour le groupe %, type %, code %', p_grp_code, p_acces_type, p_acces_code;
    END IF;

    -- Ne rien faire si la valeur n'a pas changé
    IF v_current_is_active = p_new_is_active THEN
        RETURN;
    END IF;

    -- Générer un nouveau code historique
    v_new_hist_code := 'HGA-' || nextval('gri.grp_acces_id_seq');

    -- Insérer dans l'historique
    INSERT INTO gri.history_groupe_acces (
        hist_grp_a_code,
        hist_grp_a_action,
        hist_grp_a_user,
        hist_grp_a_comment,
        grp_code,
        acces_type,
        acces_code,
        is_active
    ) VALUES (
        v_new_hist_code,
        CASE WHEN p_new_is_active THEN 'ACTIVATED' ELSE 'DEACTIVATED' END,
        p_user_code,
        p_comment,
        p_grp_code,
        p_acces_type,
        p_acces_code,
        p_new_is_active
    );

    -- Mettre à jour l'accès actuel
    UPDATE gri.groupe_acces
    SET
        hist_grp_a_code = v_new_hist_code,
        grp_acces_is_active = p_new_is_active,
        grp_acces_updated_at = NOW()
    WHERE grp_code = p_grp_code
      AND acces_type = p_acces_type
      AND acces_code = p_acces_code;

END;
$function$
;

-- DROP FUNCTION gri.update_session_last_active();

CREATE OR REPLACE FUNCTION gri.update_session_last_active()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
   NEW.session_last_active = NOW();
   RETURN NEW;
END;
$function$
;

-- DROP FUNCTION gri.update_updated_at_column();

CREATE OR REPLACE FUNCTION gri.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
   NEW.USR_S_UPDATED_AT = NOW();
   RETURN NEW;
END;
$function$
;