# Tally & GST Integration Documentation

## 1. Tally Connector Framework (Section 6 & 29)

### Architecture
The Tally integration is strictly isolated from core UI and business logic through an explicit TypeScript and Rust trait contract:

```typescript
export interface ConnectorStatus {
  connected: boolean;
  endpoint: string;
  lastSync?: string;
  sourceMode: 'File Import / Local Data' | 'Direct Tally XML Server' | 'ODBC Bridge';
  message: string;
}

export interface TallySyncResult {
  success: boolean;
  ledgersImported: number;
  vouchersImported: number;
  errors: string[];
  timestamp: string;
}
```

### Modes of Operation
1. **Direct XML Gateway (Port 9000)**: Pings local Tally instance running on `localhost:9000`. If active, queries `<ENVELOPE><BODY><DATA><TALLYMESSAGE>` endpoints.
2. **Local DayBook XML Import (Offline Safe)**: When direct port communication is offline or unconfigured, users can import Tally DayBook XML, Trial Balance XML, or Excel exports directly. The connector parses ledgers, creates vouchers, and associates them with the customer record.
3. **Safety Guarantee**: Unofficial credential scraping or unauthorized bot automation is prohibited.

---

## 2. GST Compliance Module (Section 7 & 36)

### Explicit Non-Portal Status
- Government portal submission is **never faked or pretended**.
- All records imported or entered display the clear indicator:
  `Imported / Local Data`
- Output tax (CGST, SGST, IGST) and Input Tax Credit (ITC) reconciliation are performed locally.
- The connector layer is designed to plug directly into authorized GSP (GST Suvidha Provider) OAuth APIs when client credentials are provided.
