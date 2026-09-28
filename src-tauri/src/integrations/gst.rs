use super::Connector;

pub struct GSTConnector {
    pub api_base: String,
    pub gstin: Option<String>,
}

impl Connector for GSTConnector {
    fn connect(&self) -> Result<(), String> {
        Ok(())
    }

    fn disconnect(&self) -> Result<(), String> {
        Ok(())
    }

    fn test_connection(&self) -> Result<bool, String> {
        // Safe check for official GSP/ASP API gateway
        Ok(false)
    }

    fn get_status(&self) -> String {
        "Imported / Local Data — External GSP API not configured".to_string()
    }

    fn pull(&self) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({ "invoices": [] }))
    }

    fn push(&self, _payload: serde_json::Value) -> Result<serde_json::Value, String> {
        Err("Cannot submit to GST portal without authorized GSP credentials".to_string())
    }

    fn sync(&self) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({ "status": "local_ready" }))
    }
}
