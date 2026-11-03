import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { FiShoppingCart, FiUser, FiLogOut, FiActivity } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <Navbar expand="lg" className="navbar-custom sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <span className="brand-logo">✨ TechShop</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
            <Nav.Link as={Link} to="/products">Sản phẩm</Nav.Link>
            <Nav.Link as={Link} to="/skin-analysis" className="nav-highlight-link">
              <span className="badge rounded-pill me-1" style={{ background: 'var(--accent)', color: '#000' }}>AI</span>
              Phân tích da JANUS
            </Nav.Link>
            <Nav.Link as={Link} to="/about">Giới thiệu</Nav.Link>
            {user?.role === 'admin' && (
              <Nav.Link as={Link} to="/admin" className="text-warning">Quản trị</Nav.Link>
            )}
          </Nav>
          <Nav className="align-items-center gap-3">
            <Nav.Link as={Link} to="/cart" className="position-relative">
              <FiShoppingCart size={20} />
              {totalItems > 0 && (
                <Badge bg="warning" text="dark" pill className="cart-badge">
                  {totalItems}
                </Badge>
              )}
            </Nav.Link>

            {user ? (
              <div className="d-flex align-items-center gap-2">
                <Nav.Link as={Link} to="/my-orders" className="d-flex align-items-center gap-1">
                  <FiUser /> {user.name}
                </Nav.Link>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  title="Đăng xuất"
                >
                  <FiLogOut />
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-sm btn-outline-light">Đăng nhập</Link>
                <Link to="/register" className="btn btn-sm btn-accent">Đăng ký</Link>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
