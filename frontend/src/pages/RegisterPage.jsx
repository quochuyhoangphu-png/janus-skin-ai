import { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ name, email, role: 'customer' }, 'demo_token_reg');
    toast.success('Đăng ký tài khoản thành công!');
    navigate('/');
  };

  return (
    <Container className="py-5 page-enter d-flex justify-content-center">
      <Card className="glass-card border-0 p-4 w-100" style={{ maxWidth: '440px' }}>
        <h3 className="text-white text-center mb-1 font-weight-bold">Tạo Tài Khoản Mới</h3>
        <p className="text-secondary text-center small mb-4">Tham gia nhận tư vấn chăm sóc da cá nhân hóa</p>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="text-secondary small">Họ và tên</Form.Label>
            <Form.Control type="text" required className="form-control-dark" placeholder="Nguyễn Văn A" value={name} onChange={(e) => setName(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="text-secondary small">Email</Form.Label>
            <Form.Control type="email" required className="form-control-dark" placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="text-secondary small">Mật khẩu</Form.Label>
            <Form.Control type="password" required className="form-control-dark" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Form.Group>
          <Button type="submit" className="btn-accent w-100 py-2 font-weight-bold mb-3">
            Đăng Ký
          </Button>
          <div className="text-center small text-secondary">
            Đã có tài khoản? <Link to="/login" className="text-accent text-decoration-none">Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default RegisterPage;
