CREATE OR REPLACE FUNCTION pe.update_all_groupe_acces(
    p_grp_code VARCHAR(50),
    p_new_is_active BOOLEAN,
    p_user_code VARCHAR(50),
    p_comment TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT acces_type, acces_code, grp_acces_is_active
        FROM pe.groupe_acces
        WHERE grp_code = p_grp_code
    LOOP
        IF r.grp_acces_is_active != p_new_is_active THEN
            PERFORM pe.update_groupe_acces(
                p_grp_code,
                r.acces_type,
                r.acces_code,
                p_new_is_active,
                p_user_code,
                p_comment
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Désactiver TOUT pour le groupe 'GRP_STAGE'
--SELECT pe.update_all_groupe_acces('GRP_STAGE', FALSE, 'USR_ADMIN', 'Fin de stage');