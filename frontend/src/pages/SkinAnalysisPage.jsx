import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Table, Tabs, Tab, Alert, Spinner, Modal } from 'react-bootstrap';
import {
  FiActivity, FiShield, FiAlertTriangle, FiCheckCircle, FiXCircle,
  FiFileText, FiRefreshCw, FiUser, FiInfo, FiLayers, FiPackage,
  FiEye, FiSliders, FiHelpCircle, FiClock, FiUploadCloud, FiSearch
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getJanusSampleCase, analyzeJanusReport, analyzeJanusPdf } from '../services/janusService';

// Bảng ánh xạ hoạt chất mục tiêu chuẩn khoa học da liễu thẩm mỹ theo từng vấn đề da
const CONDITION_ACTIVES_MAP = {
  SC_PORE_VISIBILITY: [
    { name: "Niacinamide (2 - 5%)", role: "Củng cố thành nang lông, điều tiết bã nhờn, thu nhỏ lỗ chân lông", tag: "primary" },
    { name: "Salicylic Acid (BHA 1 - 2%)", role: "Tan trong dầu, làm sạch sâu bít tắc cổ nang lông", tag: "clarifying" }
  ],
  SC_WRINKLE_FEATURES: [
    { name: "Retinoid / Retinol", role: "Kích thích tăng sinh collagen trung bì, tái tạo nền da", tag: "anti-aging" },
    { name: "Peptides", role: "Tái thiết lập độ săn chắc, làm mờ rãnh nhăn nông & biểu cảm", tag: "firming" },
    { name: "Glycerin", role: "Dưỡng ẩm sâu bề mặt, làm đầy rãnh nhăn mất nước", tag: "hydration" }
  ],
  SC_LOW_ELASTICITY_REPORTED: [
    { name: "Peptides", role: "Phục hồi độ đàn hồi và mật độ mô liên kết trung bì", tag: "firming" },
    { name: "Ceramides", role: "Củng cố màng lipid kép, bảo vệ mô nâng đỡ biểu bì", tag: "barrier" }
  ],
  SC_PIGMENTATION_SIGNAL: [
    { name: "Vitamin C (Ascorbic Acid)", role: "Ức chế enzyme tyrosinase, làm sáng đốm nâu", tag: "brightening" },
    { name: "Azelaic Acid", role: "Ức chế chọn lọc tế bào hắc tố bất thường, kháng viêm", tag: "brightening" },
    { name: "Niacinamide", role: "Ngăn chặn melanosome chuyển dịch lên tế bào sừng", tag: "brightening" }
  ],
  SC_UV_PIGMENTATION: [
    { name: "Vitamin C (Ascorbic Acid)", role: "Trung hòa gốc tự do UV, ngăn cụm hắc tố ngầm phát triển", tag: "antioxidant" }
  ],
  SC_SEBUM_DISTRIBUTION: [
    { name: "Niacinamide (2 - 5%)", role: "Cân bằng tuyến bã nhờn toàn mặt, giảm dầu vùng chữ T", tag: "sebum-control" }
  ],
  SC_PORPHYRIN_SIGNAL: [
    { name: "Salicylic Acid (BHA)", role: "Tan trong dầu, tiêu sừng, kiểm soát vi khuẩn mụn C. acnes", tag: "anti-acne" }
  ],
  SC_TONE_VARIATION: [
    { name: "Vitamin C", role: "Làm sáng và đều màu da toàn diện giữa các phân vùng", tag: "brightening" },
    { name: "Azelaic Acid", role: "Cải thiện sắc thái da, mờ thâm cục bộ", tag: "tone-evening" }
  ],
  SC_REDNESS_LOCAL_REVIEW: [
    { name: "Panthenol (Pro-Vitamin B5)", role: "Làm dịu cấp tốc, giảm đỏ da và phục hồi mao mạch", tag: "soothing" },
    { name: "Ceramides", role: "Tái tạo hàng rào biểu bì, giảm độ nhạy cảm ngoại lai", tag: "barrier" }
  ],
  SC_MOISTURE_STATUS: [
    { name: "Glycerin", role: "Hút ẩm đa tầng, cân bằng nước nội biểu bì", tag: "hydration" },
    { name: "Ceramides", role: "Khóa ẩm sinh học, giảm mất nước qua biểu bì (TEWL)", tag: "barrier" }
  ],
  SC_TEXTURE_STATUS: [
    { name: "Niacinamide", role: "Cải thiện bề mặt lớp sừng, làm mịn màng kết cấu da", tag: "texture" },
    { name: "Ceramides", role: "Duy trì độ mịn màng và độ ẩm cân bằng", tag: "barrier" }
  ],
  SC_UNDER_EYE_DARKNESS: [
    { name: "Niacinamide (Chuyên Vùng Mắt)", role: "Tăng cường tuần hoàn vi mạch dưới mắt, giảm sắc tố", tag: "eye-care" }
  ]
};

const SkinAnalysisPage = () => {
  // Input State
  const [caseInput, setCaseInput] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const [safetyContext, setSafetyContext] = useState({
    is_pregnant_or_breastfeeding: false,
    has_visible_comedones_confirmed: false,
    known_allergies: '',
    skin_currently_irritated: false,
  });

  // UI State
  const [activeTab, setActiveTab] = useState('conditions');
  const [loading, setLoading] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [analyzingPdf, setAnalyzingPdf] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [offlineNotice, setOfflineNotice] = useState(null);
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Tự động tải ca mẫu ban đầu
  useEffect(() => {
    loadSampleCaseData();
  }, []);

  const loadSampleCaseData = async () => {
    setLoadingSample(true);
    try {
      const res = await getJanusSampleCase();
      setCaseInput(res.data);
      setJsonText(JSON.stringify(res.data, null, 2));
      if (res.data.user_safety_context) {
        setSafetyContext({
          is_pregnant_or_breastfeeding: !!res.data.user_safety_context.is_pregnant_or_breastfeeding,
          has_visible_comedones_confirmed: !!res.data.user_safety_context.has_visible_comedones_confirmed,
          known_allergies: (res.data.user_safety_context.known_allergies || []).join(', '),
          skin_currently_irritated: !!res.data.user_safety_context.skin_currently_irritated,
        });
      }
      if (res.offlineNotice) {
        setOfflineNotice(res.offlineNotice);
      } else {
        setOfflineNotice(null);
      }
      toast.info('Đã tải dữ liệu ca đo mẫu chuẩn JANUS Pro');
    } catch (err) {
      toast.error('Không thể tải ca mẫu: ' + err.message);
    } finally {
      setLoadingSample(false);
    }
  };

  const handleJsonChange = (e) => {
    setJsonText(e.target.value);
    try {
      const parsed = JSON.parse(e.target.value);
      setCaseInput(parsed);
      if (parsed.user_safety_context) {
        setSafetyContext({
          is_pregnant_or_breastfeeding: !!parsed.user_safety_context.is_pregnant_or_breastfeeding,
          has_visible_comedones_confirmed: !!parsed.user_safety_context.has_visible_comedones_confirmed,
          known_allergies: (parsed.user_safety_context.known_allergies || []).join(', '),
          skin_currently_irritated: !!parsed.user_safety_context.skin_currently_irritated,
        });
      }
    } catch {
      // Đang chỉnh sửa JSON
    }
  };

  const handleSafetyChange = (field, value) => {
    const updated = { ...safetyContext, [field]: value };
    setSafetyContext(updated);

    if (caseInput) {
      const updatedCase = {
        ...caseInput,
        user_safety_context: {
          ...caseInput.user_safety_context,
          is_pregnant_or_breastfeeding: updated.is_pregnant_or_breastfeeding,
          has_visible_comedones_confirmed: updated.has_visible_comedones_confirmed,
          known_allergies: updated.known_allergies.split(',').map(s => s.trim()).filter(Boolean),
          skin_currently_irritated: updated.skin_currently_irritated,
        }
      };
      setCaseInput(updatedCase);
      setJsonText(JSON.stringify(updatedCase, null, 2));
    }
  };

  const handleGenderToggle = (newSex) => {
    if (!caseInput) return;
    const updated = {
      ...caseInput,
      metadata: {
        ...caseInput.metadata,
        sex_reported: newSex
      }
    };
    setCaseInput(updated);
    setJsonText(JSON.stringify(updated, null, 2));
    toast.info(`Đã cập nhật giới tính: ${newSex === 'Female' ? 'Nữ' : 'Nam'}`);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError(null);

    // 1. Tệp PDF từ máy đo da
    if (file.name.toLowerCase().endsWith('.pdf')) {
      setAnalyzingPdf(true);
      try {
        toast.info(`Đang xử lý và bóc tách dữ liệu từ phiếu đo da "${file.name}"...`);
        const res = await analyzeJanusPdf(file, safetyContext);
        if (res.data) {
          if (res.data.extracted_case_data) {
            setCaseInput(res.data.extracted_case_data);
            setJsonText(JSON.stringify(res.data.extracted_case_data, null, 2));
            if (res.data.extracted_case_data.user_safety_context) {
              setSafetyContext({
                is_pregnant_or_breastfeeding: !!res.data.extracted_case_data.user_safety_context.is_pregnant_or_breastfeeding,
                has_visible_comedones_confirmed: !!res.data.extracted_case_data.user_safety_context.has_visible_comedones_confirmed,
                known_allergies: (res.data.extracted_case_data.user_safety_context.known_allergies || []).join(', '),
                skin_currently_irritated: !!res.data.extracted_case_data.user_safety_context.skin_currently_irritated,
              });
            }
          }
          setAnalysisResult(res.data);
          toast.success(`Đã phân tích thành công phiếu kết quả đo da "${file.name}"!`);
        }
      } catch (err) {
        const msg = err.message || 'Không thể xử lý tệp PDF.';
        setUploadError(msg);
        toast.error('Lỗi khi phân tích tệp PDF: ' + msg, { autoClose: 9000 });
      } finally {
        setAnalyzingPdf(false);
      }
      return;
    }

    // 2. Tệp JSON
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        setCaseInput(parsed);
        setJsonText(JSON.stringify(parsed, null, 2));
        if (parsed.user_safety_context) {
          setSafetyContext({
            is_pregnant_or_breastfeeding: !!parsed.user_safety_context.is_pregnant_or_breastfeeding,
            has_visible_comedones_confirmed: !!parsed.user_safety_context.has_visible_comedones_confirmed,
            known_allergies: (parsed.user_safety_context.known_allergies || []).join(', '),
            skin_currently_irritated: !!parsed.user_safety_context.skin_currently_irritated,
          });
        }
        toast.success(`Đã nạp tệp hồ sơ ${file.name} thành công!`);
      } catch {
        toast.error('Tệp không đúng định dạng JSON hợp lệ!');
      }
    };
    reader.readAsText(file);
  };

  const handleRunAnalysis = async () => {
    if (!caseInput) {
      toast.warning('Vui lòng nạp hoặc chọn phiếu kết quả đo da trước khi phân tích!');
      return;
    }

    const allergiesList = safetyContext.known_allergies.split(',').map(s => s.trim()).filter(Boolean);
    const payload = {
      ...caseInput,
      user_safety_context: {
        is_pregnant_or_breastfeeding: safetyContext.is_pregnant_or_breastfeeding,
        has_visible_comedones_confirmed: safetyContext.has_visible_comedones_confirmed,
        known_allergies: allergiesList,
        skin_currently_irritated: safetyContext.skin_currently_irritated,
      }
    };

    setLoading(true);
    try {
      const res = await analyzeJanusReport(payload);
      setAnalysisResult(res.data);
      if (res.offlineNotice) {
        setOfflineNotice(res.offlineNotice);
      } else {
        setOfflineNotice(null);
      }
      toast.success('Phân tích tình trạng da và xây dựng phác đồ hoàn tất!');
    } catch (err) {
      toast.error('Lỗi khi phân tích dữ liệu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Badge trạng thái hoạt chất thẩm mỹ
  const renderGateBadge = (status) => {
    if (!status) return null;
    if (status === 'APPROVED') {
      return <Badge bg="success" className="px-2 py-1"><FiCheckCircle className="me-1" /> Khuyên Dùng</Badge>;
    }
    if (status.startsWith('CONDITIONAL')) {
      return <Badge bg="warning" text="dark" className="px-2 py-1"><FiSliders className="me-1" /> Dùng Có Điều Kiện</Badge>;
    }
    if (status.startsWith('HOLD')) {
      return <Badge bg="secondary" className="px-2 py-1"><FiClock className="me-1" /> Tạm Hoãn Sử Dụng</Badge>;
    }
    if (status.startsWith('BLOCKED')) {
      return <Badge bg="danger" className="px-2 py-1"><FiXCircle className="me-1" /> Chống Chỉ Định</Badge>;
    }
    return <Badge bg="info">{status}</Badge>;
  };

  // Badge đánh giá tình trạng da thực tế
  const renderConditionBadge = (code) => {
    if (code === 2) {
      return <Badge bg="danger" className="px-2 py-1"><FiAlertTriangle className="me-1" /> Cần can thiệp chăm sóc</Badge>;
    }
    if (code === 1) {
      return <Badge bg="success" className="px-2 py-1"><FiCheckCircle className="me-1" /> Tình trạng ổn định</Badge>;
    }
    return <Badge bg="secondary" className="px-2 py-1"><FiCheckCircle className="me-1" /> Đang theo dõi</Badge>;
  };

  // Helper làm sạch tên điều kiện kích hoạt
  const cleanConditionName = (str) => {
    if (!str) return '';
    const match = str.match(/\((.*?)\)/);
    return match ? match[1] : str.replace(/^SC_[A-Z_]+\s*/, '');
  };

  return (
    <div className="page-enter py-4">
      <Container>
        {/* Tiêu đề & Giới thiệu chuẩn phong cách Clinic thẩm mỹ */}
        <div className="mb-4 text-center">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2" style={{ background: 'rgba(200, 39, 78, 0.08)', border: '1px solid rgba(200, 39, 78, 0.25)', color: 'var(--color-primary)', fontWeight: 600 }}>
            <FiActivity /> DermAI • Phân Tích Da Công Nghệ Cao JANUS Pro
          </div>
          <h1 className="hero-title mb-2">Hệ Thống Phân Tích Da & Tư Vấn Hoạt Chất JANUS Pro</h1>
          <p className="hero-subtitle mx-auto" style={{ maxWidth: 820 }}>
            Đánh giá quang học đa phổ từ thiết bị đo da chuyên sâu, nhận diện toàn diện các chỉ số tổn thương và lão hóa,
            xác định loại da chuyên biệt và cá nhân hóa phác đồ hoạt chất an toàn tối ưu.
          </p>
        </div>

        {offlineNotice && (
          <Alert variant="warning" className="d-flex align-items-center gap-2 py-2">
            <FiInfo className="flex-shrink-0" />
            <small>{offlineNotice}</small>
          </Alert>
        )}

        {uploadError && (
          <Alert variant="danger" dismissible onClose={() => setUploadError(null)} className="d-flex align-items-start gap-2 py-3 mb-4 shadow-sm" style={{ background: 'rgba(239, 68, 68, 0.18)', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            <FiAlertTriangle className="text-danger fs-4 flex-shrink-0 mt-1" />
            <div>
              <strong className="text-white">Thông báo từ Hệ thống Kiểm định:</strong>
              <div className="text-light mt-1 small" style={{ lineHeight: '1.5' }}>{uploadError}</div>
            </div>
          </Alert>
        )}

        {/* Khối Nạp Dữ Liệu & Thiết Lập An Toàn Da Liễu */}
        <Card className="glass-card mb-4 border-0">
          <Card.Header className="bg-transparent border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2 py-3" style={{ borderColor: 'var(--border-color)' }}>
            <div className="d-flex align-items-center gap-2">
              <FiFileText style={{ color: 'var(--accent)', fontSize: '1.25rem' }} />
              <h5 className="mb-0 text-white font-weight-bold">Báo Cáo Đo Da & Hồ Sơ Khách Hàng</h5>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <label className="btn btn-warning btn-sm mb-0 d-flex align-items-center gap-1 cursor-pointer fw-bold shadow-sm">
                {analyzingPdf ? <Spinner size="sm" animation="border" /> : <FiUploadCloud />}
                {analyzingPdf ? 'Đang bóc tách PDF...' : 'Tải Phiếu Đo Da (.PDF)'}
                <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} disabled={analyzingPdf} />
              </label>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={loadSampleCaseData}
                disabled={loadingSample || loading || analyzingPdf}
                className="d-flex align-items-center gap-1"
              >
                {loadingSample ? <Spinner size="sm" animation="border" /> : <FiRefreshCw />}
                Nạp Ca Mẫu Chuẩn
              </Button>
              <label className="btn btn-outline-info btn-sm mb-0 d-flex align-items-center gap-1 cursor-pointer">
                <FiPackage /> Nạp Tệp JSON
                <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowJsonEditor(!showJsonEditor)}
              >
                {showJsonEditor ? 'Ẩn Cấu Hình JSON' : 'Xem Cấu Hình JSON'}
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            <Row className="g-4">
              {/* Thông tin ca đo hiện tại */}
              <Col lg={4} md={12}>
                <div className="p-3 rounded-3 h-100" style={{ background: '#faf5f9', border: '1px solid var(--border-color)' }}>
                  <h6 className="text-white mb-3 d-flex align-items-center gap-2">
                    <FiUser style={{ color: 'var(--color-primary)' }} /> Thông Tin Ca Đo
                  </h6>
                  {caseInput?.metadata ? (
                    <div className="small text-secondary">
                      <div className="d-flex justify-content-between py-1 border-bottom border-secondary-subtle">
                        <span>Mã hồ sơ:</span>
                        <strong className="text-white">{caseInput.metadata.case_id}</strong>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom border-secondary-subtle">
                        <span>Độ tuổi:</span>
                        <strong className="text-white">{caseInput.metadata.age_years} tuổi</strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center py-1 border-bottom border-secondary-subtle">
                        <span>Giới tính:</span>
                        <div className="d-flex align-items-center gap-1">
                          <Button
                            variant={caseInput.metadata.sex_reported === 'Female' || caseInput.metadata.sex_reported === 'F' ? 'danger' : 'outline-secondary'}
                            size="sm"
                            className="py-0 px-2 fw-bold"
                            style={{ fontSize: '0.75rem', borderRadius: '4px' }}
                            onClick={() => handleGenderToggle('Female')}
                          >
                            Nữ
                          </Button>
                          <Button
                            variant={caseInput.metadata.sex_reported === 'Male' || caseInput.metadata.sex_reported === 'M' ? 'primary' : 'outline-secondary'}
                            size="sm"
                            className="py-0 px-2 fw-bold"
                            style={{ fontSize: '0.75rem', borderRadius: '4px' }}
                            onClick={() => handleGenderToggle('Male')}
                          >
                            Nam
                          </Button>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom border-secondary-subtle">
                        <span>Ngày thực hiện:</span>
                        <strong className="text-white">{caseInput.metadata.report_date || 'Hôm nay'}</strong>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom border-secondary-subtle">
                        <span>Mã loại da:</span>
                        <Badge bg="primary">{caseInput.skin_type_report?.code_as_printed || caseInput.skin_type_report?.main_code || 'Đang phân tích'}</Badge>
                      </div>
                      <div className="d-flex justify-content-between py-1">
                        <span>Nguồn nạp dữ liệu:</span>
                        <Badge bg="success">{caseInput.metadata.source_type === 'PDF_AUTOMATIC_EXTRACTION' ? 'Phiếu Đo Da PDF' : 'Dữ Liệu Chuẩn JANUS Pro'}</Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted small mb-0">Chưa có thông tin ca đo. Nhấn nút "Tải Phiếu Đo Da (.PDF)" hoặc "Nạp Ca Mẫu Chuẩn".</p>
                  )}
                </div>
              </Col>

              {/* Bối cảnh an toàn da liễu */}
              <Col lg={8} md={12}>
                <div className="p-3 rounded-3" style={{ background: '#faf5f9', border: '1px solid var(--border-color)' }}>
                  <h6 className="text-white mb-2 d-flex align-items-center gap-2">
                    <FiShield style={{ color: 'var(--color-primary)' }} /> Tiền Sử Da Liễu & Kiểm Soát An Toàn
                  </h6>
                  <p className="small text-secondary mb-3">
                    Hệ thống sẽ đối chiếu các thông tin dưới đây để tự động loại trừ các hoạt chất chống chỉ định (như Retinoid trong thai kỳ, BHA nồng độ cao khi da kích ứng) nhằm đảm bảo an toàn tuyệt đối cho làn da.
                  </p>

                  <Row className="g-2">
                    <Col md={6}>
                      <Form.Check
                        type="switch"
                        id="pregnancy-check"
                        label={<span className="text-light small">Phụ nữ mang thai / Cho con bú (Chống chỉ định Retinoid)</span>}
                        checked={safetyContext.is_pregnant_or_breastfeeding}
                        onChange={(e) => handleSafetyChange('is_pregnant_or_breastfeeding', e.target.checked)}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Check
                        type="switch"
                        id="comedones-check"
                        label={<span className="text-light small">Xác nhận có nhân mụn bít tắc thực tế (Mở khóa BHA/Salicylic Acid)</span>}
                        checked={safetyContext.has_visible_comedones_confirmed}
                        onChange={(e) => handleSafetyChange('has_visible_comedones_confirmed', e.target.checked)}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Check
                        type="switch"
                        id="irritation-check"
                        label={<span className="text-light small">Hàng rào da đang nhạy cảm / Kích ứng đỏ (Tạm hoãn hoạt chất mạnh)</span>}
                        checked={safetyContext.skin_currently_irritated}
                        onChange={(e) => handleSafetyChange('skin_currently_irritated', e.target.checked)}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          size="sm"
                          placeholder="Tiền sử dị ứng thành phần (VD: Niacinamide, Retinol...)"
                          value={safetyContext.known_allergies}
                          onChange={(e) => handleSafetyChange('known_allergies', e.target.value)}
                          className="form-control-dark"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              </Col>

              {/* Trình soạn thảo JSON nâng cao (chỉ hiện khi người dùng yêu cầu) */}
              {showJsonEditor && (
                <Col xs={12}>
                  <Form.Group className="mt-2">
                    <Form.Label className="text-white small">Mã Cấu Trúc Hồ Sơ (JSON Chuẩn Hóa):</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={8}
                      className="form-control-dark font-monospace small"
                      value={jsonText}
                      onChange={handleJsonChange}
                    />
                  </Form.Group>
                </Col>
              )}
            </Row>

            {/* Nút Kích hoạt phân tích */}
            <div className="mt-4 pt-3 border-top d-flex flex-wrap justify-content-between align-items-center gap-3" style={{ borderColor: 'var(--border-color)' }}>
              <div className="small text-muted d-flex align-items-center gap-1">
                <FiCheckCircle className="text-success" />
                <span>Hệ thống phân tích tự động dựa trên tiêu chuẩn da liễu và dữ liệu thiết bị quang học JANUS Pro</span>
              </div>
              <Button
                className="btn-accent px-4 py-2 font-weight-bold d-flex align-items-center gap-2"
                onClick={handleRunAnalysis}
                disabled={loading || !caseInput || analyzingPdf}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" />
                    Đang phân tích và xây dựng phác đồ...
                  </>
                ) : (
                  <>
                    <FiActivity /> Bắt Đầu Phân Tích Toàn Diện
                  </>
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* KHU VỰC HIỂN THỊ KẾT QUẢ PHÂN TÍCH */}
        {analysisResult && (
          <div className="analysis-results-section mt-4">
            {analysisResult.source_filename && (
              <Alert variant="success" className="d-flex align-items-center justify-content-between py-2 px-3 mb-4 rounded-3 border-0 shadow-sm flex-wrap gap-2" style={{ background: 'rgba(25, 135, 84, 0.2)', border: '1px solid rgba(25, 135, 84, 0.4)' }}>
                <div className="d-flex align-items-center gap-2 text-white">
                  <FiCheckCircle className="text-success fs-5" />
                  <span>Đang hiển thị kết quả phân tích thực tế từ tệp: <strong className="text-warning">{analysisResult.source_filename}</strong></span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Badge bg="success" className="px-2 py-1">Bóc Tách Dữ Liệu Thực Tế</Badge>
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="py-0 px-2 small d-flex align-items-center gap-1"
                    onClick={() => setShowAuditModal(true)}
                  >
                    <FiSearch /> Đối Chiếu Số Liệu Đo Gốc
                  </Button>
                </div>
              </Alert>
            )}

            <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
              <h3 className="section-title mb-0">Hồ Sơ Đánh Giá & Phác Đồ Trị Liệu Thẩm Mỹ</h3>
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="outline-info"
                  size="sm"
                  className="d-flex align-items-center gap-1"
                  onClick={() => setShowAuditModal(true)}
                >
                  <FiSearch /> Bảng Số Liệu Đo Da (Audit)
                </Button>
                <Badge bg="success" className="px-3 py-2 fs-6">
                  <FiCheckCircle className="me-1" /> Ca phân tích: {analysisResult.metadata_and_version_check?.case_id}
                </Badge>
              </div>
            </div>

            {/* Thanh Tabs phân tầng kết quả */}
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-4 custom-nav-tabs"
            >
              {/* TAB 1: ĐÁNH GIÁ TÌNH TRẠNG DA & HOẠT CHẤT HỖ TRỢ ĐỀ XUẤT */}
              <Tab eventKey="conditions" title={<span><FiActivity className="me-1" /> Tình Trạng Da & Hoạt Chất Mục Tiêu</span>}>
                {/* Hộp Tổng Hợp Hoạt Chất Đề Xuất Theo Tình Trạng Da */}
                <div className="p-3 mb-4 rounded-3" style={{ background: 'linear-gradient(135deg, rgba(226, 176, 73, 0.12), rgba(15, 23, 42, 0.6))', border: '1px solid rgba(226, 176, 73, 0.35)' }}>
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <FiShield style={{ color: 'var(--accent)', fontSize: '1.25rem' }} />
                      <h6 className="mb-0 text-white font-weight-bold">Tổng Hợp Hoạt Chất Trọng Tâm Đề Xuất Cho Ca Đo Này</h6>
                    </div>
                    <Button
                      variant="warning"
                      size="sm"
                      className="py-1 px-3 d-flex align-items-center gap-1 font-weight-bold shadow-sm"
                      onClick={() => setActiveTab('actives')}
                    >
                      Xem Toàn Bộ Phác Đồ & Bằng Chứng Khoa Học &rarr;
                    </Button>
                  </div>
                  <p className="small text-light mb-3" style={{ opacity: 0.9 }}>
                    Hệ thống đã tự động ánh xạ tình trạng da thực tế qua <strong>Cầu Nối Hoạt Chất (Ingredient Bridge)</strong> và kiểm duyệt an toàn (Use Gate) để đưa ra các nhóm hoạt chất trị liệu tối ưu:
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    {(() => {
                      // Tổng hợp danh sách hoạt chất duy nhất cho các tình trạng cần can thiệp (code = 2)
                      const triggered = analysisResult.stage_2_skin_conditions?.filter(c => c.status_code === 2) || [];
                      const activeMap = {};
                      triggered.forEach(c => {
                        const list = c.target_active_ingredients || CONDITION_ACTIVES_MAP[c.condition_id] || [];
                        list.forEach(a => {
                          const name = a.name || a.ingredient;
                          if (!activeMap[name]) {
                            activeMap[name] = { ...a, reasons: [c.display_name_vi] };
                          } else {
                            if (!activeMap[name].reasons.includes(c.display_name_vi)) {
                              activeMap[name].reasons.push(c.display_name_vi);
                            }
                          }
                        });
                      });

                      const entries = Object.values(activeMap);
                      if (entries.length === 0) {
                        return (
                          <div className="text-success small d-flex align-items-center gap-1">
                            <FiCheckCircle /> Các chỉ số đo da đều trong ngưỡng an toàn ổn định. Duy trì phác đồ cấp ẩm & chống nắng cơ bản (Glycerin, Ceramides, SPF 30+).
                          </div>
                        );
                      }

                      return entries.map((act, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 rounded-2 d-flex flex-column"
                          style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(226, 176, 73, 0.25)', maxWidth: '320px' }}
                        >
                          <div className="d-flex align-items-center justify-content-between gap-1 mb-1">
                            <strong className="text-warning small">{act.name}</strong>
                            <Badge bg="secondary" style={{ fontSize: '0.65rem' }}>Trị liệu</Badge>
                          </div>
                          <div className="text-light small mb-1" style={{ fontSize: '0.78rem', lineHeight: '1.3' }}>
                            {act.role}
                          </div>
                          <div className="text-secondary small" style={{ fontSize: '0.7rem' }}>
                            Mục tiêu: {act.reasons.join(', ')}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <Card className="glass-card border-0">
                  <Card.Header className="bg-transparent border-bottom py-3" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <h5 className="mb-0 text-white font-weight-bold">
                        Bảng Đánh Giá Tình Trạng Da & Hoạt Chất Chỉ Định Tương Ứng
                      </h5>
                      <div>
                        <Badge bg="danger" className="me-2 px-2 py-1">
                          Cần can thiệp: {analysisResult.stage_2_skin_conditions?.filter(c => c.status_code === 2).length}
                        </Badge>
                        <Badge bg="success" className="px-2 py-1">
                          Tình trạng ổn định: {analysisResult.stage_2_skin_conditions?.filter(c => c.status_code === 1).length}
                        </Badge>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table className="table-dark-custom align-middle mb-0" hover>
                        <thead>
                          <tr>
                            <th style={{ width: '20%' }}>Chỉ Số & Vấn Đề Da</th>
                            <th style={{ width: '15%' }}>Đánh Giá</th>
                            <th style={{ width: '37%' }}>Hoạt Chất Hỗ Trợ Đề Xuất (Target Actives)</th>
                            <th style={{ width: '28%' }}>Căn Cứ Phân Tích & Điểm Đo Thiết Bị</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysisResult.stage_2_skin_conditions?.map((item) => {
                            const isTriggered = item.status_code === 2;
                            const actives = item.target_active_ingredients || CONDITION_ACTIVES_MAP[item.condition_id] || [];
                            return (
                              <tr key={item.condition_id} style={{ background: isTriggered ? 'rgba(239, 68, 68, 0.06)' : 'transparent' }}>
                                <td>
                                  <div className="font-weight-bold text-white fs-6">{item.display_name_vi}</div>
                                  <small className="text-secondary">{item.condition_id}</small>
                                </td>
                                <td>
                                  {renderConditionBadge(item.status_code)}
                                </td>
                                <td>
                                  {actives.length > 0 ? (
                                    <div className="d-flex flex-column gap-2">
                                      {actives.map((act, aIdx) => (
                                        <div key={aIdx} className="p-1 rounded" style={{ background: isTriggered ? 'rgba(255, 193, 7, 0.08)' : 'rgba(255, 255, 255, 0.02)' }}>
                                          <div className="d-flex align-items-center gap-1 mb-1">
                                            <Badge
                                              bg={isTriggered ? (act.tag === 'primary' || act.type === 'first-line' ? 'warning' : 'info') : 'secondary'}
                                              text={isTriggered && (act.tag === 'primary' || act.type === 'first-line') ? 'dark' : 'white'}
                                              className="px-2 py-1 fw-bold"
                                              style={{ fontSize: '0.78rem' }}
                                            >
                                              {act.name || act.ingredient}
                                            </Badge>
                                          </div>
                                          <div className="text-light" style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
                                            {act.role || act.action}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="small text-secondary">Duy trì chăm sóc bảo tồn hàng rào da</span>
                                  )}
                                </td>
                                <td>
                                  <div className="small text-light" style={{ lineHeight: '1.6' }}>
                                    {item.evaluation_basis}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Tab>

              {/* TAB 2: PHÂN LOẠI LOẠI DA 4 TRỤC */}
              <Tab eventKey="skintype" title={<span><FiLayers className="me-1" /> Phân Loại Da Chuyên Sâu</span>}>
                <Row className="g-4">
                  <Col lg={12}>
                    <Card className="glass-card border-0">
                      <Card.Body className="p-4">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                          <div>
                            <span className="text-secondary small text-uppercase">Tổ hợp phân loại chính</span>
                            <h3 className="mb-0 text-accent font-weight-bold">
                              {analysisResult.stage_3_skin_type?.code_as_printed}
                            </h3>
                          </div>
                          <div>
                            <Badge bg="info" className="px-3 py-2 fs-6">
                              {analysisResult.stage_3_skin_type?.profile_16?.type_name_vi || analysisResult.stage_3_skin_type?.profile_16?.Type_Name_VI || 'Hồ sơ chuyên biệt'}
                            </Badge>
                          </div>
                        </div>

                        <Row className="g-3">
                          <Col md={6}>
                            <div className="p-3 rounded h-100" style={{ background: 'rgba(255,255,255,0.03)' }}>
                              <h6 className="text-white mb-2">🎯 Trọng Tâm Chăm Sóc Nền Tảng:</h6>
                              <p className="text-light small mb-0">{analysisResult.stage_3_skin_type?.profile_16?.main_care_focus || analysisResult.stage_3_skin_type?.profile_16?.Main_Care_Focus}</p>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="p-3 rounded h-100" style={{ background: 'rgba(255,255,255,0.03)' }}>
                              <h6 className="text-white mb-2">🧴 Nhóm Hoạt Chất Khuyến Cáo:</h6>
                              <p className="text-accent small mb-0">{analysisResult.stage_3_skin_type?.profile_16?.suggested_ingredient_groups || analysisResult.stage_3_skin_type?.profile_16?.Suggested_Ingredient_Groups || 'Niacinamide, Glycerin, Chống nắng SPF 30+'}</p>
                            </div>
                          </Col>
                          <Col xs={12}>
                            <div className="p-3 rounded" style={{ background: 'rgba(226, 176, 73, 0.08)', border: '1px solid rgba(226, 176, 73, 0.25)' }}>
                              <h6 className="text-warning mb-1">💡 Hướng Dẫn Chăm Sóc Nền Tảng:</h6>
                              <p className="text-light small mb-0">{analysisResult.stage_3_skin_type?.profile_16?.cautions || analysisResult.stage_3_skin_type?.profile_16?.Cautions_and_Do_Not_Auto_Assume || 'Tránh phối hợp nhiều sản phẩm treatment cùng lúc; luôn thử phản ứng dị ứng trước khi thoa toàn mặt.'}</p>
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Chi tiết 4 trục */}
                  <Col md={8}>
                    <Card className="glass-card border-0 h-100">
                      <Card.Header className="bg-transparent border-bottom py-3" style={{ borderColor: 'var(--border-color)' }}>
                        <h6 className="mb-0 text-white font-weight-bold">Giải Mã 4 Trục Cân Bằng Cốt Lõi (Độ Ẩm - Nhạy Cảm - Sắc Tố - Nếp Nhăn)</h6>
                      </Card.Header>
                      <Card.Body className="p-3">
                        <Row className="g-3">
                          {analysisResult.stage_3_skin_type?.axes_breakdown?.map((ax) => (
                            <Col md={6} key={ax.code || ax.Code}>
                              <div className="p-3 rounded h-100" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <span className="badge bg-primary px-2 py-1">Trục [{ax.code || ax.Code}] - {ax.meaning_vi || ax['Vietnamese meaning']}</span>
                                  <span className="text-accent small font-weight-bold">{ax.reported_percent}%</span>
                                </div>
                                <div className="small text-light mb-2">
                                  <strong>Định hướng:</strong> {ax.direction || ax['Recommendation direction']}
                                </div>
                                <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                                  <strong>Lưu ý chuyên môn:</strong> {ax.limitation || ax['Important limitation']}
                                </div>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Giải mã mã phụ +A/-A, +E/-E */}
                  <Col md={4}>
                    <Card className="glass-card border-0 h-100">
                      <Card.Header className="bg-transparent border-bottom py-3" style={{ borderColor: 'var(--border-color)' }}>
                        <h6 className="mb-0 text-white font-weight-bold">Đặc Điểm Vùng Da Chuyên Biệt</h6>
                      </Card.Header>
                      <Card.Body className="p-3">
                        {analysisResult.stage_3_skin_type?.modifiers_evaluation?.map((mod) => (
                          <div key={mod.code} className="mb-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="badge bg-warning text-dark font-weight-bold">Chỉ báo [{mod.code}]</span>
                              <span className="text-white small">Mức độ: {mod.reported_percent}%</span>
                            </div>
                            <div className="small text-light mb-1">
                              <strong>Phân tích:</strong> {mod.working_interpretation}
                            </div>
                            <div className="small text-info" style={{ fontSize: '0.75rem' }}>
                              💡 <strong>Khuyến nghị:</strong> {mod.recommendation_use || mod.caution}
                            </div>
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              {/* TAB 3: PHÁC ĐỒ HOẠT CHẤT TRỊ LIỆU */}
              <Tab eventKey="actives" title={<span><FiShield className="me-1" /> Phác Đồ Hoạt Chất Trị Liệu</span>}>
                <Card className="glass-card border-0">
                  <Card.Header className="bg-transparent border-bottom py-3" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <h5 className="mb-0 text-white font-weight-bold">
                        Phác Đồ Hoạt Chất Đề Xuất & Kiểm Soát An Toàn Da Liễu
                      </h5>
                      <span className="small text-secondary">
                        Độ tuổi khách hàng: {analysisResult.metadata_and_version_check?.age_years} tuổi
                      </span>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table className="table-dark-custom align-middle mb-0" hover>
                        <thead>
                          <tr>
                            <th style={{ width: '18%' }}>Tên Hoạt Chất</th>
                            <th style={{ width: '18%' }}>Đánh Giá Phù Hợp</th>
                            <th style={{ width: '32%' }}>Chỉ Định & Mục Tiêu Chăm Sóc</th>
                            <th style={{ width: '32%' }}>Chỉ Dẫn Sử Dụng & Bằng Chứng Lâm Sàng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysisResult.stage_4_ingredient_recommendations?.active_candidates?.map((act) => (
                            <tr key={act.ingredient}>
                              <td>
                                <h6 className="text-white mb-0 font-weight-bold fs-6">{act.ingredient}</h6>
                              </td>
                              <td>
                                {renderGateBadge(act.gate_status)}
                              </td>
                              <td>
                                <div className="small text-light mb-1">
                                  <strong>Chỉ định cho:</strong>
                                  <ul className="ps-3 mb-1 text-secondary" style={{ fontSize: '0.8rem' }}>
                                    {act.triggered_by_conditions?.map((c, i) => (
                                      <li key={i}>{cleanConditionName(c)}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="small text-info" style={{ fontSize: '0.8rem' }}>
                                  <strong>Mục tiêu:</strong> {act.care_goals?.join(', ')}
                                </div>
                              </td>
                              <td>
                                {act.safety_and_use_gates?.length > 0 && (
                                  <div className="p-2 rounded mb-2" style={{ background: 'rgba(255, 193, 7, 0.08)', fontSize: '0.78rem' }}>
                                    <strong className="text-warning">Chỉ dẫn sử dụng:</strong>
                                    <ul className="ps-3 mb-0 text-light">
                                      {act.safety_and_use_gates.map((g, idx) => (
                                        <li key={idx}>{g}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {act.published_evidence_and_numbers && (
                                  <div className="small text-secondary" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                                    <span className="badge bg-secondary me-1">{act.evidence_source_id || 'Nghiên cứu'}</span>
                                    <span>{act.published_evidence_and_numbers}</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Tab>

              {/* TAB 4: MỸ PHẨM KHUYÊN DÙNG */}
              <Tab eventKey="products" title={<span><FiPackage className="me-1" /> Mỹ Phẩm Khuyên Dùng Chuẩn INCI</span>}>
                <Row className="g-4">
                  <Col xs={12}>
                    <Card className="glass-card border-0">
                      <Card.Header className="bg-transparent border-bottom py-3" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                          <h5 className="mb-0 text-white font-weight-bold">
                            Top Sản Phẩm Tối Ưu Kết Hợp Đa Hoạt Chất (Multi-Active Care)
                          </h5>
                          <small className="text-secondary">Đáp ứng đồng thời nhiều nhóm hoạt chất điều trị cá nhân hóa</small>
                        </div>
                      </Card.Header>
                      <Card.Body className="p-3">
                        <Row className="g-3">
                          {analysisResult.stage_5_product_matches?.top_multi_active_products?.map((prod, index) => (
                            <Col md={6} lg={4} key={prod.product_id}>
                              <div className="p-3 rounded h-100" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <span className="badge bg-warning text-dark font-weight-bold">Ưu tiên #{index + 1}</span>
                                  <Badge bg="success">{prod.matched_group_count || prod.matched_active_count} nhóm hoạt chất</Badge>
                                </div>
                                <h6 className="text-white mb-2" style={{ fontSize: '0.95rem' }}>{prod.product_name}</h6>
                                <div className="mt-2 pt-2 border-top border-dark">
                                  <span className="small text-muted d-block mb-1">Vị trí thành phần hoạt tính INCI:</span>
                                  <ul className="ps-3 mb-0 small text-light" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                                    {(prod.inci_positions || prod.matched_inci_summary)?.map((inci, iIdx) => (
                                      <li key={iIdx}>{inci}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Sản phẩm theo từng nhóm hoạt chất */}
                  {analysisResult.stage_5_product_matches?.by_active && (
                    <Col xs={12}>
                      <Card className="glass-card border-0">
                        <Card.Header className="bg-transparent border-bottom py-3" style={{ borderColor: 'var(--border-color)' }}>
                          <h5 className="mb-0 text-white font-weight-bold">
                            Truy Xuất Mỹ Phẩm Theo Từng Hoạt Chất Mục Tiêu
                          </h5>
                        </Card.Header>
                        <Card.Body className="p-3">
                          <Row className="g-3">
                            {Object.entries(analysisResult.stage_5_product_matches.by_active).map(([activeName, info]) => (
                              <Col md={6} lg={4} key={activeName}>
                                <div className="p-3 rounded h-100" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="text-accent mb-0 font-weight-bold">{activeName}</h6>
                                    <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>{info.total_products} sản phẩm</span>
                                  </div>
                                  <div className="mt-2">
                                    {info.top_samples?.map((sp) => (
                                      <div key={sp.product_id} className="mb-2 pb-2 border-bottom border-dark small">
                                        <div className="text-white font-weight-bold" style={{ fontSize: '0.8rem' }}>{sp.product_name}</div>
                                        <div className="text-secondary" style={{ fontSize: '0.7rem' }}>
                                          {sp.matched_inci?.join(', ')}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </Col>
                            ))}
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  )}
                </Row>
              </Tab>

              {/* TAB 5: BẢNG CHỈ SỐ QUANG HỌC MINH BẠCH */}
              <Tab eventKey="raw" title={<span><FiSliders className="me-1" /> Chỉ Số Quang Học Thật {caseInput?.metadata?.detected_features_count !== undefined ? `(${caseInput.metadata.detected_features_count}/12 Bóc Tách)` : ''}</span>}>
                <Card className="glass-card border-0">
                  <Card.Header className="bg-transparent border-bottom py-3 d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ borderColor: 'var(--border-color)' }}>
                    <h5 className="mb-0 text-white font-weight-bold">Bảng Kiểm Định Số Liệu Bóc Tách Trực Tiếp Từ Phiếu Đo Da</h5>
                    {caseInput?.metadata?.detected_features_count !== undefined && (
                      <Badge bg="success" className="px-3 py-2">
                        Bóc tách thành công: {caseInput.metadata.detected_features_count} / 12 chỉ số từ tệp PDF
                      </Badge>
                    )}
                  </Card.Header>
                  <Card.Body className="p-3">
                    <Row className="g-3">
                      {caseInput?.whole_face_features && Object.entries(caseInput.whole_face_features).map(([key, val]) => (
                        <Col md={4} sm={6} key={key}>
                          <div className="p-3 rounded h-100" style={{ background: val.is_measured_from_pdf ? 'rgba(25, 135, 84, 0.12)' : 'rgba(255,255,255,0.02)', border: val.is_measured_from_pdf ? '1px solid rgba(25, 135, 84, 0.4)' : '1px solid var(--border-color)' }}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="text-white font-weight-bold">{val.feature_name_vi || key}</span>
                              {val.is_measured_from_pdf ? (
                                <Badge bg="success">Đo thực: {val.report_value}</Badge>
                              ) : (
                                <Badge bg="secondary">Không có trên phiếu này</Badge>
                              )}
                            </div>
                            <div className="small text-secondary">
                              Mốc tuổi tham chiếu: <strong className="text-white">{val.comparison_value}</strong>
                            </div>
                            {val.vendor_text_interpretation && (
                              <div className="small text-info mt-1" style={{ fontSize: '0.75rem' }}>
                                "{val.vendor_text_interpretation}"
                              </div>
                            )}
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              </Tab>
            </Tabs>

            {/* Lưu ý chuyên môn thẩm mỹ */}
            <div className="mt-4 p-3 rounded-3" style={{ background: 'rgba(226, 176, 73, 0.08)', border: '1px solid rgba(226, 176, 73, 0.25)' }}>
              <div className="d-flex align-items-center gap-2 mb-1 text-warning font-weight-bold">
                <FiInfo /> Lưu Ý Chuyên Môn Thẩm Mỹ & Da Liễu
              </div>
              <p className="small text-light mb-0" style={{ lineHeight: '1.6' }}>
                Kết quả phân tích và đề xuất phác đồ chăm sóc được tổng hợp dựa trên dữ liệu quang học chuyên sâu từ thiết bị đo da JANUS Pro và cơ sở dữ liệu da liễu thẩm mỹ, chỉ phục vụ mục đích tư vấn chăm sóc da cá nhân hóa, không thay thế chẩn đoán bệnh lý của bác sĩ chuyên khoa.
              </p>
            </div>
          </div>
        )}

        {/* Modal Đối Chiếu Dữ Liệu Bóc Tách PDF */}
        <Modal show={showAuditModal} onHide={() => setShowAuditModal(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-white border-bottom" style={{ borderColor: 'var(--border-color)' }}>
            <Modal.Title className="fs-5 d-flex align-items-center gap-2" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
              <FiSearch className="text-danger" /> Bảng Kiểm Định Dữ Liệu Đo Da Thực Tế Từ Phiếu PDF
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-white p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <div>Mã ca: <strong className="text-dark">{caseInput?.metadata?.case_id || 'PDF_UPLOADED'}</strong></div>
                <div className="small text-secondary">Tệp nguồn: {analysisResult?.source_filename || 'Phiếu đo da'}</div>
              </div>
              <div className="text-end">
                <Badge bg="success" className="px-2 py-1">
                  Đã bóc tách: {caseInput?.metadata?.detected_features_count ?? 12} / 12 chỉ số
                </Badge>
              </div>
            </div>

            <Table className="table-dark-custom align-middle mb-0" hover responsive>
              <thead>
                <tr>
                  <th>Chỉ Số Quang Học</th>
                  <th>Giá Trị Đo Thực (PDF)</th>
                  <th>Mốc Tuổi Chuẩn</th>
                  <th>Trạng Thái Bóc Tách</th>
                </tr>
              </thead>
              <tbody>
                {caseInput?.whole_face_features && Object.entries(caseInput.whole_face_features).map(([key, val]) => (
                  <tr key={key}>
                    <td>
                      <div className="text-dark font-weight-bold">{val.feature_name_vi || key}</div>
                      <small className="text-secondary">{key}</small>
                    </td>
                    <td>
                      {val.is_measured_from_pdf !== false ? (
                        <span className="text-danger font-weight-bold fs-6">{val.report_value}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className="text-dark">{val.comparison_value}</span>
                    </td>
                    <td>
                      {val.is_measured_from_pdf !== false ? (
                        <Badge bg="success">Đã bóc tách từ phiếu</Badge>
                      ) : (
                        <Badge bg="secondary">Không có trên phiếu này</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer className="bg-white border-top" style={{ borderColor: 'var(--border-color)' }}>
            <Button variant="outline-secondary" onClick={() => setShowAuditModal(false)}>
              Đóng Bảng Kiểm Định
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default SkinAnalysisPage;
