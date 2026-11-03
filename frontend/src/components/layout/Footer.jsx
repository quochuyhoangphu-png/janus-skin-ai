import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiHeart, FiActivity } from 'react-icons/fi';

const Footer = () => (
  <footer className="mt-5 py-4 border-top" style={{ borderColor: 'var(--border-color)', background: 'rgba(11, 19, 43, 0.95)' }}>
    <Container>
      <Row className="gy-3 align-items-center">
        <Col md={6} className="text-center text-md-start">
          <div className="d-flex align-items-center gap-2 justify-content-center justify-content-md-start mb-1">
            <span className="brand-logo" style={{ fontSize: '1.1rem' }}>✨ TechShop</span>
            <span className="text-secondary">|</span>
            <span className="text-accent small d-flex align-items-center gap-1">
              <FiActivity /> JANUS Pro AI Skin Analysis
            </span>
          </div>
          <p className="text-secondary small mb-0">
            Ứng dụng hỗ trợ phân tích da liễu thẩm mỹ & đề xuất phác đồ hoạt chất cá nhân hóa.
          </p>
        </Col>
        <Col md={6} className="text-center text-md-end">
          <div className="d-flex justify-content-center justify-content-md-end gap-3 small mb-1">
            <Link to="/" className="text-secondary text-decoration-none">Trang chủ</Link>
            <Link to="/skin-analysis" className="text-accent text-decoration-none">Phân tích da</Link>
            <Link to="/about" className="text-secondary text-decoration-none">Giới thiệu</Link>
          </div>
          <small className="text-muted">
            Phát triển phục vụ nghiên cứu & ứng dụng Công nghệ Thẩm mỹ <FiHeart className="text-danger" />
          </small>
        </Col>
      </Row>
    </Container>
  </footer>
);

export default Footer;
