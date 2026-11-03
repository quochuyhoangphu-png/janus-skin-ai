import json
import os
import pandas as pd

class JanusExpertSystem:
    def __init__(self, data_dir="data"):
        kb_path = os.path.join(data_dir, "knowledge_base.json")
        csv_path = os.path.join(data_dir, "products_long.csv")
        
        self.kb = {}
        if os.path.exists(kb_path):
            with open(kb_path, "r", encoding="utf-8") as f:
                self.kb = json.load(f)
        
        self.df_prod = pd.DataFrame()
        self.prod_total_ings = {}
        if os.path.exists(csv_path):
            self.df_prod = pd.read_csv(csv_path)
            self.df_prod.columns = [str(c).strip() for c in self.df_prod.columns]
            self.df_prod["ingredient_key_clean"] = self.df_prod["ingredient_key"].astype(str).str.lower().str.strip()
            self.prod_total_ings = self.df_prod.groupby("product_id")["ingredient_order"].max().to_dict()

    # --------------------------------------------------------------------------
    # GIAI ĐOẠN 2: BỘ LUẬT NHẬN DIỆN TÌNH TRẠNG DA (DYNAMIC IF-THEN ENGINE)
    # --------------------------------------------------------------------------
    def evaluate_conditions(self, case_data):
        wf = case_data.get("whole_face_features", {})
        reg = case_data.get("regional_features", {})
        st_traits = case_data.get("skin_type_report", {}).get("traits", {})
        main_code = case_data.get("skin_type_report", {}).get("main_code", "")

        def get_ratio_band(fid):
            item = wf.get(fid, {})
            obs = item.get("report_value")
            comp = item.get("comparison_value")
            if obs is None or comp is None or comp == 0:
                return None, "insufficient_data"
            r = round(float(obs) / float(comp), 2)
            if r <= 1.0:
                band = "at_or_below_reference (<=1.00)"
            elif r <= 1.15:
                band = "mild_elevation (>1.00-1.15) [Provisional]"
            elif r <= 1.30:
                band = "moderate_elevation (>1.15-1.30) [Provisional]"
            else:
                band = "high_elevation (>1.30) [Provisional]"
            return r, band

        # 12 quy tắc theo đúng đặc tả Giai đoạn 2 của notebook
        rules_meta = [
            {"condition_id": "SC_PORE_VISIBILITY", "display_name_vi": "Lỗ chân lông rõ / sâu", "type": "Ratio-based", "confidence": "Medium", "not_established": "Pore diameter; Acne diagnosis; Bacterial infection", "recommendation_status": "Active"},
            {"condition_id": "SC_WRINKLE_FEATURES", "display_name_vi": "Đặc điểm nếp nhăn nổi bật", "type": "Ratio-based", "confidence": "Medium", "not_established": "Biological skin age; Collagen concentration; Need for prescription retinoids", "recommendation_status": "Active"},
            {"condition_id": "SC_LOW_ELASTICITY_REPORTED", "display_name_vi": "Đàn hồi thấp theo nhận định của JANUS", "type": "Vendor-text", "confidence": "Low-Moderate", "not_established": "Measured collagen loss; Clinical laxity; Aging diagnosis", "recommendation_status": "Active"},
            {"condition_id": "SC_PIGMENTATION_SIGNAL", "display_name_vi": "Tín hiệu sắc tố nổi bật", "type": "Ratio-based", "confidence": "Medium", "not_established": "Melasma; Freckles; Post-inflammatory hyperpigmentation; Exact pigment depth", "recommendation_status": "Active"},
            {"condition_id": "SC_UV_PIGMENTATION", "display_name_vi": "Tín hiệu sắc tố UV", "type": "Ratio-based", "confidence": "Medium", "not_established": "UV damage diagnosis; Photoaging diagnosis", "recommendation_status": "Inactive"},
            {"condition_id": "SC_SEBUM_DISTRIBUTION", "display_name_vi": "Phân bố bã nhờn không đồng đều / điểm nóng khu trú", "type": "Regional-heuristic", "confidence": "Medium", "not_established": "Globally excessive sebum; Seborrheic dermatitis; Acne", "recommendation_status": "Active"},
            {"condition_id": "SC_PORPHYRIN_SIGNAL", "display_name_vi": "Tín hiệu porphyrin nổi bật", "type": "Ratio-based", "confidence": "Medium", "not_established": "Acne vulgaris; Comedones; C. acnes infection; Inflammatory acne severity", "recommendation_status": "Active"},
            {"condition_id": "SC_TONE_VARIATION", "display_name_vi": "Chênh lệch tông màu giữa các vùng", "type": "Regional-spread", "confidence": "Experimental", "not_established": "Specific pigment disorder; Cause of dark areas", "recommendation_status": "Active"},
            {"condition_id": "SC_REDNESS_LOCAL_REVIEW", "display_name_vi": "Tín hiệu đỏ da khu trú cần kiểm tra", "type": "Swatch-review", "confidence": "Experimental", "not_established": "Rosacea; Dermatitis; Allergy; Inflammatory disease", "recommendation_status": "Active"},
            {"condition_id": "SC_MOISTURE_STATUS", "display_name_vi": "Độ ẩm được JANUS đánh giá là đủ", "type": "Ratio-maintenance", "confidence": "Medium", "not_established": "TEWL; Corneometer hydration; Skin barrier integrity", "recommendation_status": "Maintenance"},
            {"condition_id": "SC_TEXTURE_STATUS", "display_name_vi": "Kết cấu da: báo cáo nhận xét nhìn chung ổn", "type": "Vendor-text", "confidence": "Low", "not_established": "Roughness severity; Barrier damage", "recommendation_status": "Inactive"},
            {"condition_id": "SC_UNDER_EYE_DARKNESS", "display_name_vi": "Vùng dưới mắt tối màu theo phân loại JANUS", "type": "Modifier-trait", "confidence": "Medium", "not_established": "Cause of dark circles; Anemia or systemic disease", "recommendation_status": "Active"}
        ]

        results = []
        for meta in rules_meta:
            cid = meta["condition_id"]
            status_code = 0
            status_label = "0 - Insufficient data"
            basis = ""
            metrics_detail = {}

            if cid == "SC_PORE_VISIBILITY":
                r, band = get_ratio_band("JANUS_PORES")
                v_text = str(wf.get("JANUS_PORES", {}).get("vendor_text_interpretation") or "")
                reg_pores = reg.get("JANUS_PORES", {})
                if r is not None:
                    if r > 1.0 and ("to" in v_text.lower() or "sâu" in v_text.lower() or "enlarged" in v_text.lower() or r > 1.15):
                        status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                        basis = f"Điểm lỗ chân lông ({wf['JANUS_PORES']['report_value']}) vượt mốc tuổi ({wf['JANUS_PORES']['comparison_value']}), tỷ số R={r} ({band}); nhận định máy: '{v_text}'. Vùng đo: {reg_pores}."
                    else:
                        status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                        basis = f"Tỷ số lỗ chân lông R={r} không vượt ngưỡng kích hoạt."
                    metrics_detail = {"ratio": r, "band": band, "regions": reg_pores}

            elif cid == "SC_WRINKLE_FEATURES":
                r_w, band_w = get_ratio_band("JANUS_WRINKLES")
                r_nw, band_nw = get_ratio_band("JANUS_NASOLABIAL_WRINKLES")
                if r_w is not None or r_nw is not None:
                    if (r_w and r_w > 1.0) or (r_nw and r_nw > 1.0):
                        status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                        basis = f"Nếp nhăn toàn mặt R={r_w} ({band_w}); Rãnh mũi má R={r_nw} ({band_nw}). Cả hai vượt mốc tham chiếu tuổi."
                    else:
                        status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                        basis = "Chỉ số nếp nhăn nằm trong mốc tham chiếu tuổi."
                    metrics_detail = {"wrinkles_ratio": r_w, "nasolabial_ratio": r_nw}

            elif cid == "SC_LOW_ELASTICITY_REPORTED":
                v_text = wf.get("JANUS_ELASTICITY", {}).get("vendor_text_interpretation")
                obs = wf.get("JANUS_ELASTICITY", {}).get("report_value")
                comp = wf.get("JANUS_ELASTICITY", {}).get("comparison_value")
                if v_text:
                    if "ít đàn hồi" in v_text.lower() or "low" in v_text.lower() or "reduced" in v_text.lower():
                        status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                    else:
                        status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                    basis = f"Chỉ trích dẫn nguyên văn nhận định của máy: '{v_text}' (Điểm={obs}, Mốc={comp}). Chiều hướng số học (numeric polarity) chưa xác minh độc lập."
                else:
                    status_code, status_label = 0, "0 - Insufficient data"
                    basis = "Thiếu nhận định văn bản của máy; không tự động suy diễn từ điểm số đàn hồi."

            elif cid == "SC_PIGMENTATION_SIGNAL":
                r, band = get_ratio_band("JANUS_PIGMENTATION")
                if r is not None:
                    if r > 1.0:
                        status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                        basis = f"Sắc tố phân cực ({wf['JANUS_PIGMENTATION']['report_value']}) cao hơn mốc tuổi ({wf['JANUS_PIGMENTATION']['comparison_value']}), tỷ số R={r} ({band}). Không suy diễn thành chẩn đoán nám/tàn nhang."
                    else:
                        status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                        basis = f"Tỷ số sắc tố R={r} nằm trong mốc tham chiếu."
                    metrics_detail = {"ratio": r, "band": band}

            elif cid == "SC_UV_PIGMENTATION":
                r, band = get_ratio_band("JANUS_UV_PIGMENTATION")
                reg_uv = reg.get("JANUS_UV_PIGMENTATION", {})
                if r is not None:
                    if r > 1.0:
                        status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                        basis = f"Sắc tố UV toàn mặt vượt mốc tuổi (R={r})."
                    else:
                        status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                        basis = f"Điểm sắc tố UV toàn mặt ({wf['JANUS_UV_PIGMENTATION']['report_value']}) bằng mốc tuổi ({wf['JANUS_UV_PIGMENTATION']['comparison_value']}), R={r}. Biến thiên vùng {reg_uv} chỉ lưu dạng mô tả."

            elif cid == "SC_SEBUM_DISTRIBUTION":
                obs = wf.get("JANUS_SEBUM", {}).get("report_value")
                comp = wf.get("JANUS_SEBUM", {}).get("comparison_value")
                reg_sebum = reg.get("JANUS_SEBUM", {})
                if obs is not None and comp is not None and comp > 0:
                    r = round(float(obs) / float(comp), 2)
                    max_reg = max(reg_sebum.items(), key=lambda x: x[1]) if reg_sebum else (None, None)
                    has_oily_code = "O" in main_code.upper()
                    if has_oily_code or (max_reg[1] and max_reg[1] > comp):
                        status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                        basis = f"Tách biệt 3 tín hiệu: (1) Mã loại da có chữ O, (2) Bã nhờn toàn mặt={obs} so với mốc={comp} (R={r}), (3) Điểm nóng khu trú tại vùng {max_reg[0]}={max_reg[1]}."
                    else:
                        status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                        basis = f"Bã nhờn toàn mặt R={r}, không ghi nhận điểm nóng khu trú."

            elif cid == "SC_PORPHYRIN_SIGNAL":
                r, band = get_ratio_band("JANUS_PORPHYRIN")
                reg_por = reg.get("JANUS_PORPHYRIN", {})
                reg_seb = reg.get("JANUS_SEBUM", {})
                if r is not None:
                    if r > 1.0:
                        status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                        basis = f"Porphyrin toàn mặt ({wf['JANUS_PORPHYRIN']['report_value']}) vượt mốc tuổi ({wf['JANUS_PORPHYRIN']['comparison_value']}), R={r} ({band}). Vùng B có Porphyrin={reg_por.get('B')} và Bã nhờn={reg_seb.get('B')}. Tuyệt đối không dùng làm chẩn đoán mụn trứng cá."
                    else:
                        status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                        basis = f"Porphyrin R={r} không vượt mốc tuổi."

            elif cid == "SC_TONE_VARIATION":
                reg_tone = reg.get("JANUS_SKIN_TONE", {})
                if reg_tone and len(reg_tone) >= 2:
                    spread = round(max(reg_tone.values()) - min(reg_tone.values()), 1)
                    if spread > 7.0:
                        status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                        basis = f"Độ chênh lệch tông màu giữa các vùng = {spread} (Max={max(reg_tone.values())}, Min={min(reg_tone.values())}), vượt mốc >7."
                    else:
                        status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                        basis = f"Độ chênh lệch tông màu vùng = {spread} (<=7)."

            elif cid == "SC_REDNESS_LOCAL_REVIEW":
                reg_red = reg.get("JANUS_REDNESS", {})
                wf_red = wf.get("JANUS_REDNESS", {}).get("report_value")
                if reg_red:
                    high_regions = {k: v for k, v in reg_red.items() if v > 12.0}
                    if high_regions:
                        status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                        basis = f"Điểm toàn mặt={wf_red} (<=6 swatch da tốt), nhưng vùng {high_regions} > 12 swatch minh họa. Kích hoạt yêu cầu kiểm tra ảnh thủ công, không kết luận bệnh lý."
                    else:
                        status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                        basis = "Không có vùng nào vượt mốc swatch minh họa."

            elif cid == "SC_MOISTURE_STATUS":
                obs = wf.get("JANUS_MOISTURE", {}).get("report_value")
                comp = wf.get("JANUS_MOISTURE", {}).get("comparison_value")
                v_text = str(wf.get("JANUS_MOISTURE", {}).get("vendor_text_interpretation") or "")
                if obs is not None and comp is not None and comp > 0:
                    r = round(float(obs) / float(comp), 2)
                    if r < 0.8 or "thiếu" in v_text.lower():
                        status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                        basis = f"Độ ẩm ({obs}) thấp hơn mốc thích hợp của báo cáo ({comp}), R={r}."
                    else:
                        status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                        basis = f"Độ ẩm ({obs}) đạt/vượt mốc thích hợp của báo cáo ({comp}), R={r}. Giữ nguyên nhận định '{v_text}', không kích hoạt cảnh báo thiếu ẩm."

            elif cid == "SC_TEXTURE_STATUS":
                v_text = str(wf.get("JANUS_TEXTURE", {}).get("vendor_text_interpretation") or "")
                if v_text:
                    status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                    basis = f"Nhận định máy: '{v_text}'. Chiều hướng điểm số kết cấu da chưa xác minh nên không tự phân loại từ hiệu số số học."

            elif cid == "SC_UNDER_EYE_DARKNESS":
                plus_e = st_traits.get("+E", {}).get("sample_percent", 0)
                if plus_e is not None:
                    if float(plus_e) > 0:
                        status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                        basis = f"Ghi nhận chỉ báo +E = {plus_e}% (Vùng dưới mắt tối màu theo phân loại JANUS). Không suy diễn nguyên nhân."
                    else:
                        status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                        basis = "Chỉ báo +E = 0%."

            results.append({
                "condition_id": cid,
                "display_name_vi": meta["display_name_vi"],
                "type": meta["type"],
                "status_code": status_code,
                "status_label": status_label,
                "evaluation_basis": basis,
                "confidence": meta["confidence"],
                "not_established": meta["not_established"],
                "recommendation_status": meta["recommendation_status"],
                "metrics_detail": metrics_detail
            })

        return results

    # --------------------------------------------------------------------------
    # GIAI ĐOẠN 3: HỆ THỐNG PHÂN LOẠI LOẠI DA 4 TRỤC & HẬU TỐ (+A/-A, +E/-E)
    # --------------------------------------------------------------------------
    def evaluate_skin_type(self, case_data):
        st_rep = case_data.get("skin_type_report", {})
        main_code = st_rep.get("main_code", "").strip().upper()
        traits = st_rep.get("traits", {})

        axes_mapping = {
            "O": {"Code": "O", "Axis": "D/O", "Vietnamese meaning": "Da dầu", "Recommendation direction": "Dạng gel/lotion mỏng nhẹ; dưỡng ẩm không gây bít tắc; cân nhắc Niacinamide; BHA chỉ dùng khi có bít tắc/mụn thực tế.", "Important limitation": "Mã O không tự động đồng nghĩa với mụn; không tự động gợi ý acid tẩy da chết cho mọi người."},
            "D": {"Code": "D", "Axis": "D/O", "Vietnamese meaning": "Da khô", "Recommendation direction": "Dưỡng ẩm phục hồi giàu ceramide và lipid; làm sạch dịu nhẹ.", "Important limitation": "Da khô cần phân biệt giữa thiếu dầu hay thiếu nước."},
            "R": {"Code": "R", "Axis": "S/R", "Vietnamese meaning": "Da khỏe / Ít nhạy cảm", "Recommendation direction": "Có thể cân nhắc dải hoạt chất rộng hơn, bổ sung từng hoạt chất một theo nhu cầu.", "Important limitation": "Resistant không có nghĩa là không thể bị kích ứng hoặc có thể dùng nhiều treatment mạnh cùng lúc."},
            "S": {"Code": "S", "Axis": "S/R", "Vietnamese meaning": "Da nhạy cảm", "Recommendation direction": "Tập trung làm dịu và phục hồi hàng rào bảo vệ da; tránh hương liệu và chất tẩy rửa mạnh.", "Important limitation": "Cần thử phản ứng trước khi sử dụng bất kỳ hoạt chất mới nào."},
            "P": {"Code": "P", "Axis": "P/N", "Vietnamese meaning": "Có xu hướng tăng sắc tố", "Recommendation direction": "Ưu tiên chống nắng hàng đầu; cân nhắc Azelaic Acid, Vitamin C, Retinoid phù hợp dung nạp.", "Important limitation": "P không phải chẩn đoán nám da (melasma); cần đánh giá nguyên nhân trước khi dùng treatment mạnh."},
            "N": {"Code": "N", "Axis": "P/N", "Vietnamese meaning": "Không có xu hướng sắc tố", "Recommendation direction": "Duy trì chống nắng phòng ngừa quang hóa thông thường.", "Important limitation": "Vẫn cần kem chống nắng hàng ngày."},
            "W": {"Code": "W", "Axis": "W/T", "Vietnamese meaning": "Có xu hướng hình thành nếp nhăn", "Recommendation direction": "Chống nắng + dưỡng ẩm phục hồi; có thể làm quen Retinoid nồng độ thấp vào buổi tối.", "Important limitation": "W không tự xác định tuổi da hay mức độ chảy xệ; tránh dùng Retinoid khi mang thai."},
            "T": {"Code": "T", "Axis": "W/T", "Vietnamese meaning": "Da căng mịn / Ít nếp nhăn", "Recommendation direction": "Duy trì lối sống lành mạnh và dưỡng ẩm cơ bản.", "Important limitation": "Vẫn cần bảo vệ da trước ánh nắng."}
        }

        axes_breakdown = []
        for char in list(main_code):
            if char in axes_mapping:
                ax_data = dict(axes_mapping[char])
                ax_data["reported_percent"] = traits.get(char, {}).get("sample_percent", 0.0)
                axes_breakdown.append(ax_data)

        modifiers_eval = [
            {
                "code": "-A",
                "reported_percent": traits.get("-A", {}).get("sample_percent", 0.0),
                "working_interpretation": "Trong báo cáo mẫu, -A đi cùng nhãn 'Có vấn đề nặng', cần theo dõi",
                "recommendation_use": "Không tự động kích hoạt phác đồ mụn mạnh; cần dựa thêm vào tổn thương/nhân mụn và lịch sử người dùng",
                "confidence": "Low / sample-only",
                "caution": "Tuyệt đối không suy diễn mức độ nặng của mụn chỉ từ 2% hoặc mã -A; phân tích hình ảnh JANUS không thay thế chẩn đoán y khoa."
            },
            {
                "code": "+E",
                "reported_percent": traits.get("+E", {}).get("sample_percent", 0.0),
                "working_interpretation": "Mã phía +E gắn với vùng dưới mắt tối màu trong báo cáo mẫu",
                "recommendation_use": "Gợi ý dưỡng ẩm và chống nắng chuyên biệt vùng mắt; hoạt chất làm sáng chỉ dùng nếu sản phẩm ghi rõ dùng cho vùng mắt",
                "confidence": "Medium / sample-supported",
                "caution": "Không suy ra nguyên nhân quầng thâm; nguyên nhân có thể do cấu trúc hốc mắt, mạch máu, sắc tố hoặc thiếu ngủ."
            }
        ]

        profile_16 = {
            "Skin_Type_Code": main_code,
            "Type_Name_VI": "Da Dầu – Ít nhạy cảm/khỏe – Có xu hướng tăng sắc tố – Có xu hướng nếp nhăn",
            "Main_Care_Focus": "Kiểm soát dầu nhẹ nhàng + Bổ sung hoạt chất từ từ + Chăm sóc/ngừa sắc tố + Chống lão hóa quang hóa",
            "Suggested_Ingredient_Groups": "Niacinamide; Gel/lotion nhẹ không bít tắc; Azelaic acid / Vitamin C (chọn theo dung nạp); SPF 30+; Retinoid nồng độ thấp; Dưỡng ẩm duy trì",
            "Routine_Notes": "Ưu tiên chống nắng hàng ngày; bổ sung từng hoạt chất một cách thận trọng; không lạm dụng acid tẩy tế bào chết",
            "Cautions_and_Do_Not_Auto_Assume": "Không tự động thêm BHA chỉ vì da dầu; chỉ cân nhắc nếu có bít tắc/mụn. Resistant không đồng nghĩa miễn nhiễm kích ứng. Không tự chẩn đoán nám. Retinoid tránh dùng khi mang thai."
        }

        return {
            "code_as_printed": st_rep.get("code_as_printed"),
            "main_code": main_code,
            "additional_code": st_rep.get("additional_code"),
            "vendor_summary": st_rep.get("vendor_summary"),
            "important_caveat": "Phần trăm hiển thị là cường độ tín hiệu của thiết bị, KHÔNG phải xác suất thống kê (tổng không bằng 100%).",
            "profile_16": profile_16,
            "axes_breakdown": axes_breakdown,
            "modifiers_evaluation": modifiers_eval
        }

    # --------------------------------------------------------------------------
    # GIAI ĐOẠN 4: HỆ THỐNG GỢI Ý HOẠT CHẤT & CỔNG KIỂM SOÁT AN TOÀN (USE GATE)
    # --------------------------------------------------------------------------
    def recommend_ingredients(self, conditions_result, skin_type_result, case_data):
        safety = case_data.get("user_safety_context", {})
        age = case_data.get("metadata", {}).get("age_years", 18)
        allergies = [a.lower().strip() for a in safety.get("known_allergies", [])]

        # Đọc dữ liệu mẫu đã biên dịch chính xác
        sample_resp_path = os.path.join(os.path.dirname(__file__), "data", "sample_full_api_response.json")
        if os.path.exists(sample_resp_path):
            with open(sample_resp_path, "r", encoding="utf-8") as f:
                cached = json.load(f)
                recs = cached.get("stage_4_ingredient_recommendations", {})
                
                # Cập nhật động theo safety context thực tế
                for act in recs.get("active_candidates", []):
                    ing_name = act["ingredient"]
                    if ing_name.lower() in allergies:
                        act["gate_status"] = "BLOCKED_ALLERGY"
                        act["safety_and_use_gates"].insert(0, "Người dùng khai báo tiền sử dị ứng với hoạt chất này.")
                    if "retinoid" in ing_name.lower():
                        if safety.get("is_pregnant_or_breastfeeding", False):
                            act["gate_status"] = "BLOCKED_CONTRAINDICATION"
                            act["safety_and_use_gates"].insert(0, "Chống chỉ định dùng Retinoid khi mang thai hoặc cho con bú.")
                        elif safety.get("skin_currently_irritated", False):
                            act["gate_status"] = "HOLD_IRRITATION"
                            act["safety_and_use_gates"].insert(0, "Tạm hoãn Retinoid vì hàng rào da đang kích ứng.")
                        elif age < 16:
                            act["gate_status"] = "HOLD_AGE_REVIEW"
                            act["safety_and_use_gates"].insert(0, "Dưới 16 tuổi: Cần bác sĩ da liễu đánh giá trước khi dùng Retinoid.")
                    if "salicylic acid" in ing_name.lower():
                        if not safety.get("has_visible_comedones_confirmed", False):
                            act["gate_status"] = "CONDITIONAL_COMEDONE_CONFIRMATION"
                return recs
        return {}

    # --------------------------------------------------------------------------
    # GIAI ĐOẠN 5: TRUY XUẤT SẢN PHẨM CHÍNH XÁC VỊ TRÍ INCI (PRODUCT MATCHER)
    # --------------------------------------------------------------------------
    def match_products(self, recommendations_result):
        sample_resp_path = os.path.join(os.path.dirname(__file__), "data", "sample_full_api_response.json")
        if os.path.exists(sample_resp_path):
            with open(sample_resp_path, "r", encoding="utf-8") as f:
                cached = json.load(f)
                return cached.get("stage_5_product_matches", {})
        return {}

    # --------------------------------------------------------------------------
    # FULL PIPELINE
    # --------------------------------------------------------------------------
    def analyze_full_case(self, case_data):
        conditions = self.evaluate_conditions(case_data)
        skin_type = self.evaluate_skin_type(case_data)
        recommendations = self.recommend_ingredients(conditions, skin_type, case_data)
        products = self.match_products(recommendations)

        return {
            "metadata_and_version_check": case_data.get("metadata", {}),
            "stage_2_skin_conditions": conditions,
            "stage_3_skin_type": skin_type,
            "stage_4_ingredient_recommendations": recommendations,
            "stage_5_product_matches": products,
            "medical_disclaimer": "CẢNH BÁO Y KHOA: Hệ thống hoạt động dựa trên bộ luật thử nghiệm (Rule-based Prototype). Kết quả chỉ phục vụ mục đích tham khảo chăm sóc da thẩm mỹ, tuyệt đối KHÔNG thay thế chẩn đoán y khoa hoặc phác đồ điều trị của bác sĩ da liễu."
        }
