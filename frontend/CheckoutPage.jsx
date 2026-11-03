import { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const CheckoutPage = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);

  if (cart.length === 0) {
    return (
      <Container className="py-5 text-center page-enter">
        <h4 className="text-white mb-3">Giỏ hàng của bạn đang trống!</h4>
        <Link to="/products" className="btn btn-accent">Mua sắm ngay</Link>
      </Container>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      clearCart();
      toast.success('Đặt hàng thành công! Đơn hàng đang được xử lý.');
      setLoading(false);
      navigate('/');
    }, 1000);
  };

  return (
    <Container className="py-5 page-enter">
      <h2 className="section-title mb-4">Thông Tin Thanh Toán (COD)</h2>
      <Row className="g-4">
        <Col lg={7}>
          <div className="glass-card p-4">
            <h5 className="text-white mb-3">Thông Tin Giao Hàng</h5>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="text-secondary small">Họ và tên người nhận *</Form.Label>
                <Form.Control required className="form-control-dark" placeholder="Nguyễn Văn A" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="text-secondary small">Số điện thoại liên hệ *</Form.Label>
                <Form.Control required className="form-control-dark" placeholder="0912345678" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="text-secondary small">Địa chỉ nhận hàng *</Form.Label>
                <Form.Control required className="form-control-dark" placeholder="Số nhà, tên đường, phường/xã, quận/huyện..." value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="text-secondary small">Ghi chú đơn hàng</Form.Label>
                <Form.Control as="textarea" rows={2} className="form-control-dark" placeholder="Giao giờ hành chính, gọi trước khi giao..." value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
              </Form.Group>
              <Button type="submit" className="btn-accent w-100 py-2 font-weight-bold" disabled={loading}>
                {loading ? 'Đang xử lý...' : `Xác Nhận Đặt Hàng (${formatPrice(totalPrice)})`}
              </Button>
            </Form>
          </div>
        </Col>
        <Col lg={5}>
          <div className="glass-card p-4">
            <h5 className="text-white mb-3">Đơn Hàng ({cart.length} sản phẩm)</h5>
            <div className="mb-3 max-vh-50 overflow-auto">
              {cart.map(item => (
                <div key={item.id} className="d-flex justify-content-between align-items-center py-2 border-bottom border-dark small">
                  <div>
                    <div className="text-white font-weight-bold">{item.name}</div>
                    <small className="text-secondary">Số lượng: {item.quantity}</small>
                  </div>
                  <span className="text-accent">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-between pt-2 border-top border-dark">
              <strong className="text-white">Tổng tiền:</strong>
              <strong className="text-accent fs-5">{formatPrice(totalPrice)}</strong>
            </div>
            <small className="text-muted d-block mt-3">
              * Hình thức: Thanh toán khi nhận hàng (COD). Miễn phí vận chuyển toàn quốc.
            </small>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage;
