import axios from 'axios';
import sampleCaseInputData from '../data/sample_case_input.json';
import sampleFullApiResponseData from '../data/sample_full_api_response.json';

const RAW_BASE = import.meta.env.VITE_JANUS_API_URL || 'http://localhost:8000';
const JANUS_API_BASE = (RAW_BASE || '').trim().replace(/\/+$/, '');

const janusClient = axios.create({
  baseURL: JANUS_API_BASE,
  timeout: 45000,
});

/**
 * Tải ca đo mẫu chuẩn JANUS Pro (CASE_DEID_001)
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
 * Gửi dữ liệu ca đo JSON sang Backend FastAPI để phân tích toàn diện
 */
export const analyzeJanusReport = async (payload) => {
  try {
    const res = await janusClient.post('/api/analyze', payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return { data: res.data, isLive: true };
  } catch (err) {
    throw new Error(err.response?.data?.detail || err.message || 'Không thể kết nối đến máy chủ phân tích da FastAPI.');
  }
};

/**
 * Gửi trực tiếp tệp PDF từ máy đo da (JANUS Pro, Visia, A-One...) lên Backend FastAPI
 * Backend sẽ tự động đọc text/chỉ số, chạy qua hệ chuyên gia IF-THEN và trả về kết quả thực tế.
 */
export const analyzeJanusPdf = async (file, safetyContext = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_pregnant_or_breastfeeding', !!safetyContext.is_pregnant_or_breastfeeding);
    formData.append('has_visible_comedones_confirmed', !!safetyContext.has_visible_comedones_confirmed);
    formData.append('known_allergies', safetyContext.known_allergies || '');
    formData.append('skin_currently_irritated', !!safetyContext.skin_currently_irritated);

    const res = await janusClient.post('/api/analyze-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { data: res.data, isLive: true };
  } catch (err) {
    throw new Error(err.response?.data?.detail || err.message || 'Không thể bóc tách hoặc phân tích tệp PDF.');
  }
};

export default {
  getJanusSampleCase,
  analyzeJanusReport,
  analyzeJanusPdf,
};
