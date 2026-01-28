

-- =========================================================
-- Trigger 1 : Après INSERT sur pe.groupes → Créer accès pour tous les éléments existants
-- =========================================================
CREATE OR REPLACE FUNCTION pe.create_accesses_for_new_group()
RETURNS TRIGGER AS $$
DECLARE
    r RECORD;
BEGIN
    -- Pour chaque module existant → créer un accès POUR LE NOUVEAU GROUPE (NEW.grp_code)
    FOR r IN SELECT mdl_code AS code FROM pe.modules LOOP
        PERFORM pe.create_access_for_single_group('MODULE', r.code, NEW.grp_code);
    END LOOP;

    FOR r IN SELECT menu_code AS code FROM pe.menu LOOP
        PERFORM pe.create_access_for_single_group('MENU', r.code, NEW.grp_code);
    END LOOP;

    FOR r IN SELECT page_code AS code FROM pe.pages LOOP
        PERFORM pe.create_access_for_single_group('PAGE', r.code, NEW.grp_code);
    END LOOP;

    FOR r IN SELECT cmpn_code AS code FROM pe.components LOOP
        PERFORM pe.create_access_for_single_group('COMPONENT', r.code, NEW.grp_code);
    END LOOP;

    FOR r IN SELECT btn_code AS code FROM pe.buttons LOOP
        PERFORM pe.create_access_for_single_group('BUTTON', r.code, NEW.grp_code);
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



-- =========================================================
-- Trigger 2 : Après INSERT sur chaque table d’élément → Créer accès pour tous les groupes
-- =========================================================

-- MODULE
CREATE OR REPLACE FUNCTION pe.create_accesses_for_new_module()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pe.create_access_for_all_groups('MODULE', NEW.mdl_code);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_accesses_on_new_module
    AFTER INSERT ON pe.modules
    FOR EACH ROW
    EXECUTE FUNCTION pe.create_accesses_for_new_module();

-- MENU
CREATE OR REPLACE FUNCTION pe.create_accesses_for_new_menu()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pe.create_access_for_all_groups('MENU', NEW.menu_code);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_accesses_on_new_menu
    AFTER INSERT ON pe.menu
    FOR EACH ROW
    EXECUTE FUNCTION pe.create_accesses_for_new_menu();

-- COMPONENT
CREATE OR REPLACE FUNCTION pe.create_accesses_for_new_component()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pe.create_access_for_all_groups('COMPONENT', NEW.cmpn_code);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_accesses_on_new_component
    AFTER INSERT ON pe.components
    FOR EACH ROW
    EXECUTE FUNCTION pe.create_accesses_for_new_component();

--- BUTTON
CREATE OR REPLACE FUNCTION pe.create_accesses_for_new_button()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pe.create_access_for_all_groups('BUTTON', NEW.btn_code);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_accesses_on_new_button
    AFTER INSERT ON pe.buttons
    FOR EACH ROW
    EXECUTE FUNCTION pe.create_accesses_for_new_button();