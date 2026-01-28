-- Désactiver la suppression en cascade des accès
ALTER TABLE pe.groupes DISABLE TRIGGER trg_delete_accesses_on_group_delete;
ALTER TABLE pe.modules DISABLE TRIGGER trg_delete_accesses_on_module_delete;
ALTER TABLE pe.menu DISABLE TRIGGER trg_delete_accesses_on_menu_delete;
ALTER TABLE pe.pages DISABLE TRIGGER trg_delete_accesses_on_page_delete;
ALTER TABLE pe.components DISABLE TRIGGER trg_delete_accesses_on_component_delete;
ALTER TABLE pe.buttons DISABLE TRIGGER trg_delete_accesses_on_button_delete;