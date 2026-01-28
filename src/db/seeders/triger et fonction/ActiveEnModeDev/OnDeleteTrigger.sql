/*==============================================================*/
/* Table : MODULE                                              */
/*==============================================================*/
CREATE OR REPLACE FUNCTION pe.delete_accesses_for_module()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM pe.groupe_acces
    WHERE acces_type = 'MODULE' AND acces_code = OLD.mdl_code;

    DELETE FROM pe.history_groupe_acces
    WHERE acces_type = 'MODULE' AND acces_code = OLD.mdl_code;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_delete_accesses_on_module_delete
    BEFORE DELETE ON pe.modules
    FOR EACH ROW
    EXECUTE FUNCTION pe.delete_accesses_for_module();



/*==============================================================*/
/* Table : MENU                                              */
/*==============================================================*/
CREATE OR REPLACE FUNCTION pe.delete_accesses_for_menu()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM pe.groupe_acces
    WHERE acces_type = 'MENU' AND acces_code = OLD.menu_code;

    DELETE FROM pe.history_groupe_acces
    WHERE acces_type = 'MENU' AND acces_code = OLD.menu_code;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_delete_accesses_on_menu_delete
    BEFORE DELETE ON pe.menu
    FOR EACH ROW
    EXECUTE FUNCTION pe.delete_accesses_for_menu();


/*==============================================================*/
/* Table : PAGE                                              */
/*==============================================================*/
CREATE OR REPLACE FUNCTION pe.delete_accesses_for_page()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM pe.groupe_acces
    WHERE acces_type = 'PAGE' AND acces_code = OLD.page_code;

    DELETE FROM pe.history_groupe_acces
    WHERE acces_type = 'PAGE' AND acces_code = OLD.page_code;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_delete_accesses_on_page_delete
    BEFORE DELETE ON pe.pages
    FOR EACH ROW
    EXECUTE FUNCTION pe.delete_accesses_for_page();


/*==============================================================*/
/* Table : COMPONENT                                              */
/*==============================================================*/
CREATE OR REPLACE FUNCTION pe.delete_accesses_for_component()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM pe.groupe_acces
    WHERE acces_type = 'COMPONENT' AND acces_code = OLD.cmpn_code;

    DELETE FROM pe.history_groupe_acces
    WHERE acces_type = 'COMPONENT' AND acces_code = OLD.cmpn_code;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_delete_accesses_on_component_delete
    BEFORE DELETE ON pe.components
    FOR EACH ROW
    EXECUTE FUNCTION pe.delete_accesses_for_component();


/*==============================================================*/
/* Table : BUTTON                                              */
/*==============================================================*/
CREATE OR REPLACE FUNCTION pe.delete_accesses_for_button()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM pe.groupe_acces
    WHERE acces_type = 'BUTTON' AND acces_code = OLD.btn_code;

    DELETE FROM pe.history_groupe_acces
    WHERE acces_type = 'BUTTON' AND acces_code = OLD.btn_code;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_delete_accesses_on_button_delete
    BEFORE DELETE ON pe.buttons
    FOR EACH ROW
    EXECUTE FUNCTION pe.delete_accesses_for_button();



