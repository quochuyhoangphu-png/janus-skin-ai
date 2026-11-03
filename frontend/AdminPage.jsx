import { Container, Row, Col, Card } from 'react-bootstrap';
import { FiUsers, FiShoppingBag, FiActivity, FiDollarSign } from 'react-icons/fi';

const AdminPage = () => (
  <Container className="py-5 page-enter">
    <h2 className="section-title mb-4">Bảng Điều Khiển Quản Trị Hệ Thống</h2>
    <Row className="g-3 mb-4">
      <Col md={3} sm={6}>
        <div className="glass-card p-3 text-center">
          <FiShoppingBag className="text-primary fs-3 mb-2" />
          <div className="fs-3 text-white font-weight-bold">24</div>
          <small className="text-secondary">Đơn hàng mới</small>
        </div>
      </Col>
      <Col md={3} sm={6}>
        <div className="glass-card p-3 text-center">
          <FiActivity className="text-accent fs-3 mb-2" />
          <div className="fs-3 text-white font-weight-bold">148</div>
          <small className="text-secondary">Lượt đo da JANUS</small>
        </div>
      </Col>
      <Col md={3} sm={6}>
        <div className="glass-card p-3 text-center">
          <FiUsers className="text-info fs-3 mb-2" />
          <div className="fs-3 text-white font-weight-bold">89</div>
          <small className="text-secondary">Khách hàng đăng ký</small>
        </div>
      </Col>
      <Col md={3} sm={6}>
        <div className="glass-card p-3 text-center">
          <FiDollarSign className="text-success fs-3 mb-2" />
          <div className="fs-3 text-white font-weight-bold">18.5M</div>
          <small className="text-secondary">Doanh thu tháng (VND)</small>
        </div>
      </Col>
    </Row>
    <Card className="glass-card border-0 p-4">
      <h5 className="text-white mb-3">Tình Trạng Kết Nối AI Engine</h5>
      <p className="text-secondary small">
        FastAPI Rule Engine đang được đồng bộ hóa với cơ sở tri thức JANUS Pro 6 giai đoạn. Các quy tắc an toàn được tự động cập nhật khi có phản hồi lâm sàng.
      </p>
    </Card>
  </Container>
);

export default AdminPage;
