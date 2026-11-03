import { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Giả lập đăng nhập nhanh cho học viên/khách hàng
    const userRole = email.includes('admin') ? 'admin' : 'customer';
    login({ name: email.split('@')[0], email, role: userRole }, 'demo_token_123');
    toast.success(`Đăng nhập thành công với vai trò ${userRole}!`);
    navigate('/');
  };

  return (
    <Container className="py-5 page-enter d-flex justify-content-center">
      <Card className="glass-card border-0 p-4 w-100" style={{ maxWidth: '440px' }}>
        <h3 className="text-white text-center mb-1 font-weight-bold">Đăng Nhập</h3>
        <p className="text-secondary text-center small mb-4">Hệ thống thẩm mỹ & chăm sóc da TechShop</p>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="text-secondary small">Email đăng nhập</Form.Label>
            <Form.Control type="email" required className="form-control-dark" placeholder="admin@shop.com hoặc email của bạn" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="text-secondary small">Mật khẩu</Form.Label>
            <Form.Control type="password" required className="form-control-dark" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Form.Group>
          <Button type="submit" className="btn-accent w-100 py-2 font-weight-bold mb-3">
            Đăng Nhập
          </Button>
          <div className="text-center small text-secondary">
            Chưa có tài khoản? <Link to="/register" className="text-accent text-decoration-none">Đăng ký ngay</Link>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default LoginPage;
