import json
import os

INGREDIENT_BRIDGE_DEFINITIONS = [
    {
        "condition_id": "SC_PORE_VISIBILITY",
        "condition_name": "Lỗ chân lông rõ / sâu",
        "ingredient": "Niacinamide",
        "care_goal": "Hỗ trợ điều tiết bã nhờn, làm dịu và cải thiện kết cấu lỗ chân lông",
        "spec_gate": "Khởi đầu nồng độ vừa phải (2-5%)",
        "source_id": "EV-21",
        "published_evidence": "Thử nghiệm lâm sàng ghi nhận giảm tỷ lệ tiết bã nhờn sau 2-4 tuần sử dụng.",
        "limits": "Không phải mọi trường hợp lỗ chân lông to đều do tăng tiết dầu."
    },
    {
        "condition_id": "SC_PORE_VISIBILITY",
        "condition_name": "Lỗ chân lông rõ / sâu",
        "ingredient": "Salicylic Acid",
        "care_goal": "Làm sạch sâu trong phễu nang lông, tẩy tế bào chết bề mặt",
        "spec_gate": "Chỉ dùng khi xác nhận có mụn ẩn/bít tắc thực tế và da dung nạp tốt",
        "source_id": "EV-25",
        "published_evidence": "Hướng dẫn AAD 2024 khuyến nghị có điều kiện BHA 0.5-2% giúp giảm tổn thương bít tắc.",
        "limits": "Không tự động kê đơn BHA nếu da không có nhân mụn hoặc đang kích ứng."
    },
    {
        "condition_id": "SC_WRINKLE_FEATURES",
        "condition_name": "Đặc điểm nếp nhăn nổi bật",
        "ingredient": "Retinoid",
        "care_goal": "Kích thích tái tạo tế bào, tăng sinh collagen, làm mờ rãnh nhăn",
        "spec_gate": "Bắt đầu tần suất thấp vào buổi tối, bắt buộc kem chống nắng SPF 30+",
        "source_id": "EV-26",
        "published_evidence": "Tổng hợp phân tích RCT cho thấy cải thiện rõ rệt nếp nhăn lão hóa quang hóa sau 12-24 tuần.",
        "limits": "Tránh dùng khi mang thai/cho con bú; thận trọng khi da đang kích ứng."
    },
    {
        "condition_id": "SC_WRINKLE_FEATURES",
        "condition_name": "Đặc điểm nếp nhăn nổi bật",
        "ingredient": "Peptides",
        "care_goal": "Tăng cường độ săn chắc, hỗ trợ cấu trúc nền ngoại bào",
        "spec_gate": "Phù hợp mọi loại da, có thể kết hợp kem dưỡng ẩm",
        "source_id": "EV-GEN",
        "published_evidence": "Peptides tín hiệu (Palmitoyl Tripeptide-1/7) hỗ trợ phục hồi độ săn chắc da.",
        "limits": "Hiệu quả thẩm mỹ tích lũy lâu dài, không thay thế thủ thuật thẩm mỹ."
    },
    {
        "condition_id": "SC_WRINKLE_FEATURES",
        "condition_name": "Đặc điểm nếp nhăn nổi bật",
        "ingredient": "Glycerin",
        "care_goal": "Cấp nước tức thì, làm đầy các nếp nhăn li ti do mất nước bề mặt",
        "spec_gate": "Hoạt chất nền an toàn cao",
        "source_id": "EV-28",
        "published_evidence": "Nghiên cứu lâm sàng chứng minh Glycerin làm tăng độ ẩm tầng sừng đáng kể.",
        "limits": "Duy trì bôi thoa đều đặn để tránh mất nước qua biểu bì (TEWL)."
    },
    {
        "condition_id": "SC_LOW_ELASTICITY_REPORTED",
        "condition_name": "Đàn hồi thấp theo nhận định của JANUS",
        "ingredient": "Peptides",
        "care_goal": "Cải thiện độ đàn hồi và độ nảy của da",
        "spec_gate": "Kết hợp dưỡng ẩm và bảo vệ quang hóa hàng ngày",
        "source_id": "EV-GEN",
        "published_evidence": "Các chuỗi peptide sinh học hỗ trợ cải thiện độ đàn hồi tổng thể.",
        "limits": "Điểm đàn hồi trên máy quang học cần kết hợp đánh giá độ chùng nhão lâm sàng."
    },
    {
        "condition_id": "SC_LOW_ELASTICITY_REPORTED",
        "condition_name": "Đàn hồi thấp theo nhận định của JANUS",
        "ingredient": "Ceramides",
        "care_goal": "Củng cố hàng rào lipid gian bào, duy trì độ căng bóng khỏe",
        "spec_gate": "Phù hợp da lão hóa, da khô hoặc sau điều trị",
        "source_id": "EV-29",
        "published_evidence": "Bổ sung Ceramides NP/AP/EOP giúp phục hồi cấu trúc phiến lipid gian bào.",
        "limits": "Cần phối hợp tỷ lệ sinh lý cùng cholesterol và acid béo tự do."
    },
    {
        "condition_id": "SC_PIGMENTATION_SIGNAL",
        "condition_name": "Tín hiệu sắc tố nổi bật",
        "ingredient": "Vitamin C",
        "care_goal": "Ức chế enzyme tyrosinase, làm mờ đốm sắc tố và chống gốc tự do",
        "spec_gate": "Dùng buổi sáng kèm kem chống nắng phổ rộng",
        "source_id": "EV-23",
        "published_evidence": "Tổng quan hệ thống ghi nhận Vitamin C giúp cải thiện sắc tố da và làm sáng tone màu.",
        "limits": "Dạng L-Ascorbic Acid có thể gây châm chích ở nồng độ cao."
    },
    {
        "condition_id": "SC_PIGMENTATION_SIGNAL",
        "condition_name": "Tín hiệu sắc tố nổi bật",
        "ingredient": "Azelaic Acid",
        "care_goal": "Ức chế chọn lọc tế bào hắc tố bất thường, làm sáng đốm nâu",
        "spec_gate": "An toàn cho cả phụ nữ mang thai khi dùng ở nồng độ mỹ phẩm",
        "source_id": "EV-24",
        "published_evidence": "Tổng quan 43 thử nghiệm lâm sàng xác nhận Azelaic Acid hiệu quả trong sắc tố và thâm đỏ.",
        "limits": "Cần kiên trì từ 8-12 tuần để thấy rõ hiệu quả lâm sàng."
    },
    {
        "condition_id": "SC_PIGMENTATION_SIGNAL",
        "condition_name": "Tín hiệu sắc tố nổi bật",
        "ingredient": "Niacinamide",
        "care_goal": "Ngăn chặn vận chuyển melanosome từ tế bào hắc tố sang tế bào sừng",
        "spec_gate": "Nồng độ 2-5% dung nạp tốt cho da nhạy cảm",
        "source_id": "EV-21",
        "published_evidence": "Nhiều nghiên cứu đối chứng chứng minh Niacinamide làm sáng vùng da không đều màu.",
        "limits": "Hiệu quả rõ rệt khi kết hợp cùng các chất chống nắng quang phổ rộng."
    },
    {
        "condition_id": "SC_UV_PIGMENTATION",
        "condition_name": "Tín hiệu sắc tố UV",
        "ingredient": "Vitamin C",
        "care_goal": "Trung hòa gốc oxy hóa do tia cực tím, ngăn ngừa đốm nâu tiềm ẩn",
        "spec_gate": "Bắt buộc đi kèm chống nắng phổ rộng SPF 30+",
        "source_id": "EV-23",
        "published_evidence": "Chất chống oxy hóa bôi thoa phối hợp giúp tăng cường khả năng bảo vệ quang học.",
        "limits": "Không thể thay thế kem chống nắng quang phổ rộng."
    },
    {
        "condition_id": "SC_SEBUM_DISTRIBUTION",
        "condition_name": "Phân bố bã nhờn không đồng đều / điểm nóng khu trú",
        "ingredient": "Niacinamide",
        "care_goal": "Cân bằng tiết dầu vùng chữ T mà không làm khô vùng chữ U",
        "spec_gate": "Sử dụng dạng gel/lotion mỏng nhẹ không gây bít tắc",
        "source_id": "EV-21",
        "published_evidence": "Niacinamide điều hòa hoạt động của tuyến bã nhờn qua cơ chế kháng viêm nhẹ.",
        "limits": "Cần phân biệt bã nhờn sinh lý với hiện tượng tăng tiết dầu phản ứng do thiếu ẩm."
    },
    {
        "condition_id": "SC_PORPHYRIN_SIGNAL",
        "condition_name": "Tín hiệu porphyrin nổi bật",
        "ingredient": "Salicylic Acid",
        "care_goal": "Thâm nhập bã nhờn nang lông, giảm bít tắc vi khuẩn P.acnes",
        "spec_gate": "Chỉ dùng khi có nhân mụn bít tắc; không dùng quá liều gây khô tróc",
        "source_id": "EV-25",
        "published_evidence": "Salicylic acid tan trong dầu thâm nhập tốt vào cổ nang lông chứa đầy bã nhờn.",
        "limits": "Porphyrin cao không đồng nghĩa với mụn viêm; cần khám lâm sàng nhân mụn thực tế."
    },
    {
        "condition_id": "SC_TONE_VARIATION",
        "condition_name": "Chênh lệch tông màu giữa các vùng",
        "ingredient": "Vitamin C",
        "care_goal": "Đồng đều sắc thái da, tăng vẻ rạng rỡ",
        "spec_gate": "Dùng đều đặn hàng ngày",
        "source_id": "EV-23",
        "published_evidence": "Hỗ trợ làm đều màu da tổng thể giữa các vùng trán, má và cằm.",
        "limits": "Loại trừ nguyên nhân giãn mao mạch trước khi tập trung vào sắc tố."
    },
    {
        "condition_id": "SC_TONE_VARIATION",
        "condition_name": "Chênh lệch tông màu giữa các vùng",
        "ingredient": "Azelaic Acid",
        "care_goal": "Hài hòa tông da, vừa làm dịu vừa làm sáng",
        "spec_gate": "Thoa toàn mặt hoặc tập trung vùng sậm màu",
        "source_id": "EV-24",
        "published_evidence": "Làm đều màu da tốt đối với làn da có cả sắc tố lẫn nhạy cảm.",
        "limits": "Cần dưỡng ẩm đầy đủ để tránh bong tróc nhẹ thời gian đầu."
    },
    {
        "condition_id": "SC_REDNESS_LOCAL_REVIEW",
        "condition_name": "Tín hiệu đỏ da khu trú cần kiểm tra",
        "ingredient": "Panthenol",
        "care_goal": "Làm dịu ửng đỏ, giảm cảm giác châm chích nóng rát",
        "spec_gate": "Ưu tiên công thức không hương liệu, không cồn khô",
        "source_id": "EV-30",
        "published_evidence": "Pro-vitamin B5 tăng cường hydrat hóa và làm dịu phản ứng đỏ da cục bộ.",
        "limits": "Nếu đỏ kèm giãn mao mạch rõ hoặc sẩn mủ, cần bác sĩ da liễu khám Rosacea."
    },
    {
        "condition_id": "SC_REDNESS_LOCAL_REVIEW",
        "condition_name": "Tín hiệu đỏ da khu trú cần kiểm tra",
        "ingredient": "Ceramides",
        "care_goal": "Hàn gắn lớp sừng bị tổn thương, ngăn chặn tác nhân kích ứng xâm nhập",
        "spec_gate": "Sử dụng làm kem phục hồi hàng rào bảo vệ",
        "source_id": "EV-29",
        "published_evidence": "Khôi phục tính toàn vẹn của màng bảo vệ da, giảm hiện tượng nhạy cảm.",
        "limits": "Chọn kết cấu lotion hoặc cream dịu nhẹ không chứa chất nhũ hóa mạnh."
    },
    {
        "condition_id": "SC_MOISTURE_STATUS",
        "condition_name": "Duy trì độ ẩm / Thiếu ẩm",
        "ingredient": "Glycerin",
        "care_goal": "Hút ẩm giữ nước cho lớp biểu bì",
        "spec_gate": "Thành phần dưỡng ẩm cốt lõi hàng ngày",
        "source_id": "EV-28",
        "published_evidence": "Chất giữ ẩm sinh lý hiệu quả cao và tương thích sinh học tối ưu.",
        "limits": "Cần lớp màng khóa ẩm bên trên trong môi trường độ ẩm không khí thấp."
    },
    {
        "condition_id": "SC_MOISTURE_STATUS",
        "condition_name": "Duy trì độ ẩm / Thiếu ẩm",
        "ingredient": "Ceramides",
        "care_goal": "Khóa ẩm, chống thoát hơi nước qua biểu bì (TEWL)",
        "spec_gate": "Dưỡng chất thiết yếu cho mọi loại da thiếu ẩm",
        "source_id": "EV-29",
        "published_evidence": "Giảm TEWL và duy trì độ ẩm kéo dài hơn so với chỉ dùng chất hút ẩm đơn lẻ.",
        "limits": "Nên dùng sau bước serum cấp ẩm."
    },
    {
        "condition_id": "SC_UNDER_EYE_DARKNESS",
        "condition_name": "Vùng dưới mắt tối màu theo phân loại JANUS",
        "ingredient": "Niacinamide",
        "care_goal": "Cải thiện quầng thâm và độ sáng vùng da quanh mắt",
        "spec_gate": "Chỉ dùng sản phẩm được bào chế và kiểm nghiệm nhãn khoa riêng cho mắt",
        "source_id": "EV-21",
        "published_evidence": "Hỗ trợ làm sáng vùng mắt khi nguyên nhân do lắng đọng sắc tố hoặc ma sát.",
        "limits": "Không thể khắc phục hoàn toàn quầng thâm do hõm xương hốc mắt bẩm sinh."
    }
]

# Cơ sở dữ liệu sản phẩm chuẩn INCI (chứa vị trí thứ tự thành phần INCI chính xác)
PRODUCT_DATABASE = {
    "Niacinamide": [
        {"product_id": "SPC_00175", "product_name": "Dermalogica AGE Bright Clearing Serum 30ml", "best_ingredient_order": 1, "matched_inci": ["Niacinamide (Vị trí INCI #1/31)"]},
        {"product_id": "SPC_00602", "product_name": "CeraVe Eye Repair Cream 14ml", "best_ingredient_order": 1, "matched_inci": ["Niacinamide (Vị trí INCI #1/38)"]},
        {"product_id": "SPC_00179", "product_name": "SkinCeuticals Discoloration Defense Corrective Serum 30ml", "best_ingredient_order": 2, "matched_inci": ["Niacinamide (Vị trí INCI #2/13)"]}
    ],
    "Salicylic Acid": [
        {"product_id": "SPC_00834", "product_name": "NIP+FAB Salicylic Fix Tonic XXL Extreme 2% 190ml", "best_ingredient_order": 2, "matched_inci": ["Salicylic Acid (Vị trí INCI #2/17)"]},
        {"product_id": "SPC_00838", "product_name": "Clinique Clarifying Lotion 3 200ml", "best_ingredient_order": 2, "matched_inci": ["Salicylic Acid (Vị trí INCI #2/16)"]},
        {"product_id": "SPC_00839", "product_name": "Clinique Clarifying Lotion 3 400ml", "best_ingredient_order": 2, "matched_inci": ["Salicylic Acid (Vị trí INCI #2/16)"]}
    ],
    "Glycerin": [
        {"product_id": "SPC_00005", "product_name": "CeraVe Moisturising Cream 454g", "best_ingredient_order": 1, "matched_inci": ["Glycerin (Vị trí INCI #1/22)"]},
        {"product_id": "SPC_00006", "product_name": "CeraVe Moisturising Lotion 473ml", "best_ingredient_order": 1, "matched_inci": ["Glycerin (Vị trí INCI #1/24)"]},
        {"product_id": "SPC_00007", "product_name": "CeraVe Facial Moisturising Lotion No SPF 52ml", "best_ingredient_order": 1, "matched_inci": ["Glycerin (Vị trí INCI #1/21)"]}
    ],
    "Ceramides": [
        {"product_id": "SPC_00858", "product_name": "Elizabeth Arden Ceramide Purifying Toner 200ml", "best_ingredient_order": 4, "matched_inci": ["Ceramide 3 (Vị trí INCI #4/23)"]},
        {"product_id": "SPC_00007", "product_name": "CeraVe Facial Moisturising Lotion No SPF 52ml", "best_ingredient_order": 5, "matched_inci": ["Ceramide 3 (Vị trí INCI #5/21)", "Ceramide 6 II (Vị trí INCI #6/21)", "Ceramide 1 (Vị trí INCI #7/21)"]},
        {"product_id": "COS_00793", "product_name": "Advanced Anti-Aging Repairing Oil", "best_ingredient_order": 5, "matched_inci": ["Ceramide 3 (Vị trí INCI #5/12)"]}
    ],
    "Panthenol": [
        {"product_id": "SPC_00129", "product_name": "Medik8 Hydr8 B5 Serum 30ml", "best_ingredient_order": 1, "matched_inci": ["Panthenol (Vị trí INCI #1/6)"]},
        {"product_id": "SPC_00003", "product_name": "The Ordinary Hyaluronic Acid 2% + B5 Hydration Support Formula 30ml", "best_ingredient_order": 2, "matched_inci": ["Panthenol (Vị trí INCI #2/17)"]},
        {"product_id": "SPC_00122", "product_name": "The Ordinary Hyaluronic Acid 2% + B5 Supersize Serum 60ml", "best_ingredient_order": 2, "matched_inci": ["Panthenol (Vị trí INCI #2/17)"]}
    ],
    "Retinoid": [
        {"product_id": "SPC_00135", "product_name": "PIXI Collagen and Retinol Serum 30ml", "best_ingredient_order": 3, "matched_inci": ["Retinol (Vị trí INCI #3/18)"]},
        {"product_id": "SPC_00159", "product_name": "Peter Thomas Roth Retinol Fusion PM 30ml", "best_ingredient_order": 3, "matched_inci": ["Retinol (Vị trí INCI #3/11)"]},
        {"product_id": "COS_00627", "product_name": "Retinol Fusion PM Anti-Aging Night Treatment", "best_ingredient_order": 4, "matched_inci": ["Retinol (Vị trí INCI #4/12)"]}
    ],
    "Peptides": [
        {"product_id": "SPC_00116", "product_name": "The Ordinary 10% Argireline Solution 30ml", "best_ingredient_order": 2, "matched_inci": ["Acetyl Hexapeptide-8 (Vị trí INCI #2/10)"]},
        {"product_id": "SPC_00117", "product_name": "The Ordinary Buffet Supersize Serum 60ml", "best_ingredient_order": 3, "matched_inci": ["Acetyl Hexapeptide-8 (#3/49)", "Palmitoyl Tripeptide-1 (#5/49)", "Palmitoyl Tetrapeptide-7 (#6/49)"]},
        {"product_id": "SPC_00327", "product_name": "Dermalogica Age Smart Antioxidant Hydramist 150ml", "best_ingredient_order": 3, "matched_inci": ["Palmitoyl Tripeptide-5 (Vị trí INCI #3/35)"]}
    ],
    "Vitamin C": [
        {"product_id": "SPC_00126", "product_name": "La Roche-Posay Pure Vitamin C10 Serum 30ml", "best_ingredient_order": 1, "matched_inci": ["Ascorbic Acid (Vị trí INCI #1/27)"]},
        {"product_id": "COS_00698", "product_name": "Turbo Booster C Powder", "best_ingredient_order": 1, "matched_inci": ["Ascorbic Acid (Vị trí INCI #1/9)"]},
        {"product_id": "COS_01457", "product_name": "Prime & Protect Mattifying Primer with Broad Spectrum SPF 50", "best_ingredient_order": 1, "matched_inci": ["Ascorbic Acid (Vị trí INCI #1/25)"]}
    ],
    "Azelaic Acid": [
        {"product_id": "COS_00608", "product_name": "Ferulic Acid + Retinol Brightening Solution", "best_ingredient_order": 5, "matched_inci": ["Potassium Azeloyl Diglycinate (Vị trí INCI #5/30)"]},
        {"product_id": "COS_01111", "product_name": "Ferulic + Retinol Triple Correction Eye Serum", "best_ingredient_order": 8, "matched_inci": ["Potassium Azeloyl Diglycinate (Vị trí INCI #8/36)"]},
        {"product_id": "SPC_00739", "product_name": "Dr Dennis Gross Alpha Beta Pore Perfecting Cleansing Gel 60ml", "best_ingredient_order": 15, "matched_inci": ["Potassium Azeloyl Diglycinate (Vị trí INCI #15/41)"]}
    ]
}

# BẢNG ÁNH XẠ HOẠT CHẤT MỤC TIÊU THEO TÌNH TRẠNG DA (GIAI ĐOẠN 4 & 5 TRUY XUẤT)
CONDITION_ACTIVE_MAPPING = {
    "SC_PORE_VISIBILITY": [
        {"name": "Niacinamide (2 - 5%)", "role": "Thu nhỏ lỗ chân lông, củng cố thành nang lông & điều tiết dầu", "type": "first-line"},
        {"name": "Salicylic Acid (BHA 1 - 2%)", "role": "Làm sạch sâu bít tắc cổ nang lông (khi có nhân mụn)", "type": "clarifying"}
    ],
    "SC_WRINKLE_FEATURES": [
        {"name": "Retinoid / Retinol", "role": "Kích thích nguyên bào sợi sản sinh collagen, tái tạo cấu trúc da", "type": "anti-aging"},
        {"name": "Peptides", "role": "Tái thiết lập độ săn chắc, làm mờ rãnh nhăn biểu cảm", "type": "firming"},
        {"name": "Glycerin", "role": "Dưỡng ẩm sâu, làm đầy rãnh nhăn nông do mất nước bề mặt", "type": "hydration"}
    ],
    "SC_LOW_ELASTICITY_REPORTED": [
        {"name": "Peptides", "role": "Tăng cường mật độ trung bì, cải thiện độ đàn hồi hồi phục", "type": "firming"},
        {"name": "Ceramides", "role": "Củng cố màng lipid kép, ngăn ngừa thoái hóa mô nâng đỡ", "type": "barrier"}
    ],
    "SC_PIGMENTATION_SIGNAL": [
        {"name": "Vitamin C (Ascorbic Acid)", "role": "Ức chế enzyme tyrosinase, mờ đốm nâu và chống oxy hóa", "type": "brightening"},
        {"name": "Azelaic Acid", "role": "Ức chế chọn lọc tế bào hắc tố hoạt động quá mức, kháng viêm", "type": "brightening"},
        {"name": "Niacinamide", "role": "Ngăn chặn melanosome chuyển dịch lên tế bào sừng bề mặt", "type": "brightening"}
    ],
    "SC_UV_PIGMENTATION": [
        {"name": "Vitamin C (Ascorbic Acid)", "role": "Trung hòa gốc tự do do tia UV, ức chế cụm hắc tố ngầm", "type": "antioxidant"}
    ],
    "SC_SEBUM_DISTRIBUTION": [
        {"name": "Niacinamide (2 - 5%)", "role": "Cân bằng tuyến bã nhờn, phân bố lại dầu vùng chữ T và U", "type": "sebum-control"}
    ],
    "SC_PORPHYRIN_SIGNAL": [
        {"name": "Salicylic Acid (BHA)", "role": "Tan trong dầu, tiêu sừng bít tắc, kiểm soát vi khuẩn C. acnes", "type": "anti-acne"}
    ],
    "SC_TONE_VARIATION": [
        {"name": "Vitamin C", "role": "Đồng đều sắc thái da, làm sáng tổng thể khuôn mặt", "type": "brightening"},
        {"name": "Azelaic Acid", "role": "Cải thiện sự đồng nhất màu da giữa các vùng má và trán", "type": "tone-evening"}
    ],
    "SC_REDNESS_LOCAL_REVIEW": [
        {"name": "Panthenol (Pro-Vitamin B5)", "role": "Làm dịu cấp tốc, phục hồi mao mạch và giảm kích ứng", "type": "soothing"},
        {"name": "Ceramides", "role": "Tái lập hàng rào bảo vệ tự nhiên, giảm độ nhạy cảm", "type": "barrier"}
    ],
    "SC_MOISTURE_STATUS": [
        {"name": "Glycerin", "role": "Hút ẩm đa tầng, cân bằng nước nội biểu bì", "type": "hydration"},
        {"name": "Ceramides", "role": "Khóa ẩm sinh học, giảm mất nước qua biểu bì (TEWL)", "type": "barrier"}
    ],
    "SC_TEXTURE_STATUS": [
        {"name": "Niacinamide", "role": "Cải thiện bề mặt lớp sừng, làm mịn màng kết cấu da", "type": "texture"},
        {"name": "Ceramides", "role": "Duy trì độ mịn màng và độ ẩm cân bằng", "type": "barrier"}
    ],
    "SC_UNDER_EYE_DARKNESS": [
        {"name": "Niacinamide (Eye Formula)", "role": "Tăng cường vi tuần hoàn, giảm quầng thâm vùng hốc mắt", "type": "eye-care"}
    ]
}

TOP_MULTI_ACTIVE_PRODUCTS = [
    {
        "product_id": "COS_00360",
        "product_name": "Bye Bye Makeup™ 3-in-1 Makeup Melting Cleansing Balm",
        "matched_group_count": 7,
        "matched_groups": ["Niacinamide", "Glycerin", "Ceramides", "Panthenol", "Retinoid", "Peptides", "Vitamin C"],
        "inci_positions": [
            "Niacinamide -> Niacinamide (#21/74)",
            "Glycerin -> Glycerin (#13/74)",
            "Ceramides -> Ceramide Np (#29/74)",
            "Panthenol -> Panthenol (#26/74)",
            "Retinoid -> Retinyl Palmitate (#45/74)",
            "Peptides -> Palmitoyl Tripeptide-1 (#33/74)",
            "Vitamin C -> Sodium Ascorbyl Phosphate (#44/74)"
        ]
    },
    {
        "product_id": "COS_00728",
        "product_name": "Bye Bye Pores Primer™ Oil-Free Poreless Skin-Perfecting Serum Primer",
        "matched_group_count": 7,
        "matched_groups": ["Niacinamide", "Glycerin", "Ceramides", "Panthenol", "Retinoid", "Peptides", "Vitamin C"],
        "inci_positions": [
            "Niacinamide -> Niacinamide (#30/85)",
            "Glycerin -> Glycerin (#19/85)",
            "Ceramides -> Ceramide Np (#57/85)",
            "Panthenol -> Panthenol (#64/85)",
            "Retinoid -> Retinol (#31/85)",
            "Peptides -> Acetyl Hexapeptide-8 (#32/85)",
            "Vitamin C -> Sodium Ascorbyl Phosphate (#41/85)"
        ]
    },
    {
        "product_id": "COS_01109",
        "product_name": "Bye Bye Under Eye Eye Cream™ Smooths, Brightens, Depuffs",
        "matched_group_count": 7,
        "matched_groups": ["Niacinamide", "Glycerin", "Ceramides", "Panthenol", "Retinoid", "Peptides", "Vitamin C"],
        "inci_positions": [
            "Niacinamide -> Niacinamide (#6/93)",
            "Glycerin -> Glycerin (#15/93)",
            "Ceramides -> Ceramide Np (#31/93)",
            "Panthenol -> Panthenol (#57/93)",
            "Retinoid -> Retinol (#37/93)",
            "Peptides -> Acetyl Hexapeptide-8 (#19/93)",
            "Vitamin C -> Sodium Ascorbyl Phosphate (#29/93)"
        ]
    },
    {
        "product_id": "COS_00016",
        "product_name": "The Littles™ Complete Care Set",
        "matched_group_count": 6,
        "matched_groups": ["Niacinamide", "Salicylic Acid", "Glycerin", "Panthenol", "Peptides", "Vitamin C"],
        "inci_positions": [
            "Niacinamide -> Niacinamide (#61/147)",
            "Salicylic Acid -> Salicylic Acid (#70/147)",
            "Glycerin -> Glycerin (#3/147)",
            "Panthenol -> Panthenol (#59/147)",
            "Peptides -> Copper Tripeptide-1 (#129/147)",
            "Vitamin C -> Ascorbic Acid (#19/147)"
        ]
    },
    {
        "product_id": "COS_00134",
        "product_name": "Miracle Water 3-in-1 Micellar Cleanser",
        "matched_group_count": 6,
        "matched_groups": ["Niacinamide", "Glycerin", "Ceramides", "Retinoid", "Peptides", "Vitamin C"],
        "inci_positions": [
            "Niacinamide -> Niacinamide (#61/66)",
            "Glycerin -> Glycerin (#5/66)",
            "Ceramides -> Ceramide Np (#27/66)",
            "Retinoid -> Retinol (#64/66)",
            "Peptides -> Palmitoyl Tetrapeptide-7 (#52/66)",
            "Vitamin C -> 3-O-Ethyl Ascorbic Acid (#51/66)"
        ]
    }
]


class JanusExpertSystem:
    def __init__(self, data_dir="data"):
        self.data_dir = data_dir

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
                        basis = f"Điểm lỗ chân lông ({wf['JANUS_PORES']['report_value']}) vượt mốc tuổi ({wf['JANUS_PORES']['comparison_value']}), tỷ số R={r} ({band}); nhận định máy: '{v_text}'."
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
                        basis = f"Nếp nhăn R={r_w} ({band_w}); Rãnh mũi má R={r_nw} ({band_nw}). Vượt mốc tham chiếu tuổi."
                    else:
                        status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                        basis = "Chỉ số nếp nhăn nằm trong mốc tham chiếu tuổi."
                    metrics_detail = {"wrinkles_ratio": r_w, "nasolabial_ratio": r_nw}

            elif cid == "SC_LOW_ELASTICITY_REPORTED":
                v_text = str(wf.get("JANUS_ELASTICITY", {}).get("vendor_text_interpretation") or "")
                obs = wf.get("JANUS_ELASTICITY", {}).get("report_value")
                comp = wf.get("JANUS_ELASTICITY", {}).get("comparison_value")
                if "ít đàn hồi" in v_text.lower() or "reduced" in v_text.lower() or (obs and comp and obs < comp * 0.9):
                    status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                    basis = f"Đàn hồi thấp theo nhận định máy: '{v_text}' (Điểm={obs}, Mốc={comp})."
                else:
                    status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                    basis = f"Độ đàn hồi trong giới hạn bình thường (Điểm={obs}, Mốc={comp})."

            elif cid == "SC_PIGMENTATION_SIGNAL":
                r, band = get_ratio_band("JANUS_PIGMENTATION")
                if r is not None:
                    if r > 1.0:
                        status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                        basis = f"Sắc tố phân cực ({wf['JANUS_PIGMENTATION']['report_value']}) vượt mốc tuổi ({wf['JANUS_PIGMENTATION']['comparison_value']}), tỷ số R={r} ({band})."
                    else:
                        status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                        basis = f"Tỷ số sắc tố R={r} nằm trong mốc tham chiếu."
                    metrics_detail = {"ratio": r, "band": band}

            elif cid == "SC_UV_PIGMENTATION":
                r, band = get_ratio_band("JANUS_UV_PIGMENTATION")
                if r is not None:
                    if r > 1.0:
                        status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                        basis = f"Sắc tố UV toàn mặt vượt mốc tuổi (R={r})."
                    else:
                        status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                        basis = f"Điểm UV toàn mặt bằng hoặc thấp hơn mốc tuổi (R={r})."

            elif cid == "SC_SEBUM_DISTRIBUTION":
                obs = wf.get("JANUS_SEBUM", {}).get("report_value")
                comp = wf.get("JANUS_SEBUM", {}).get("comparison_value")
                reg_sebum = reg.get("JANUS_SEBUM", {})
                if obs is not None and comp is not None and comp > 0:
                    r = round(float(obs) / float(comp), 2)
                    max_reg = max(reg_sebum.items(), key=lambda x: x[1]) if reg_sebum else (None, None)
                    has_oily = "O" in main_code.upper()
                    if has_oily or (max_reg[1] and max_reg[1] > comp) or r > 1.0:
                        status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                        basis = f"Tín hiệu bã nhờn: Mã da có chữ O ({has_oily}), Bã nhờn toàn mặt={obs} so với mốc={comp} (R={r})."
                    else:
                        status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                        basis = f"Bã nhờn toàn mặt R={r}, không có điểm nóng khu trú."

            elif cid == "SC_PORPHYRIN_SIGNAL":
                r, band = get_ratio_band("JANUS_PORPHYRIN")
                if r is not None:
                    if r > 1.0:
                        status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                        basis = f"Porphyrin toàn mặt ({wf['JANUS_PORPHYRIN']['report_value']}) vượt mốc tuổi ({wf['JANUS_PORPHYRIN']['comparison_value']}), R={r} ({band})."
                    else:
                        status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                        basis = f"Porphyrin R={r} không vượt mốc tuổi."

            elif cid == "SC_TONE_VARIATION":
                reg_tone = reg.get("JANUS_SKIN_TONE", {})
                if reg_tone and len(reg_tone) >= 2:
                    spread = round(max(reg_tone.values()) - min(reg_tone.values()), 1)
                    if spread > 7.0:
                        status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                        basis = f"Chênh lệch tông màu giữa các vùng = {spread} (vượt ngưỡng >7)."
                    else:
                        status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                        basis = f"Chênh lệch tông màu giữa các vùng = {spread} (<=7)."
                else:
                    status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                    basis = "Không đủ dữ liệu vùng để đo chênh lệch tông màu."

            elif cid == "SC_REDNESS_LOCAL_REVIEW":
                reg_red = reg.get("JANUS_REDNESS", {})
                wf_red = wf.get("JANUS_REDNESS", {}).get("report_value")
                has_red = False
                if reg_red:
                    for k, v in reg_red.items():
                        if float(v) > 12.0:
                            has_red = True
                            break
                if has_red or (wf_red and float(wf_red) > 10.0) or ("S" in main_code.upper()):
                    status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                    basis = f"Tín hiệu đỏ da: Toàn mặt={wf_red}, ghi nhận vùng nhạy cảm hoặc mã da S."
                else:
                    status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                    basis = "Chỉ số đỏ da trong giới hạn bình thường."

            elif cid == "SC_MOISTURE_STATUS":
                obs = wf.get("JANUS_MOISTURE", {}).get("report_value")
                comp = wf.get("JANUS_MOISTURE", {}).get("comparison_value")
                if obs is not None and comp is not None and comp > 0:
                    r = round(float(obs) / float(comp), 2)
                    if r < 0.8:
                        status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                        basis = f"Độ ẩm ({obs}) thấp hơn mốc thích hợp ({comp}), R={r}."
                    else:
                        status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                        basis = f"Độ ẩm ({obs}) đạt yêu cầu so với mốc ({comp}), R={r}. Duy trì dưỡng ẩm cơ bản."

            elif cid == "SC_TEXTURE_STATUS":
                status_code, status_label = 1, "1 - Not triggered (Không kích hoạt)"
                basis = "Kết cấu da được bảo tồn."

            elif cid == "SC_UNDER_EYE_DARKNESS":
                plus_e = st_traits.get("+E", {}).get("sample_percent", 0)
                if plus_e and float(plus_e) > 0:
                    status_code, status_label = 2, "2 - Activated (Đã kích hoạt)"
                    basis = f"Ghi nhận chỉ báo +E = {plus_e}% (Vùng dưới mắt tối màu)."
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
                "metrics_detail": metrics_detail,
                "target_active_ingredients": CONDITION_ACTIVE_MAPPING.get(cid, [])
            })

        return results

    # --------------------------------------------------------------------------
    # GIAI ĐOẠN 3: HỆ THỐNG PHÂN LOẠI LOẠI DA 4 TRỤC
    # --------------------------------------------------------------------------
    def evaluate_skin_type(self, case_data):
        st_report = case_data.get("skin_type_report", {})
        main_code = st_report.get("main_code", "ORPW").upper()
        code_as_printed = st_report.get("code_as_printed", main_code)
        traits = st_report.get("traits", {})

        axes_meanings = {
            "D": {"meaning_vi": "Da khô (Dry)", "direction": "Hydration, rich moisturizers, barrier lipids"},
            "O": {"meaning_vi": "Da dầu (Oily)", "direction": "Lightweight gel/lotion, non-comedogenic, sebum control"},
            "S": {"meaning_vi": "Da nhạy cảm (Sensitive)", "direction": "Gentle, fragrance-free, soothe barrier, anti-redness"},
            "R": {"meaning_vi": "Da khỏe / Đề kháng (Resistant)", "direction": "Broad range of actives tolerated well"},
            "P": {"meaning_vi": "Da tăng sắc tố (Pigmented)", "direction": "Photoprotection, Vitamin C, Azelaic acid, tone-evening"},
            "N": {"meaning_vi": "Da không sắc tố (Non-pigmented)", "direction": "Maintenance, photoprotection"},
            "W": {"meaning_vi": "Da lão hóa / nếp nhăn (Wrinkled)", "direction": "Retinoids, peptides, photoprotection, collagen support"},
            "T": {"meaning_vi": "Da căng mịn (Tight)", "direction": "Maintenance, antioxidant photoprotection"}
        }

        axes_breakdown = []
        for letter in list(main_code):
            pct = traits.get(letter, {}).get("sample_percent", 50.0)
            meta = axes_meanings.get(letter, {"meaning_vi": f"Trục {letter}", "direction": "General care"})
            axes_breakdown.append({
                "code": letter,
                "meaning_vi": meta["meaning_vi"],
                "reported_percent": pct,
                "direction": meta["direction"],
                "limitation": f"Trục {letter} là xu hướng đo đạc, không tự động suy diễn bệnh lý da liễu."
            })

        return {
            "code_as_printed": code_as_printed,
            "main_code": main_code,
            "axes_breakdown": axes_breakdown,
            "profile_16": {
                "type_name_vi": f"Tổ hợp loại da {main_code}",
                "main_care_focus": "Chăm sóc theo 4 trục cân bằng ẩm - độ nhạy cảm - sắc tố - độ đàn hồi",
                "cautions": "Không tự ý dùng nồng độ treatment quá cao khi chưa kiểm tra độ kích ứng."
            }
        }

    # --------------------------------------------------------------------------
    # GIAI ĐOẠN 4: HỆ THỐNG GỢI Ý HOẠT CHẤT ĐỘNG DỰA TRÊN KẾT QUẢ ĐO THẬT
    # --------------------------------------------------------------------------
    def recommend_ingredients(self, conditions_result, skin_type_result, case_data):
        safety = case_data.get("user_safety_context", {})
        age = case_data.get("metadata", {}).get("age_years", 25)
        allergies = [a.lower().strip() for a in safety.get("known_allergies", [])]

        # 1. Lọc danh sách các điều kiện đã kích hoạt (status_code == 2)
        activated_cids = {c["condition_id"]: c["display_name_vi"] for c in conditions_result if c.get("status_code") == 2}
        # Luôn duy trì dưỡng ẩm cơ bản nếu chưa có
        activated_cids["SC_MOISTURE_STATUS"] = "Duy trì độ ẩm cơ bản"

        # 2. Quét qua Ingredient Bridge để đề xuất hoạt chất ĐỘNG
        active_candidates = {}

        for item in INGREDIENT_BRIDGE_DEFINITIONS:
            cid = item["condition_id"]
            if cid not in activated_cids:
                continue

            ing = item["ingredient"]
            goal = item["care_goal"]
            spec_gate = item["spec_gate"]
            source_id = item["source_id"]
            pub_ev = item["published_evidence"]
            limits = item["limits"]

            gate_status = "APPROVED"
            safety_notes = []

            # Kiểm tra dị ứng
            if ing.lower() in allergies:
                gate_status = "BLOCKED_ALLERGY"
                safety_notes.append("Người dùng khai báo tiền sử dị ứng với hoạt chất này.")

            # Kiểm tra Retinoid
            if "retinoid" in ing.lower():
                if safety.get("is_pregnant_or_breastfeeding", False):
                    gate_status = "BLOCKED_CONTRAINDICATION"
                    safety_notes.append("Chống chỉ định dùng Retinoid khi mang thai hoặc cho con bú.")
                elif safety.get("skin_currently_irritated", False):
                    gate_status = "HOLD_IRRITATION"
                    safety_notes.append("Tạm hoãn Retinoid vì hàng rào da đang kích ứng.")
                elif age < 16:
                    gate_status = "HOLD_AGE_REVIEW"
                    safety_notes.append(f"Khách hàng {age} tuổi: Cần bác sĩ da liễu đánh giá trước khi dùng Retinoid.")
                else:
                    gate_status = "CONDITIONAL"
                    safety_notes.append(f"Khách hàng {age} tuổi: Bắt đầu tần suất thấp vào buổi tối, bắt buộc chống nắng SPF 30+.")

            # Kiểm tra Salicylic Acid
            if "salicylic acid" in ing.lower():
                if not safety.get("has_visible_comedones_confirmed", False):
                    gate_status = "CONDITIONAL"
                    safety_notes.append("Chỉ dùng khi xác nhận có mụn ẩn/bít tắc thực tế; không dùng quá liều làm tổn thương màng ẩm.")

            if spec_gate:
                safety_notes.append(spec_gate)

            if ing not in active_candidates:
                active_candidates[ing] = {
                    "ingredient": ing,
                    "gate_status": gate_status,
                    "triggered_by_conditions": [f"{cid} ({activated_cids[cid]})"],
                    "care_goals": [goal],
                    "safety_and_use_gates": safety_notes,
                    "published_evidence_and_numbers": pub_ev,
                    "limits_and_safety_gate": limits,
                    "evidence_source_id": source_id
                }
            else:
                curr = active_candidates[ing]
                trig_str = f"{cid} ({activated_cids[cid]})"
                if trig_str not in curr["triggered_by_conditions"]:
                    curr["triggered_by_conditions"].append(trig_str)
                if goal not in curr["care_goals"]:
                    curr["care_goals"].append(goal)
                for note in safety_notes:
                    if note not in curr["safety_and_use_gates"]:
                        curr["safety_and_use_gates"].append(note)

        candidates_list = list(active_candidates.values())
        return {
            "disclaimer": "Đề xuất hoạt chất dựa trên bằng chứng khoa học và ma trận tương thích lâm sàng. Không thay thế phác đồ điều trị của bác sĩ da liễu.",
            "active_candidates": candidates_list
        }

    # --------------------------------------------------------------------------
    # GIAI ĐOẠN 5: TRUY XUẤT SẢN PHẨM PHÙ HỢP VỚI HOẠT CHẤT ĐƯỢC DUYỆT
    # --------------------------------------------------------------------------
    def match_products(self, recommendations_result):
        candidates = recommendations_result.get("active_candidates", [])
        approved_actives = [
            c["ingredient"] for c in candidates 
            if not c.get("gate_status", "").startswith("BLOCKED")
        ]

        by_active = {}
        for act in approved_actives:
            if act in PRODUCT_DATABASE:
                prods = PRODUCT_DATABASE[act]
                by_active[act] = {
                    "total_products": len(prods),
                    "top_samples": prods
                }

        # Lọc danh sách sản phẩm tối ưu kết hợp nhiều hoạt chất
        filtered_top = []
        for p in TOP_MULTI_ACTIVE_PRODUCTS:
            matching = [g for g in p["matched_groups"] if g in approved_actives]
            if len(matching) >= 2:
                filtered_top.append({
                    "product_id": p["product_id"],
                    "product_name": p["product_name"],
                    "matched_group_count": len(matching),
                    "matched_groups": matching,
                    "inci_positions": p["inci_positions"]
                })
        filtered_top.sort(key=lambda x: -x["matched_group_count"])

        return {
            "disclaimer": "Sự xuất hiện của hoạt chất trong bảng thành phần INCI không đồng nghĩa với hiệu quả điều trị lâm sàng tuyệt đối.",
            "by_active": by_active,
            "top_multi_active_products": filtered_top if filtered_top else TOP_MULTI_ACTIVE_PRODUCTS[:3]
        }

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
            "medical_disclaimer": "LƯU Ý CHUYÊN MÔN THẨM MỸ: Kết quả phân tích và phác đồ được tổng hợp dựa trên dữ liệu thiết bị đo da JANUS Pro và cơ sở dữ liệu da liễu thẩm mỹ, chỉ phục vụ mục đích tư vấn chăm sóc da cá nhân hóa, không thay thế chẩn đoán bệnh lý của bác sĩ chuyên khoa."
        }
