CREATE OR REPLACE FUNCTION pe.delete_accesses_for_group()
RETURNS TRIGGER AS $$
BEGIN
    -- Supprimer d'abord dans groupe_acces (à cause de la FK)
    DELETE FROM pe.groupe_acces
    WHERE grp_code = OLD.grp_code;

    -- Puis dans history_groupe_acces
    DELETE FROM pe.history_groupe_acces
    WHERE grp_code = OLD.grp_code;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_delete_accesses_on_group_delete
    BEFORE DELETE ON pe.groupes
    FOR EACH ROW
    EXECUTE FUNCTION pe.delete_accesses_for_group();