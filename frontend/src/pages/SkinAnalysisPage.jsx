import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Table, Tabs, Tab, Alert, Spinner } from 'react-bootstrap';
import {
  FiActivity, FiShield, FiAlertTriangle, FiCheckCircle, FiXCircle,
  FiFileText, FiRefreshCw, FiUser, FiInfo, FiLayers, FiPackage,
  FiEye, FiSliders, FiHelpCircle, FiClock, FiUploadCloud
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getJanusSampleCase, analyzeJanusReport, analyzeJanusPdf } from '../services/janusService';

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

  // Tự động tải ca mẫu ban đầu để người dùng có dữ liệu xem ngay
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
      toast.info('Đã tải ca đo mẫu chuẩn JANUS Pro (CASE_DEID_001)');
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
      // Đang gõ json chưa hoàn chỉnh, chưa cập nhật state object
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Nếu người dùng chọn tệp PDF xuất ra từ máy soi da
    if (file.name.toLowerCase().endsWith('.pdf')) {
      setAnalyzingPdf(true);
      try {
        toast.info(`Đang bóc tách dữ liệu từ phiếu đo da PDF "${file.name}"...`);
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
          toast.success(`Đã đọc thành công phiếu PDF "${file.name}" và hoàn tất phân tích AI thực tế!`);
        }
      } catch (err) {
        toast.error('Lỗi khi phân tích tệp PDF: ' + err.message);
      } finally {
        setAnalyzingPdf(false);
      }
      return;
    }

    // 2. Nếu người dùng chọn tệp JSON
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
        toast.success(`Đã nạp tệp báo cáo ${file.name} thành công! Bấm "Bắt đầu phân tích AI" để chạy.`);
      } catch {
        toast.error('Tệp không đúng định dạng JSON hợp lệ!');
      }
    };
    reader.readAsText(file);
  };

  const handleRunAnalysis = async () => {
    if (!caseInput) {
      toast.warning('Vui lòng tải hoặc nạp dữ liệu ca đo JANUS trước khi phân tích!');
      return;
    }

    // Đóng gói payload gửi backend
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
      toast.success('Phân tích dữ liệu da JANUS Pro hoàn tất!');
    } catch (err) {
      toast.error('Lỗi khi phân tích dữ liệu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper render badge trạng thái cổng an toàn
  const renderGateBadge = (status) => {
    if (!status) return null;
    if (status === 'APPROVED') {
      return <Badge bg="success" className="px-2 py-1"><FiCheckCircle className="me-1" /> APPROVED (Phù hợp)</Badge>;
    }
    if (status.startsWith('CONDITIONAL')) {
      return <Badge bg="warning" text="dark" className="px-2 py-1"><FiSliders className="me-1" /> CONDITIONAL (Có điều kiện)</Badge>;
    }
    if (status.startsWith('HOLD')) {
      return <Badge bg="secondary" className="px-2 py-1"><FiClock className="me-1" /> HOLD (Tạm hoãn)</Badge>;
    }
    if (status.startsWith('BLOCKED')) {
      return <Badge bg="danger" className="px-2 py-1"><FiXCircle className="me-1" /> BLOCKED (Chặn an toàn)</Badge>;
    }
    return <Badge bg="info">{status}</Badge>;
  };

  // Helper render badge tình trạng da
  const renderConditionBadge = (code) => {
    if (code === 2) {
      return <Badge bg="danger" className="px-2 py-1"><FiActivity className="me-1" /> Đã kích hoạt (Code 2)</Badge>;
    }
    if (code === 1) {
      return <Badge bg="success" className="px-2 py-1"><FiCheckCircle className="me-1" /> Không kích hoạt (Code 1)</Badge>;
    }
    return <Badge bg="secondary" className="px-2 py-1"><FiHelpCircle className="me-1" /> Chưa đủ dữ liệu (Code 0)</Badge>;
  };

  return (
    <div className="page-enter py-4">
      <Container>
        {/* Tiêu đề & Giới thiệu */}
        <div className="mb-4 text-center">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2" style={{ background: 'rgba(226, 176, 73, 0.15)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
            <FiActivity /> Chuyên Gia Thẩm Mỹ Ứng Dụng AI
          </div>
          <h1 className="hero-title mb-2">Hệ Thống Phân Tích Da JANUS Pro</h1>
          <p className="hero-subtitle mx-auto" style={{ maxWidth: 820 }}>
            Giải mã toàn diện chỉ số thiết bị đo da chuyên sâu: Nhận diện 12 tình trạng da IF-THEN,
            phân loại hệ 4 trục (D/O, S/R, P/N, W/T), kiểm soát cổng an toàn hoạt chất & định vị chính xác vị trí danh pháp INCI.
          </p>
        </div>

        {offlineNotice && (
          <Alert variant="warning" className="d-flex align-items-center gap-2 py-2">
            <FiInfo className="flex-shrink-0" />
            <small>{offlineNotice}</small>
          </Alert>
        )}

        {/* Khối Nạp Dữ Liệu & Thiết Lập Cổng An Toàn */}
        <Card className="glass-card mb-4 border-0">
          <Card.Header className="bg-transparent border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2 py-3" style={{ borderColor: 'var(--border-color)' }}>
            <div className="d-flex align-items-center gap-2">
              <FiFileText style={{ color: 'var(--accent)', fontSize: '1.25rem' }} />
              <h5 className="mb-0 text-white font-weight-bold">Báo Cáo Đo Da & Bối Cảnh An Toàn</h5>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <label className="btn btn-warning btn-sm mb-0 d-flex align-items-center gap-1 cursor-pointer fw-bold shadow-sm">
                {analyzingPdf ? <Spinner size="sm" animation="border" /> : <FiUploadCloud />}
                {analyzingPdf ? 'Đang bóc tách PDF...' : 'Tải Phiếu Đo Da (.PDF)'}
                <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} disabled={analyzingPdf} />
              </label>
              <label className="btn btn-outline-info btn-sm mb-0 d-flex align-items-center gap-1 cursor-pointer">
                <FiPackage /> Nạp Tệp JSON
                <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={loadSampleCaseData}
                disabled={loadingSample || loading || analyzingPdf}
                className="d-flex align-items-center gap-1"
              >
                {loadingSample ? <Spinner size="sm" animation="border" /> : <FiRefreshCw />}
                Nạp Ca Mẫu
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowJsonEditor(!showJsonEditor)}
              >
                {showJsonEditor ? 'Ẩn Mã JSON' : 'Xem / Sửa JSON'}
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            <Row className="g-4">
              {/* Thông tin ca đo hiện tại */}
              <Col lg={4} md={12}>
                <div className="p-3 rounded-3 h-100" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                  <h6 className="text-white mb-3 d-flex align-items-center gap-2">
                    <FiUser style={{ color: 'var(--accent)' }} /> Thông Tin Khách Hàng
                  </h6>
                  {caseInput?.metadata ? (
                    <div className="small text-secondary">
                      <div className="d-flex justify-content-between py-1 border-bottom border-dark">
                        <span>Mã hồ sơ:</span>
                        <strong className="text-white">{caseInput.metadata.case_id}</strong>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom border-dark">
                        <span>Độ tuổi:</span>
                        <strong className="text-white">{caseInput.metadata.age_years} tuổi</strong>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom border-dark">
                        <span>Giới tính:</span>
                        <strong className="text-white">{caseInput.metadata.sex_reported === 'F' ? 'Nữ' : 'Nam'}</strong>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom border-dark">
                        <span>Ngày đo:</span>
                        <strong className="text-white">{caseInput.metadata.report_date}</strong>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom border-dark">
                        <span>Mã da in:</span>
                        <Badge bg="primary">{caseInput.skin_type_report?.code_as_printed || 'Chưa có'}</Badge>
                      </div>
                      <div className="d-flex justify-content-between py-1">
                        <span>Bản dựng phần mềm:</span>
                        <span className="text-warning">{caseInput.metadata.assumed_software_build}</span>
                      </div>
                      {caseInput.metadata.version_warning && (
                        <div className="mt-2 p-2 rounded small" style={{ background: 'rgba(255, 193, 7, 0.1)', color: '#ffc107', fontSize: '0.75rem' }}>
                          ⚠️ {caseInput.metadata.version_warning}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted small mb-0">Chưa có thông tin ca đo. Nhấn nút "Tải ca mẫu" ở trên.</p>
                  )}
                </div>
              </Col>

              {/* Bối cảnh kiểm soát an toàn (Safety Gates Context) */}
              <Col lg={8} md={12}>
                <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                  <h6 className="text-white mb-2 d-flex align-items-center gap-2">
                    <FiShield style={{ color: 'var(--accent)' }} /> Bối Cảnh An Toàn & Tiền Sử Da Liễu
                  </h6>
                  <p className="small text-secondary mb-3">
                    Hệ thống sẽ đối chiếu các tiêu chí an toàn dưới đây với bộ luật hoạt chất để tự động kích hoạt Cổng an toàn (APPROVED, CONDITIONAL, HOLD hoặc BLOCKED).
                  </p>

                  <Row className="g-2">
                    <Col md={6}>
                      <Form.Check
                        type="switch"
                        id="pregnancy-check"
                        label="Đang mang thai hoặc cho con bú"
                        checked={safetyContext.is_pregnant_or_breastfeeding}
                        onChange={(e) => handleSafetyChange('is_pregnant_or_breastfeeding', e.target.checked)}
                        className="text-white small py-1"
                      />
                      <small className="text-muted d-block ps-4 ms-2" style={{ fontSize: '0.75rem' }}>
                        → Tự động kích hoạt cổng chặn chống chỉ định đối với nhóm Retinoid
                      </small>
                    </Col>

                    <Col md={6}>
                      <Form.Check
                        type="switch"
                        id="comedones-check"
                        label="Đã xác nhận có mụn ẩn / bít tắc thực tế"
                        checked={safetyContext.has_visible_comedones_confirmed}
                        onChange={(e) => handleSafetyChange('has_visible_comedones_confirmed', e.target.checked)}
                        className="text-white small py-1"
                      />
                      <small className="text-muted d-block ps-4 ms-2" style={{ fontSize: '0.75rem' }}>
                        → Điều kiện bắt buộc để mở khóa dùng Salicylic Acid (BHA)
                      </small>
                    </Col>

                    <Col md={6}>
                      <Form.Check
                        type="switch"
                        id="irritated-check"
                        label="Da hiện đang kích ứng, đỏ rát hoặc tổn thương"
                        checked={safetyContext.skin_currently_irritated}
                        onChange={(e) => handleSafetyChange('skin_currently_irritated', e.target.checked)}
                        className="text-white small py-1"
                      />
                      <small className="text-muted d-block ps-4 ms-2" style={{ fontSize: '0.75rem' }}>
                        → Tạm hoãn (HOLD) các treatment mạnh, ưu tiên hoạt chất phục hồi
                      </small>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small text-secondary mb-1">Tiền sử dị ứng hoạt chất (phân tách dấu phẩy):</Form.Label>
                        <Form.Control
                          size="sm"
                          className="form-control-dark"
                          placeholder="vd: Salicylic Acid, Retinoid..."
                          value={safetyContext.known_allergies}
                          onChange={(e) => handleSafetyChange('known_allergies', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              </Col>

              {/* Trình soạn JSON trực tiếp (nếu mở) */}
              {showJsonEditor && (
                <Col xs={12}>
                  <Form.Group className="mt-2">
                    <Form.Label className="text-secondary small">Dữ liệu JSON đầu vào (chuẩn hóa máy đo JANUS Pro):</Form.Label>
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
                <FiAlertTriangle className="text-warning" />
                <span>Quy trình vận hành theo thuật toán hệ chuyên gia Rule-based (FastAPI Engine)</span>
              </div>
              <Button
                className="btn-accent px-4 py-2 font-weight-bold d-flex align-items-center gap-2"
                onClick={handleRunAnalysis}
                disabled={loading || !caseInput}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" />
                    Đang chạy 6 giai đoạn phân tích...
                  </>
                ) : (
                  <>
                    <FiActivity /> Thực Hiện Phân Tích Toàn Diện
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
              <Alert variant="success" className="d-flex align-items-center justify-content-between py-2 px-3 mb-4 rounded-3 border-0 shadow-sm" style={{ background: 'rgba(25, 135, 84, 0.2)', border: '1px solid rgba(25, 135, 84, 0.4)' }}>
                <div className="d-flex align-items-center gap-2 text-white">
                  <FiCheckCircle className="text-success fs-5" />
                  <span>Đang hiển thị kết quả phân tích thực tế từ tệp PDF: <strong className="text-warning">{analysisResult.source_filename}</strong></span>
                </div>
                <Badge bg="success" className="px-2 py-1">Bóc tách PDF thực tế</Badge>
              </Alert>
            )}
            <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
              <h3 className="section-title mb-0">Kết Quả Phân Tích & Tư Vấn Da Liễu</h3>
              <Badge bg="success" className="px-3 py-2 fs-6">
                <FiCheckCircle className="me-1" /> Ca phân tích: {analysisResult.metadata_and_version_check?.case_id}
              </Badge>
            </div>

            {/* Thanh Tabs phân tầng kết quả */}
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-4 custom-nav-tabs"
            >
              <Tab eventKey="conditions" title={<span><FiActivity className="me-1" /> 12 Tình Trạng Da</span>}>
                <Card className="glass-card border-0">
                  <Card.Header className="bg-transparent border-bottom py-3" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <h5 className="mb-0 text-white font-weight-bold">
                        Đánh Giá Động 12 Quy Tắc Tình Trạng Da (Bộ Luật IF-THEN)
                      </h5>
                      <div>
                        <Badge bg="danger" className="me-2 px-2 py-1">
                          Kích hoạt: {analysisResult.stage_2_skin_conditions?.filter(c => c.status_code === 2).length}
                        </Badge>
                        <Badge bg="success" className="px-2 py-1">
                          Không kích hoạt: {analysisResult.stage_2_skin_conditions?.filter(c => c.status_code === 1).length}
                        </Badge>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table className="table-dark-custom align-middle mb-0" hover>
                        <thead>
                          <tr>
                            <th>Mã Quy Tắc & Vấn Đề</th>
                            <th>Trạng Thái</th>
                            <th>Căn Cứ Nhận Định Thiết Bị (Cụ Thể)</th>
                            <th>Giới Hạn Y Khoa Bắt Buộc (Không Suy Diễn)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysisResult.stage_2_skin_conditions?.map((item) => (
                            <tr key={item.condition_id} style={{ background: item.status_code === 2 ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                              <td style={{ minWidth: '220px' }}>
                                <div className="font-weight-bold text-white">{item.display_name_vi}</div>
                                <code className="small text-secondary" style={{ fontSize: '0.75rem' }}>{item.condition_id}</code>
                                <div className="mt-1">
                                  <Badge bg="secondary" style={{ fontSize: '0.65rem' }}>Loại: {item.type}</Badge>
                                </div>
                              </td>
                              <td style={{ minWidth: '160px' }}>
                                {renderConditionBadge(item.status_code)}
                              </td>
                              <td style={{ minWidth: '320px' }}>
                                <div className="small text-light" style={{ lineHeight: '1.5' }}>
                                  {item.evaluation_basis}
                                </div>
                              </td>
                              <td style={{ minWidth: '260px' }}>
                                <div className="small text-warning" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                                  ⚠️ Không dùng để kết luận: <span className="text-light">{item.not_established}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="skintype" title={<span><FiLayers className="me-1" /> Phân Loại Da 4 Trục</span>}>
                <Row className="g-4">
                  {/* Hồ sơ 16 loại da */}
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
                              {analysisResult.stage_3_skin_type?.profile_16?.Type_Name_VI || 'Hồ sơ chuyên biệt'}
                            </Badge>
                          </div>
                        </div>

                        <Row className="g-3">
                          <Col md={6}>
                            <div className="p-3 rounded h-100" style={{ background: 'rgba(255,255,255,0.03)' }}>
                              <h6 className="text-white mb-2">🎯 Trọng Tâm Chăm Sóc Nền Tảng:</h6>
                              <p className="text-light small mb-0">{analysisResult.stage_3_skin_type?.profile_16?.Main_Care_Focus}</p>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="p-3 rounded h-100" style={{ background: 'rgba(255,255,255,0.03)' }}>
                              <h6 className="text-white mb-2">🧴 Nhóm Hoạt Chất Khuyến Cáo:</h6>
                              <p className="text-accent small mb-0">{analysisResult.stage_3_skin_type?.profile_16?.Suggested_Ingredient_Groups}</p>
                            </div>
                          </Col>
                          <Col xs={12}>
                            <div className="p-3 rounded" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                              <h6 className="text-danger mb-1">⚠️ Cảnh Báo Bắt Buộc (Không Tự Suy Diễn):</h6>
                              <p className="text-light small mb-0">{analysisResult.stage_3_skin_type?.profile_16?.Cautions_and_Do_Not_Auto_Assume}</p>
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
                        <h6 className="mb-0 text-white font-weight-bold">Giải Mã 4 Trục Thành Phần Cốt Lõi</h6>
                      </Card.Header>
                      <Card.Body className="p-3">
                        <Row className="g-3">
                          {analysisResult.stage_3_skin_type?.axes_breakdown?.map((ax) => (
                            <Col md={6} key={ax.Code}>
                              <div className="p-3 rounded h-100" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <span className="badge bg-primary px-2 py-1">Trục [{ax.Code}] - {ax['Vietnamese meaning']}</span>
                                  <span className="text-accent small font-weight-bold">{ax.reported_percent}%</span>
                                </div>
                                <div className="small text-light mb-2">
                                  <strong>Định hướng:</strong> {ax['Recommendation direction']}
                                </div>
                                <div className="small text-warning" style={{ fontSize: '0.75rem' }}>
                                  <strong>Giới hạn:</strong> {ax['Important limitation']}
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
                        <h6 className="mb-0 text-white font-weight-bold">Giải Mã Mã Phụ (+A/-A, +E/-E)</h6>
                      </Card.Header>
                      <Card.Body className="p-3">
                        {analysisResult.stage_3_skin_type?.modifiers_evaluation?.map((mod) => (
                          <div key={mod.code} className="mb-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="badge bg-warning text-dark font-weight-bold">Mã [{mod.code}]</span>
                              <span className="text-white small">Tín hiệu: {mod.reported_percent}%</span>
                            </div>
                            <div className="small text-light mb-1">
                              <strong>Diễn giải:</strong> {mod.working_interpretation}
                            </div>
                            <div className="small text-danger" style={{ fontSize: '0.75rem' }}>
                              ⚠️ <strong>Cảnh báo:</strong> {mod.caution}
                            </div>
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="actives" title={<span><FiShield className="me-1" /> Đề Xuất Hoạt Chất & Cổng An Toàn</span>}>
                <Card className="glass-card border-0">
                  <Card.Header className="bg-transparent border-bottom py-3" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <h5 className="mb-0 text-white font-weight-bold">
                        Danh Mục Hoạt Chất Đề Xuất & Cổng Kiểm Soát An Toàn (Safety Gates)
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
                            <th>Tên Hoạt Chất</th>
                            <th>Trạng Thái Cổng An Toàn</th>
                            <th>Tình Trạng Kích Hoạt & Mục Tiêu Chăm Sóc</th>
                            <th>Lưu Ý & Dẫn Chứng Khoa Học</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysisResult.stage_4_ingredient_recommendations?.active_candidates?.map((act) => (
                            <tr key={act.ingredient}>
                              <td style={{ minWidth: '160px' }}>
                                <h6 className="text-white mb-0 font-weight-bold">{act.ingredient}</h6>
                              </td>
                              <td style={{ minWidth: '180px' }}>
                                {renderGateBadge(act.gate_status)}
                              </td>
                              <td style={{ minWidth: '280px' }}>
                                <div className="small text-light mb-2">
                                  <strong>Kích hoạt bởi:</strong>
                                  <ul className="ps-3 mb-1 text-secondary" style={{ fontSize: '0.75rem' }}>
                                    {act.triggered_by_conditions?.map((c, i) => (
                                      <li key={i}>{c}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="small text-secondary" style={{ fontSize: '0.75rem' }}>
                                  <strong>Mục tiêu:</strong> {act.care_goals?.join(', ')}
                                </div>
                              </td>
                              <td style={{ minWidth: '320px' }}>
                                {act.safety_and_use_gates?.length > 0 && (
                                  <div className="p-2 rounded mb-2" style={{ background: 'rgba(255, 193, 7, 0.08)', fontSize: '0.75rem' }}>
                                    <strong className="text-warning">Lưu ý an toàn:</strong>
                                    <ul className="ps-3 mb-0 text-light">
                                      {act.safety_and_use_gates.map((g, idx) => (
                                        <li key={idx}>{g}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {act.published_evidence?.map((ev, evIdx) => (
                                  <div key={evIdx} className="small text-secondary" style={{ fontSize: '0.75rem' }}>
                                    <span className="badge bg-secondary me-1">{ev.source_id}</span>
                                    <span>{ev.published_evidence}</span>
                                  </div>
                                ))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="products" title={<span><FiPackage className="me-1" /> Sản Phẩm Tham Khảo & Vị Trí INCI</span>}>
                <Row className="g-4">
                  {/* Top sản phẩm kết hợp nhiều hoạt chất */}
                  <Col xs={12}>
                    <Card className="glass-card border-0">
                      <Card.Header className="bg-transparent border-bottom py-3" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                          <h5 className="mb-0 text-white font-weight-bold">
                            Top Sản Phẩm Tối Ưu Kết Hợp Nhiều Hoạt Chất Đề Xuất (Multi-Active Synergy)
                          </h5>
                          <small className="text-secondary">Ưu tiên sản phẩm đáp ứng đồng thời nhiều nhóm hoạt chất</small>
                        </div>
                      </Card.Header>
                      <Card.Body className="p-3">
                        <Alert variant="secondary" className="small py-2 mb-3 bg-dark border-0 text-muted">
                          ℹ️ {analysisResult.stage_5_product_matches?.important_notice}
                        </Alert>

                        <Row className="g-3">
                          {analysisResult.stage_5_product_matches?.top_multi_active_products?.map((prod, index) => (
                            <Col md={6} lg={4} key={prod.product_id}>
                              <div className="p-3 rounded h-100" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <span className="badge bg-warning text-dark font-weight-bold">Top #{index + 1}</span>
                                  <Badge bg="success">{prod.matched_active_count} nhóm hoạt chất</Badge>
                                </div>
                                <h6 className="text-white mb-2" style={{ fontSize: '0.95rem' }}>{prod.product_name}</h6>
                                <div className="small text-secondary mb-2" style={{ fontSize: '0.75rem' }}>
                                  Mã sản phẩm: <code>{prod.product_id}</code>
                                </div>
                                <div className="mt-2 pt-2 border-top border-dark">
                                  <span className="small text-muted d-block mb-1">Vị trí thành phần INCI thực tế:</span>
                                  <ul className="ps-3 mb-0 small text-light" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                                    {prod.matched_inci_summary?.map((inci, iIdx) => (
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
                  <Col xs={12}>
                    <Card className="glass-card border-0">
                      <Card.Header className="bg-transparent border-bottom py-3" style={{ borderColor: 'var(--border-color)' }}>
                        <h5 className="mb-0 text-white font-weight-bold">
                          Truy Xuất Theo Từng Hoạt Chất (Ưu Tiên Vị Trí Đầu Bảng Thành Phần)
                        </h5>
                      </Card.Header>
                      <Card.Body className="p-3">
                        {analysisResult.stage_5_product_matches?.by_active_ingredient && (
                          <Row className="g-3">
                            {Object.entries(analysisResult.stage_5_product_matches.by_active_ingredient).map(([activeName, info]) => (
                              <Col md={6} lg={4} key={activeName}>
                                <div className="p-3 rounded h-100" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="text-accent mb-0 font-weight-bold">{activeName}</h6>
                                    <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>{info.total_matched_products} sản phẩm</span>
                                  </div>
                                  <div className="mt-2">
                                    {info.sample_products?.map((sp) => (
                                      <div key={sp.product_id} className="mb-2 pb-2 border-bottom border-dark small">
                                        <div className="text-white font-weight-bold" style={{ fontSize: '0.8rem' }}>{sp.product_name}</div>
                                        <div className="text-secondary" style={{ fontSize: '0.7rem' }}>
                                          {sp.matched_inci_details?.join(', ')}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </Col>
                            ))}
                          </Row>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="raw" title={<span><FiSliders className="me-1" /> Toàn Bộ Chỉ Số Đo</span>}>
                <Card className="glass-card border-0">
                  <Card.Header className="bg-transparent border-bottom py-3" style={{ borderColor: 'var(--border-color)' }}>
                    <h5 className="mb-0 text-white font-weight-bold">Chi Tiết Tất Cả Chỉ Số Thiết Bị Đo JANUS Pro</h5>
                  </Card.Header>
                  <Card.Body className="p-3">
                    <Row className="g-3">
                      {caseInput?.whole_face_features && Object.entries(caseInput.whole_face_features).map(([key, val]) => (
                        <Col md={4} sm={6} key={key}>
                          <div className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                            <div className="d-flex justify-content-between mb-1">
                              <span className="text-white font-weight-bold">{val.feature_name_vi || key}</span>
                              <Badge bg="primary">{val.report_value}</Badge>
                            </div>
                            <div className="small text-secondary">
                              Tham chiếu: <strong className="text-white">{val.comparison_value}</strong> ({val.comparison_basis})
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

            {/* Khối Tuyên Bố Miễn Trừ Trách Nhiệm Y Khoa (Medical Disclaimer) */}
            <div className="mt-4 p-3 rounded-3" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
              <div className="d-flex align-items-center gap-2 mb-1 text-danger font-weight-bold">
                <FiAlertTriangle /> Tuyên Bố Miễn Trừ Trách Nhiệm Y Khoa Bắt Buộc
              </div>
              <p className="small text-light mb-0" style={{ lineHeight: '1.6' }}>
                {analysisResult.medical_disclaimer}
              </p>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default SkinAnalysisPage;
