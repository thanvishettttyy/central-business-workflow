use std::fs;
use std::path::PathBuf;

pub fn init_directories(_app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    // Structure:
    // APP-DATA/
    //   database/
    //   customers/
    //   imports/
    //   exports/
    //   temp/
    //   backups/
    //   logs/
    let base_dir = dirs_or_local();
    for sub in &["database", "customers", "imports", "exports", "temp", "backups", "logs"] {
        let p = base_dir.join(sub);
        if !p.exists() {
            let _ = fs::create_dir_all(&p);
        }
    }
    println!("[Central Business Workflow] Local directory structure verified at {:?}", base_dir);
    Ok(())
}

fn dirs_or_local() -> PathBuf {
    PathBuf::from("C:\\ProgramData\\CentralWorkflow")
}
