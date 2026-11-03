import axios from 'axios';
import sampleCaseInputData from '../data/sample_case_input.json';
import sampleFullApiResponseData from '../data/sample_full_api_response.json';

const JANUS_API_BASE = import.meta.env.VITE_JANUS_API_URL || 'http://localhost:8000';

const janusClient = axios.create({
  baseURL: JANUS_API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Tải ca đo mẫu chuẩn JANUS Pro (CASE_DEID_001)
 * Ưu tiên gọi API từ Backend FastAPI, nếu chưa chạy server sẽ fallback sang dữ liệu mẫu đã biên dịch.
 */
export const getJanusSampleCase = async () => {
  try {
    const res = await janusClient.get('/api/sample-case');
    return { data: res.data, isLive: true };
  } catch (err) {
    console.warn('Backend API chưa sẵn sàng hoặc không kết nối được, sử dụng dữ liệu mẫu kiểm nghiệm tích hợp.', err);
    return { data: sampleCaseInputData, isLive: false, offlineNotice: 'Đang xem dữ liệu mẫu chuẩn (Backend API chưa kích hoạt tại ' + JANUS_API_BASE + ')' };
  }
};

/**
 * Gửi dữ liệu ca đo sang Backend FastAPI để phân tích toàn diện 6 giai đoạn
 */
export const analyzeJanusReport = async (payload) => {
  try {
    const res = await janusClient.post('/api/analyze', payload);
    return { data: res.data, isLive: true };
  } catch (err) {
    // Nếu kết nối lỗi và payload là ca mẫu, cho phép hiển thị kết quả kiểm nghiệm kèm thông báo rõ ràng
    if (payload?.metadata?.case_id === 'CASE_DEID_001') {
      console.warn('API /api/analyze chưa phản hồi, sử dụng kết quả chuẩn hóa từ notebook kiểm nghiệm.', err);
      // Áp dụng bộ lọc an toàn động ngay trên dữ liệu mẫu nếu có thay đổi
      const clone = JSON.parse(JSON.stringify(sampleFullApiResponseData));
      const safety = payload.user_safety_context || {};
      const age = payload.metadata?.age_years || 18;
      const allergies = (safety.known_allergies || []).map(a => a.toLowerCase().trim());

      clone.stage_4_ingredient_recommendations.active_candidates.forEach(act => {
        if (allergies.includes(act.ingredient.toLowerCase())) {
          act.gate_status = 'BLOCKED_ALLERGY';
          act.safety_and_use_gates.unshift('Người dùng khai báo tiền sử dị ứng với hoạt chất này.');
        }
        if (act.ingredient.toLowerCase().includes('retinoid')) {
          if (safety.is_pregnant_or_breastfeeding) {
            act.gate_status = 'BLOCKED_CONTRAINDICATION';
            act.safety_and_use_gates.unshift('Chống chỉ định dùng Retinoid khi mang thai hoặc cho con bú.');
          } else if (safety.skin_currently_irritated) {
            act.gate_status = 'HOLD_IRRITATION';
            act.safety_and_use_gates.unshift('Tạm hoãn Retinoid vì hàng rào da đang kích ứng.');
          } else if (age < 16) {
            act.gate_status = 'HOLD_AGE_REVIEW';
            act.safety_and_use_gates.unshift('Dưới 16 tuổi: Cần bác sĩ da liễu đánh giá trước khi dùng Retinoid.');
          }
        }
        if (act.ingredient.toLowerCase().includes('salicylic acid')) {
          if (!safety.has_visible_comedones_confirmed) {
            act.gate_status = 'CONDITIONAL_COMEDONE_CONFIRMATION';
          }
        }
      });

      return {
        data: clone,
        isLive: false,
        offlineNotice: 'Kết quả hiển thị từ bộ dữ liệu kiểm nghiệm mẫu (Do Backend FastAPI chưa kết nối tại ' + JANUS_API_BASE + ')'
      };
    }

    throw new Error(err.response?.data?.detail || err.message || 'Không thể kết nối đến máy chủ phân tích da FastAPI.');
  }
};

export default {
  getJanusSampleCase,
  analyzeJanusReport,
};
