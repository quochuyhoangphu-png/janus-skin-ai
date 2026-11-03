import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { FiShoppingCart, FiArrowLeft, FiCheck, FiShield } from 'react-icons/fi';
import { getProductByIdAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    getProductByIdAPI(id).then(res => {
      setProduct(res.data.product);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Container className="py-5 text-center"><div className="skeleton" style={{ height: '300px' }}></div></Container>;
  if (!product) return <Container className="py-5 text-center"><h3 className="text-white">Không tìm thấy sản phẩm!</h3><Link to="/" className="btn btn-accent mt-3">Quay lại</Link></Container>;

  const handleAdd = () => {
    addToCart(product, quantity);
    toast.success(`Đã thêm ${quantity} x ${product.name} vào giỏ!`);
  };

  return (
    <Container className="py-5 page-enter">
      <Link to="/products" className="text-secondary text-decoration-none d-inline-flex align-items-center gap-1 mb-4">
        <FiArrowLeft /> Quay lại danh sách
      </Link>
      <Row className="g-4 align-items-center">
        <Col md={6}>
          <div className="glass-card p-3 rounded-4 overflow-hidden">
            <img src={product.image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60'} alt={product.name} className="w-100 rounded-3" style={{ maxHeight: '420px', objectFit: 'cover' }} />
          </div>
        </Col>
        <Col md={6}>
          <div className="ps-md-4">
            <Badge bg="warning" text="dark" className="mb-2">{product.category?.name || 'Mỹ phẩm thẩm mỹ'}</Badge>
            <h2 className="text-white mb-3 font-weight-bold">{product.name}</h2>
            <div className="d-flex align-items-baseline gap-3 mb-4">
              <span className="text-accent fs-2 font-weight-bold">{formatPrice(product.price)}</span>
              {product.original_price && (
                <span className="text-muted text-decoration-line-through fs-5">{formatPrice(product.original_price)}</span>
              )}
            </div>
            <p className="text-secondary mb-4" style={{ lineHeight: '1.7' }}>
              {product.description || 'Sản phẩm chăm sóc da đạt tiêu chuẩn thẩm mỹ da liễu, công thức chọn lọc giúp tối ưu hóa hiệu quả phục hồi và nuôi dưỡng hàng rào bảo vệ sinh học.'}
            </p>

            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="d-flex align-items-center border border-secondary rounded px-2">
                <button className="btn btn-sm text-white px-2" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span className="px-3 text-white">{quantity}</span>
                <button className="btn btn-sm text-white px-2" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <Button className="btn-accent px-4 py-2 d-flex align-items-center gap-2" onClick={handleAdd}>
                <FiShoppingCart /> Thêm Vào Giỏ Hàng
              </Button>
            </div>

            <div className="border-top border-dark pt-3 text-secondary small">
              <div className="d-flex align-items-center gap-2 mb-1"><FiCheck className="text-success" /> Cam kết chính hãng 100%</div>
              <div className="d-flex align-items-center gap-2"><FiShield className="text-accent" /> Tư vấn theo kết quả phân tích JANUS Pro</div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailPage;
