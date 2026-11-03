import { Container, Row, Col } from 'react-bootstrap';
import { FiTruck, FiShield, FiHeadphones, FiRefreshCw, FiActivity } from 'react-icons/fi';

const features = [
  { icon: <FiActivity />, title: 'Phân Tích Da JANUS Pro', desc: 'Ứng dụng thuật toán AI và chuẩn hóa dữ liệu 6 giai đoạn theo chuẩn thẩm mỹ da liễu.' },
  { icon: <FiShield />, title: 'Cổng An Toàn Hoạt Chất', desc: 'Kiểm soát chống chỉ định thai kỳ, bít tắc mụn thực tế và tình trạng kích ứng da.' },
  { icon: <FiRefreshCw />, title: 'Định Vị Danh Pháp INCI', desc: 'Truy xuất trực tiếp vị trí thành phần trong công thức mỹ phẩm thực tế.' },
  { icon: <FiHeadphones />, title: 'Tư Vấn Thẩm Mỹ 24/7', desc: 'Đội ngũ chuyên môn luôn sẵn sàng giải đáp phác đồ chăm sóc làn da của bạn.' },
];

const AboutPage = () => (
  <div className="page-enter">
    <section className="hero-section" style={{ padding: '4rem 0' }}>
      <Container className="position-relative" style={{ zIndex: 1 }}>
        <h1 className="hero-title text-center">Về Nền Tảng TechShop & JANUS AI</h1>
        <p className="hero-subtitle text-center mx-auto" style={{ maxWidth: 700 }}>
          Dự án nghiên cứu & ứng dụng Công nghệ Thẩm mỹ: Kết nối trực tiếp kết quả đo từ thiết bị phân tích da JANUS Pro
          với hệ chuyên gia phân loại da 4 trục và cá nhân hóa hoạt chất mỹ phẩm.
        </p>
      </Container>
    </section>
    <Container className="py-5">
      <Row className="g-4 mb-5">
        {features.map((f, i) => (
          <Col key={i} md={3} sm={6}>
            <div className="glass-card p-4 h-100">
              <div className="text-accent fs-3 mb-2">{f.icon}</div>
              <h5 className="text-white mb-2" style={{ fontSize: '1rem' }}>{f.title}</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 0 }}>{f.desc}</p>
            </div>
          </Col>
        ))}
      </Row>
      <div className="glass-card p-4">
        <Row className="align-items-center g-4">
          <Col md={7}>
            <h3 style={{ color: 'var(--accent)' }}>Sứ Mệnh Công Nghệ Thẩm Mỹ</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              Hệ thống được phát triển nhằm thu hẹp khoảng cách giữa kết quả đo lường khách quan từ máy phân tích hình ảnh đa phổ JANUS Pro và việc lựa chọn sản phẩm mỹ phẩm phù hợp trên thị trường.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              Thay vì chẩn đoán bệnh lý y khoa, hệ thống tập trung vào việc <strong>nhận diện tình trạng da thẩm mỹ</strong>, tôn trọng các giới hạn an toàn da liễu và hỗ trợ người tiêu dùng hiểu rõ vị trí thành phần thực tế (INCI) trong từng sản phẩm chăm sóc.
            </p>
          </Col>
          <Col md={5} className="text-center">
            <Row className="g-3">
              <Col xs={6}><div className="glass-card p-3"><div className="text-accent fs-3 font-weight-bold">12</div><small className="text-secondary">Quy tắc IF-THEN</small></div></Col>
              <Col xs={6}><div className="glass-card p-3"><div className="text-accent fs-3 font-weight-bold">4</div><small className="text-secondary">Trục phân loại da</small></div></Col>
              <Col xs={6}><div className="glass-card p-3"><div className="text-accent fs-3 font-weight-bold">100%</div><small className="text-secondary">Cổng an toàn</small></div></Col>
              <Col xs={6}><div className="glass-card p-3"><div className="text-accent fs-3 font-weight-bold">2,400+</div><small className="text-secondary">Sản phẩm INCI</small></div></Col>
            </Row>
          </Col>
        </Row>
      </div>
    </Container>
  </div>
);

export default AboutPage;
