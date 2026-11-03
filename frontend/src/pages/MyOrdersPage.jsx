import { Container, Table, Badge } from 'react-bootstrap';

const MyOrdersPage = () => {
  const sampleOrders = [
    { id: 'DH_1001', date: '2024-03-15', items: 'Serum Niacinamide 10% x1, Gel Dưỡng Phục Hồi B5 x1', total: 710000, status: 'Đang giao' },
    { id: 'DH_1002', date: '2024-03-10', items: 'Kem Chống Nắng Phổ Rộng SPF 50+ x1', total: 380000, status: 'Đã giao' }
  ];

  return (
    <Container className="py-5 page-enter">
      <h2 className="section-title mb-4">Lịch Sử Đơn Hàng Của Bạn</h2>
      <div className="glass-card p-0 overflow-hidden">
        <Table className="table-dark-custom mb-0" hover responsive>
          <thead>
            <tr>
              <th>Mã Đơn</th>
              <th>Ngày Đặt</th>
              <th>Sản Phẩm</th>
              <th>Tổng Tiền</th>
              <th>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {sampleOrders.map(o => (
              <tr key={o.id}>
                <td><strong>{o.id}</strong></td>
                <td>{o.date}</td>
                <td>{o.items}</td>
                <td className="text-accent font-weight-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o.total)}</td>
                <td><Badge bg={o.status === 'Đã giao' ? 'success' : 'info'}>{o.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default MyOrdersPage;
