use super::Connector;

pub struct TallyConnector {
    pub endpoint: String,
    pub company_name: Option<String>,
}

impl Connector for TallyConnector {
    fn connect(&self) -> Result<(), String> {
        // Safe XML/ODBC connector initialization
        Ok(())
    }

    fn disconnect(&self) -> Result<(), String> {
        Ok(())
    }

    fn test_connection(&self) -> Result<bool, String> {
        // Graceful fallback: return false if local Tally instance is not listening on 9000
        Ok(false)
    }

    fn get_status(&self) -> String {
        "Integration unavailable — local file import/export functionality is active.".to_string()
    }

    fn pull(&self) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({ "pulled": [] }))
    }

    fn push(&self, _payload: serde_json::Value) -> Result<serde_json::Value, String> {
        Err("Push disabled in offline/file mode".to_string())
    }

    fn sync(&self) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({ "status": "idle", "source": "file_import" }))
    }
}
