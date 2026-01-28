CREATE OR REPLACE FUNCTION pe.update_groupe_acces(
    p_grp_code VARCHAR(50),
    p_acces_type ACCES_TYPE_VALUE,
    p_acces_code VARCHAR(50),
    p_new_is_active BOOLEAN,
    p_user_code VARCHAR(50),           -- ⚠️ Obligatoire : qui fait l'action ?
    p_comment TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_new_hist_code VARCHAR(50);
    v_current_is_active BOOLEAN;
BEGIN
    -- Vérifier que l'accès existe
    SELECT grp_acces_is_active INTO v_current_is_active
    FROM pe.groupe_acces
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
    v_new_hist_code := 'HGA-' || nextval('pe.grp_acces_id_seq');

    -- Insérer dans l'historique
    INSERT INTO pe.history_groupe_acces (
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
    UPDATE pe.groupe_acces
    SET
        hist_grp_a_code = v_new_hist_code,
        grp_acces_is_active = p_new_is_active,
        grp_acces_updated_at = NOW()
    WHERE grp_code = p_grp_code
      AND acces_type = p_acces_type
      AND acces_code = p_acces_code;

END;
$$ LANGUAGE plpgsql;