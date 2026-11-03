from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import json
import os
from rule_engine import JanusExpertSystem
from pdf_parser import parse_janus_pdf

app = FastAPI(
    title="JANUS Pro Rule-Based Expert System API",
    description="API phân tích chỉ số máy đo da JANUS Pro, đọc trực tiếp tệp PDF, phân loại da 4 trục, gợi ý hoạt chất và truy xuất sản phẩm INCI.",
    version="2.0.0"
)

# Cấu hình CORS cho phép Website gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi tạo hệ chuyên gia
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
engine = JanusExpertSystem(data_dir=DATA_DIR)

class SafetyContext(BaseModel):
    is_pregnant_or_breastfeeding: bool = False
    has_visible_comedones_confirmed: bool = False
    known_allergies: List[str] = []
    skin_currently_irritated: bool = False

class JanusCaseRequest(BaseModel):
    metadata: Dict[str, Any]
    user_safety_context: Optional[SafetyContext] = SafetyContext()
    whole_face_features: Dict[str, Any]
    regional_features: Dict[str, Any]
    skin_type_report: Dict[str, Any]

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "JANUS Pro Rule-Based Expert System API",
        "version": "2.0.0",
        "pdf_support": True,
        "assumed_build": "PIE.1040.1031.1004"
    }

@app.get("/api/sample-case")
def get_sample_case():
    """Trả về dữ liệu mẫu CASE_DEID_001."""
    sample_path = os.path.join(DATA_DIR, "sample_case_input.json")
    if os.path.exists(sample_path):
        with open(sample_path, "r", encoding="utf-8") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Không tìm thấy tệp sample_case_input.json")

@app.post("/api/analyze")
def analyze_janus_report(payload: JanusCaseRequest):
    """Nhận dữ liệu JSON báo cáo JANUS Pro từ Website và phân tích toàn diện."""
    try:
        case_dict = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
        result = engine.analyze_full_case(case_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Lỗi xử lý dữ liệu: {str(e)}")

@app.post("/api/analyze-pdf")
@app.post("/api/analyze-pdf/")
async def analyze_janus_pdf_file(
    file: UploadFile = File(...),
    is_pregnant_or_breastfeeding: bool = Form(False),
    has_visible_comedones_confirmed: bool = Form(False),
    known_allergies: str = Form(""),
    skin_currently_irritated: bool = Form(False)
):
    """
    Đọc trực tiếp tệp PDF từ máy đo da (JANUS Pro, Visia, A-One...),
    bóc tách dữ liệu thực tế và phân tích toàn diện.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Vui lòng tải lên tệp định dạng .pdf")

    pdf_bytes = await file.read()
    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=400, detail="Tệp PDF rỗng")

    try:
        # Bóc tách dữ liệu từ PDF
        case_data = parse_janus_pdf(pdf_bytes)

        # Cập nhật điều kiện an toàn y khoa
        allergies_list = [a.strip() for a in known_allergies.split(",") if a.strip()]
        case_data["user_safety_context"] = {
            "is_pregnant_or_breastfeeding": is_pregnant_or_breastfeeding,
            "has_visible_comedones_confirmed": has_visible_comedones_confirmed or case_data["user_safety_context"]["has_visible_comedones_confirmed"],
            "known_allergies": allergies_list,
            "skin_currently_irritated": skin_currently_irritated or case_data["user_safety_context"]["skin_currently_irritated"]
        }

        # Chạy qua hệ thống luật chuyên gia
        analysis_result = engine.analyze_full_case(case_data)
        analysis_result["extracted_case_data"] = case_data
        analysis_result["source_filename"] = file.filename
        return analysis_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi đọc và bóc tách tệp PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
