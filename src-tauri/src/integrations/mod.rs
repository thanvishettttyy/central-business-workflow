pub mod tally;
pub mod gst;

pub trait Connector {
    fn connect(&self) -> Result<(), String>;
    fn disconnect(&self) -> Result<(), String>;
    fn test_connection(&self) -> Result<bool, String>;
    fn get_status(&self) -> String;
    fn pull(&self) -> Result<serde_json::Value, String>;
    fn push(&self, payload: serde_json::Value) -> Result<serde_json::Value, String>;
    fn sync(&self) -> Result<serde_json::Value, String>;
}
