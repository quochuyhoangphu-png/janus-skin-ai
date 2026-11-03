import { Link } from 'react-router-dom';
import { Card, Button, Badge } from 'react-bootstrap';
import { FiShoppingCart, FiEye } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`Đã thêm ${product.name} vào giỏ!`);
  };

  const discountPercent = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <Card className="glass-card h-100 product-card border-0 overflow-hidden">
      <div className="position-relative overflow-hidden" style={{ height: '220px', background: 'rgba(0,0,0,0.2)' }}>
        <img
          src={product.image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60'}
          alt={product.name}
          className="w-100 h-100 object-fit-cover transition-transform"
        />
        {discountPercent > 0 && (
          <Badge bg="danger" className="position-absolute top-2 start-2 px-2 py-1">
            -{discountPercent}%
          </Badge>
        )}
        {product.is_featured && (
          <Badge bg="warning" text="dark" className="position-absolute top-2 end-2 px-2 py-1">
            Nổi bật
          </Badge>
        )}
      </div>

      <Card.Body className="d-flex flex-column p-3">
        <div className="text-secondary small mb-1">{product.category?.name || 'Mỹ phẩm'}</div>
        <Card.Title as={Link} to={`/products/${product.id}`} className="text-white text-decoration-none fs-6 mb-2 line-clamp-2">
          {product.name}
        </Card.Title>

        <div className="mt-auto pt-2 d-flex align-items-baseline justify-content-between">
          <div>
            <div className="text-accent font-weight-bold fs-5">{formatPrice(product.price)}</div>
            {product.original_price && product.original_price > product.price && (
              <small className="text-muted text-decoration-line-through">
                {formatPrice(product.original_price)}
              </small>
            )}
          </div>
          <Button
            size="sm"
            className="btn-accent rounded-circle p-2 d-flex align-items-center justify-content-center"
            style={{ width: '36px', height: '36px' }}
            onClick={handleAdd}
            title="Thêm vào giỏ"
          >
            <FiShoppingCart size={16} />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
