// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;
mod filesystem;
mod integrations;

use commands::*;

fn main() {
    env_logger::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            // Initialize database schema and local folders
            database::init_db(app)?;
            filesystem::init_directories(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Customer commands
            customer_list,
            customer_get,
            customer_create,
            customer_update,
            customer_archive,
            
            // Document commands
            document_list,
            document_upload,
            document_archive,
            
            // Requirement commands
            requirement_list,
            requirement_create,
            requirement_bulk_create,
            requirement_update_status,
            
            // Task commands
            task_list,
            task_create,
            task_update,
            task_delete,
            
            // Deadline commands
            deadline_list,
            deadline_generate_recurring,
            
            // GST & Accounting
            gst_summary_get,
            gst_transactions_list,
            accounting_sync,
            accounting_ledgers_list,
            
            // File & OCR
            ocr_process_file,
            pdf_split_merge,
            excel_import_parse,
            excel_export_generate,
            
            // System & Backup
            system_get_info,
            backup_create,
            backup_restore
        ])
        .run(tauri::generate_context!())
        .expect("error while running Central Business Workflow desktop application");
}
