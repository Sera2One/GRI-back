CREATE OR REPLACE FUNCTION pe.block_direct_modif_groupe_acces()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Modification directe interdite. Utilisez pe.update_groupe_acces().';
END;
$$ LANGUAGE plpgsql;

-- Trigger pour bloquer UPDATE
CREATE TRIGGER trg_block_update_groupe_acces
    BEFORE UPDATE ON pe.groupe_acces
    FOR EACH ROW
    EXECUTE FUNCTION pe.block_direct_modif_groupe_acces();

-- Trigger pour bloquer DELETE (optionnel, mais recommandé)
CREATE TRIGGER trg_block_delete_groupe_acces
    BEFORE DELETE ON pe.groupe_acces
    FOR EACH ROW
    EXECUTE FUNCTION pe.block_direct_modif_groupe_acces();