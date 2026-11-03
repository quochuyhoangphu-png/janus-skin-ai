import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiTrash2, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <Container className="py-5 text-center page-enter">
        <div className="glass-card p-5 d-inline-block" style={{ maxWidth: '500px' }}>
          <FiShoppingBag size={64} className="text-secondary mb-3" />
          <h4 className="text-white mb-2">Giỏ hàng của bạn đang trống</h4>
          <p className="text-secondary small mb-4">Hãy khám phá các sản phẩm phù hợp với tình trạng da của bạn!</p>
          <Link to="/products" className="btn btn-accent px-4 py-2">Khám phá sản phẩm</Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5 page-enter">
      <h2 className="section-title mb-4">Giỏ Hàng Của Bạn</h2>
      <Row className="g-4">
        <Col lg={8}>
          <div className="glass-card p-0 overflow-hidden">
            <Table className="table-dark-custom mb-0" hover responsive>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Giá</th>
                  <th>Số lượng</th>
                  <th>Thành tiền</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                        <div>
                          <div className="text-white font-weight-bold">{item.name}</div>
                          <small className="text-secondary">{item.category?.name}</small>
                        </div>
                      </div>
                    </td>
                    <td>{formatPrice(item.price)}</td>
                    <td>
                      <div className="d-flex align-items-center border border-secondary rounded px-2" style={{ width: 'fit-content' }}>
                        <button className="btn btn-sm text-white px-1" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span className="px-2 text-white small">{item.quantity}</span>
                        <button className="btn btn-sm text-white px-1" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </td>
                    <td className="text-accent font-weight-bold">{formatPrice(item.price * item.quantity)}</td>
                    <td>
                      <button className="btn btn-sm text-danger" onClick={() => removeFromCart(item.id)}><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <div className="d-flex justify-content-between mt-3">
            <Link to="/products" className="btn btn-outline-light btn-sm d-flex align-items-center gap-1">
              <FiArrowLeft /> Tiếp tục chọn sản phẩm
            </Link>
            <Button variant="outline-danger" size="sm" onClick={clearCart}>
              Xóa toàn bộ giỏ hàng
            </Button>
          </div>
        </Col>
        <Col lg={4}>
          <div className="glass-card p-4">
            <h5 className="text-white mb-3">Tóm Tắt Đơn Hàng</h5>
            <div className="d-flex justify-content-between text-secondary mb-2 small">
              <span>Tạm tính:</span>
              <span className="text-white">{formatPrice(totalPrice)}</span>
            </div>
            <div className="d-flex justify-content-between text-secondary mb-3 small">
              <span>Phí vận chuyển:</span>
              <span className="text-success">Miễn phí</span>
            </div>
            <div className="border-top border-dark pt-3 d-flex justify-content-between mb-4">
              <strong className="text-white">Tổng cộng:</strong>
              <strong className="text-accent fs-5">{formatPrice(totalPrice)}</strong>
            </div>
            <Link to="/checkout" className="btn btn-accent w-100 py-2 font-weight-bold text-center d-block">
              Tiến Hành Đặt Hàng
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CartPage;
