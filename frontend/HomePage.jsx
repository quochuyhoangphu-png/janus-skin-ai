import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiActivity, FiArrowRight, FiShield, FiSliders, FiPackage } from 'react-icons/fi';
import ProductCard from '../components/products/ProductCard';
import { getFeaturedProductsAPI, getProductsAPI, getCategoriesAPI } from '../services/api';

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFeaturedProductsAPI(),
      getProductsAPI(),
      getCategoriesAPI()
    ]).then(([featRes, prodRes, catRes]) => {
      setFeatured(featRes.data.products || []);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);
    }).finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(p => {
    const matchCat = !activeCategory || p.category?.id === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="hero-section text-center">
        <Container>
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3" style={{ background: 'rgba(255, 209, 102, 0.15)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
            <FiActivity /> Ứng Dụng Công Nghệ Thẩm Mỹ 4.0
          </div>
          <h1 className="hero-title mb-3">
            Phân Tích Da JANUS Pro AI <br />& Cá Nhân Hóa Hoạt Chất
          </h1>
          <p className="hero-subtitle mx-auto mb-4" style={{ maxWidth: 680 }}>
            Kết nối trực tiếp dữ liệu thiết bị đo da chuyên sâu với hệ chuyên gia y học da liễu.
            Giải mã 4 trục loại da, áp dụng Cổng an toàn hoạt chất & định vị sản phẩm theo danh pháp INCI.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/skin-analysis" className="btn btn-accent px-4 py-2 fs-6 d-flex align-items-center gap-2">
              <FiActivity /> Khám Phá Phân Tích Da AI <FiArrowRight />
            </Link>
            <a href="#products-catalog" className="btn btn-outline-light px-4 py-2 fs-6">
              Xem Sản Phẩm
            </a>
          </div>
        </Container>
      </section>

      {/* Banner 3 Tính năng trọng tâm */}
      <Container className="py-4">
        <Row className="g-3">
          <Col md={4}>
            <div className="glass-card p-4 h-100">
              <div className="feature-icon mb-3 text-accent fs-3"><FiSliders /></div>
              <h5 className="text-white mb-2">12 Tình Trạng Da IF-THEN</h5>
              <p className="text-secondary small mb-0">
                Nhận diện tự động chỉ số lỗ chân lông, bã nhờn, nếp nhăn, porphyrin và sắc tố dựa trên ngưỡng khoa học.
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="glass-card p-4 h-100">
              <div className="feature-icon mb-3 text-accent fs-3"><FiShield /></div>
              <h5 className="text-white mb-2">Cổng Kiểm Soát An Toàn</h5>
              <p className="text-secondary small mb-0">
                Tự động kiểm tra chống chỉ định thai kỳ, da kích ứng, tiền sử dị ứng và xác thực bít tắc mụn trước khi dùng treatment.
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="glass-card p-4 h-100">
              <div className="feature-icon mb-3 text-accent fs-3"><FiPackage /></div>
              <h5 className="text-white mb-2">Định Vị Danh Pháp INCI</h5>
              <p className="text-secondary small mb-0">
                Truy xuất chính xác vị trí hoạt chất trong bảng thành phần và xếp hạng sản phẩm kết hợp đa hoạt chất.
              </p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Sản phẩm nổi bật */}
      {featured.length > 0 && (
        <Container className="py-4">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-accent small text-uppercase">Khuyến nghị chuyên gia</span>
              <h2 className="section-title mb-0">Sản Phẩm Chăm Sóc Nổi Bật</h2>
            </div>
          </div>
          <Row className="g-3">
            {featured.slice(0, 4).map(p => (
              <Col key={p.id} xs={6} md={3}>
                <ProductCard product={p} />
              </Col>
            ))}
          </Row>
        </Container>
      )}

      {/* Danh mục sản phẩm */}
      <Container className="py-5" id="products-catalog">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h2 className="section-title mb-0">Tất Cả Sản Phẩm Chăm Sóc</h2>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Form.Control
              type="text"
              placeholder="Tìm sản phẩm..."
              className="form-control-dark"
              style={{ width: '220px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Lọc theo danh mục */}
        <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
          <button
            className={`category-pill ${!activeCategory ? 'active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            Tất cả
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              className={`category-pill ${activeCategory === c.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Danh sách lưới */}
        <Row className="g-3">
          {filteredProducts.map(p => (
            <Col key={p.id} xs={6} md={4} lg={3}>
              <ProductCard product={p} />
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default HomePage;
