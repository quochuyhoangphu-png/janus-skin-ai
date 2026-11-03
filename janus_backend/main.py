from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import json
import os
from rule_engine import JanusExpertSystem

app = FastAPI(
    title="JANUS Pro Rule-Based Expert System API",
    description="API phân tích chỉ số máy đo da JANUS Pro, phân loại da 4 trục, gợi ý hoạt chất và truy xuất sản phẩm INCI.",
    version="1.0.0"
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
        "assumed_build": "PIE.1040.1031.1004"
    }

@app.get("/api/sample-case")
def get_sample_case():
    """Trả về dữ liệu mẫu CASE_DEID_001 để Website có thể dùng nút 'Tải dữ liệu mẫu'."""
    sample_path = os.path.join(DATA_DIR, "sample_case_input.json")
    if os.path.exists(sample_path):
        with open(sample_path, "r", encoding="utf-8") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Không tìm thấy tệp sample_case_input.json")

@app.post("/api/analyze")
def analyze_janus_report(payload: JanusCaseRequest):
    """Nhận dữ liệu báo cáo JANUS Pro từ Website và trả về kết quả tư vấn toàn diện."""
    try:
        case_dict = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
        result = engine.analyze_full_case(case_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Lỗi xử lý dữ liệu: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
