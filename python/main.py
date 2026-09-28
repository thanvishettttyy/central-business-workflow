"""
Central Business Workflow - Background Python Worker Service.
Handles heavy CPU tasks: OCR, PDF table extraction, Excel batch transformation.
"""
import sys
import json
import argparse
from ocr.engine import OCREngine
from pdf.table_extractor import TableExtractor
from excel.processor import ExcelProcessor

def main():
    parser = argparse.ArgumentParser(description="Central Workflow Background Processing Agent")
    parser.add_argument("--action", required=True, choices=["ocr", "table_extract", "excel_map", "health"])
    parser.add_argument("--file", help="Target input file path")
    parser.add_argument("--params", help="JSON string parameters")

    args = parser.parse_args()

    if args.action == "health":
        print(json.dumps({"status": "healthy", "service": "CentralWorkflow-PythonWorker", "python_version": sys.version}))
        return

    if args.action == "ocr":
        engine = OCREngine()
        res = engine.process_document(args.file or "sample.pdf")
        print(json.dumps(res))
    elif args.action == "table_extract":
        extractor = TableExtractor()
        res = extractor.extract_tables(args.file or "sample.pdf")
        print(json.dumps(res))
    elif args.action == "excel_map":
        proc = ExcelProcessor()
        params = json.loads(args.params) if args.params else {}
        res = proc.map_and_clean(args.file or "sample.xlsx", params)
        print(json.dumps(res))

if __name__ == "__main__":
    main()
