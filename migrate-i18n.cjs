const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');
const localesDir = path.join(srcDir, 'locales');

// Define mappings
const mappings = {
    // HOME
    // tabs
    "home.tab_text": "home.tabs.text.full",
    "home.tab_text_short": "home.tabs.text.short",
    "home.tab_code": "home.tabs.code.full",
    "home.tab_code_short": "home.tabs.code.short",
    "home.tab_docs": "home.tabs.docs.full",
    "home.tab_docs_short": "home.tabs.docs.short",
    "home.tab_draw": "home.tabs.draw.full",
    "home.tab_draw_short": "home.tabs.draw.short",
    "home.tab_link": "home.tabs.link.full",
    "home.tab_link_short": "home.tabs.link.short",
    "home.tab_file": "home.tabs.file.full",
    "home.tab_file_short": "home.tabs.file.short",
    "home.tab_video": "home.tabs.video.full",
    "home.tab_video_short": "home.tabs.video.short",
    
    // actions
    "home.paste_button": "home.actions.paste",
    "home.shorten_button": "home.actions.shorten",
    "home.upload_button": "home.actions.upload",
    "home.collaborative_session_btn": "home.actions.start_collaboration",
    
    // inputs
    "home.enter_snippet_placeholder": "home.inputs.snippet_placeholder",
    "home.link_placeholder": "home.inputs.link_placeholder",
    "home.link_desc": "home.inputs.link_description",
    
    // file_upload
    "home.file_drop": "home.file_upload.drop_prompt",
    "home.file_max_size": "home.file_upload.max_size",
    "home.file_uploading": "home.file_upload.uploading",
    "home.file_selected": "home.file_upload.selected",
    "home.file_ready": "home.file_upload.ready",
    "home.add_files": "home.file_upload.add_files",
    "home.files_selected": "home.file_upload.files_selected",
    "home.files_selected_via_paste": "home.file_upload.files_selected_via_paste",
    
    // id_generation
    "home.paste_dynamic_id": "home.id_generation.custom",
    "home.paste_system_id": "home.id_generation.automatic",
    "home.paste_system_id_desc": "home.id_generation.automatic_desc",
    "home.suggest_id_ai": "home.id_generation.suggest_ai",
    "home.ai_id_suggested": "home.id_generation.ai_suggested",
    "home.semantic_id_tab": "home.id_generation.semantic_tab",
    "home.semantic_id_placeholder": "home.id_generation.semantic_placeholder",
    "home.semantic_id_generate": "home.id_generation.semantic_generate",
    "home.semantic_id_words": "home.id_generation.semantic_words",
    "home.custom_id_required": "home.id_generation.custom_id_required",
    
    // misc
    "home.advanced_config": "home.misc.advanced_config",
    "home.identification_type": "home.misc.identification_type",
    "home.auto_detecting": "home.misc.auto_detecting",
    "home.detected_language": "home.misc.detected_language",
    "home.collaborative_session": "home.misc.collaborative_session",
    "home.alias": "home.misc.alias",
    "home.create_another": "home.misc.create_another",
    "home.link_shortened": "home.misc.link_shortened",
    "home.link_ready_desc": "home.misc.link_ready_desc",

    // COMMON
    // actions
    "common.save": "common.actions.save",
    "common.cancel": "common.actions.cancel",
    "common.edit": "common.actions.edit",
    "common.download": "common.actions.download",
    "common.undo": "common.actions.undo",
    "common.show": "common.actions.show",
    "common.hide": "common.actions.hide",
    "common.close": "common.actions.close",
    "common.refresh": "common.actions.refresh",
    "common.expand_editor": "common.actions.expand_editor",
    "common.shrink_editor": "common.actions.shrink_editor",
    "common.download_qr": "common.actions.download_qr",
    "common.save_as": "common.actions.save_as",
    "common.add_label": "common.actions.add_label",
    "common.clear_all": "common.actions.clear_all",
    "common.set": "common.actions.set",
    "common.open": "common.actions.open",
    "common.add": "common.actions.add",
    "common.remove": "common.actions.remove",
    
    // states
    "common.loading": "common.states.loading",
    "common.submitting": "common.states.submitting",
    "common.saving": "common.states.saving",
    "common.encrypting": "common.states.encrypting",
    "common.decrypting": "common.states.decrypting",
    "common.unlocking": "common.states.unlocking",
    "common.redirecting_now": "common.states.redirecting_now",
    "common.saved": "common.states.saved",
    "common.save_failed": "common.states.save_failed",
    
    // auth & access
    "common.password": "common.auth.password",
    "common.password_placeholder": "common.auth.password_placeholder",
    "common.auth_required": "common.auth.auth_required",
    "common.auth_required_desc": "common.auth.auth_required_desc",
    "common.password_protected": "common.auth.password_protected",
    "common.enter_password_desc": "common.auth.enter_password_desc",
    "common.unlock": "common.auth.unlock",
    
    "common.visibility": "common.access.visibility",
    "common.public": "common.access.public",
    "common.private": "common.access.private",
    "common.shared": "common.access.shared",
    "common.access_control": "common.access.control",
    "common.people_with_access": "common.access.people_with_access",
    "common.add_people_placeholder": "common.access.add_people_placeholder",
    "common.role": "common.access.role",
    "common.viewer": "common.access.viewer",
    "common.editor": "common.access.editor",
    "common.admin": "common.access.admin",
    "common.general_access": "common.access.general",
    "common.anyone_with_link": "common.access.anyone_with_link",
    "common.restricted": "common.access.restricted",
    "common.commenter": "common.access.commenter",
    
    // discussion
    "common.open_discussion": "common.discussion.open",
    "common.discussion": "common.discussion.title",
    "common.discussion_title": "common.discussion.subtitle",
    "common.discussion_desc": "common.discussion.desc",
    "common.no_comments": "common.discussion.no_comments",
    "common.your_name": "common.discussion.your_name",
    "common.anonymus": "common.discussion.anonymous",
    "common.write_comment": "common.discussion.write_comment",
    "common.post_comment": "common.discussion.post_comment",
    "common.comment_restricted": "common.discussion.comment_restricted",
    
    // redirect
    "common.redirect_ready": "common.redirect.ready",
    "common.redirect_desc": "common.redirect.desc",
    "common.visit_link": "common.redirect.visit_link",
    "common.redirection_mode": "common.redirect.mode",
    "common.redirection_click": "common.redirect.click",
    "common.redirection_click_desc": "common.redirect.click_desc",
    "common.redirection_timer": "common.redirect.timer",
    "common.redirection_timer_desc": "common.redirect.timer_desc",
    "common.redirection_direct": "common.redirect.direct",
    "common.redirection_direct_desc": "common.redirect.direct_desc",
    "common.admin_preview_banner": "common.redirect.admin_preview_banner",
    "common.skip_countdown": "common.redirect.skip_countdown",

    // MESSAGES
    // success
    "messages.snippet_created": "messages.success.snippet_created",
    "messages.snippet_deleted": "messages.success.snippet_deleted",
    "messages.snippet_deleted_id": "messages.success.snippet_deleted_id",
    "messages.comment_added": "messages.success.comment_added",
    "messages.qr_downloaded": "messages.success.qr_downloaded",
    "messages.collaborators_added": "messages.success.collaborators_added",
    "messages.collaborator_removed": "messages.success.collaborator_removed",
    "messages.collaborator_updated": "messages.success.collaborator_updated",
    
    // error
    "messages.snippet_failed": "messages.error.snippet_failed",
    "messages.id_conflict": "messages.error.id_conflict",
    "messages.delete_failed": "messages.error.delete_failed",
    "messages.update_failed": "messages.error.update_failed",
    "messages.password_required": "messages.error.password_required",
    "messages.password_incorrect": "messages.error.password_incorrect",
    "messages.comment_failed": "messages.error.comment_failed",
    "messages.collaborators_failed": "messages.error.collaborators_failed",
    "messages.collaborator_remove_failed": "messages.error.collaborator_remove_failed",
    "messages.collaborator_update_failed": "messages.error.collaborator_update_failed",

    // validation
    "messages.empty_content": "messages.validation.empty_content",
    "messages.empty_file": "messages.validation.empty_file",
    "messages.content_required": "messages.validation.content_required",
    
    // confirm
    "messages.delete_confirm": "messages.confirm.delete",

    // DISPLAY
    "display.status_editing": "display.status.editing",
    "display.status_viewing": "display.status.viewing",
    "display.status_recording": "display.status.recording",
    "display.edit_button": "display.actions.edit",
    "display.copy_button": "display.actions.copy",
    "display.delete_button": "display.actions.delete",
    "display.save_button": "display.actions.save",
    "display.snippet_saved": "display.status.snippet_saved",
    "display.snippet_unsaved": "display.status.snippet_unsaved",
    "display.save_failed": "display.status.save_failed"
};

function getNested(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function setNested(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
}

function deleteNested(obj, path) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) return;
        current = current[parts[i]];
    }
    delete current[parts[parts.length - 1]];
}

// 1. Process JSON files
const jsonFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

for (const file of jsonFiles) {
    const filePath = path.join(localesDir, file);
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    for (const [oldKey, newKey] of Object.entries(mappings)) {
        const val = getNested(data, oldKey);
        if (val !== undefined) {
            setNested(data, newKey, val);
            deleteNested(data, oldKey);
        }
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, '\t') + '\n', 'utf8');
}
console.log('Processed JSON files.');

// 2. Process TSX/TS files
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) { 
            results.push(file);
        }
    });
    return results;
}

const tsFiles = walk(srcDir);

for (const file of tsFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    for (const [oldKey, newKey] of Object.entries(mappings)) {
        const searchStr1 = `"${oldKey}"`;
        const replaceStr1 = `"${newKey}"`;
        const searchStr2 = `'${oldKey}'`;
        const replaceStr2 = `'${newKey}'`;
        
        if (content.includes(searchStr1) || content.includes(searchStr2)) {
            content = content.split(searchStr1).join(replaceStr1);
            content = content.split(searchStr2).join(replaceStr2);
            changed = true;
        }
    }
    
    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
    }
}
console.log('Processed TS/TSX files.');
