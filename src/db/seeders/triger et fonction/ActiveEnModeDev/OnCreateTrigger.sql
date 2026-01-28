/*==============================================================*/
/* Table : MODULE                                              */
/*==============================================================*/
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

/*==============================================================*/
/* Table : MENU                                              */
/*==============================================================*/
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




/*==============================================================*/
/* Table : PAGE                                              */
/*==============================================================*/
CREATE OR REPLACE FUNCTION pe.create_accesses_for_new_page()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pe.create_access_for_all_groups('PAGE', NEW.page_code);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_accesses_on_new_page
    AFTER INSERT ON pe.pages
    FOR EACH ROW
    EXECUTE FUNCTION pe.create_accesses_for_new_page();


/*==============================================================*/
/* Table : COMPENENT                                              */
/*==============================================================*/
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


/*==============================================================*/
/* Table : BUTTON                                              */
/*==============================================================*/
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