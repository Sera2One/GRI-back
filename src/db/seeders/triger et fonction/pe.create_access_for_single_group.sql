CREATE OR REPLACE FUNCTION pe.create_access_for_single_group(
    p_entity_type ACCES_TYPE_VALUE,
    p_entity_code VARCHAR(50),
    p_grp_code VARCHAR(50)
)
RETURNS VOID AS $$
DECLARE
    v_hist_code VARCHAR(50);
BEGIN
    -- Générer un code historique
    v_hist_code := 'HGA-' || nextval('pe.grp_acces_id_seq');

    -- Insérer dans l'historique
    INSERT INTO pe.history_groupe_acces (
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
    INSERT INTO pe.groupe_acces (
        grp_acces_code,
        grp_code,
        acces_type,
        acces_code,
        hist_grp_a_code,
        grp_acces_is_active
    ) VALUES (
        'grp-acces-' || nextval('pe.grp_acces_id_seq'),
        p_grp_code,
        p_entity_type,
        p_entity_code,
        v_hist_code,
        FALSE
    );
END;
$$ LANGUAGE plpgsql;