import axios from 'axios';

const api = axios.create({
  baseURL: '/api/shop',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('techshop_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Sample fallback products for offline preview
const sampleProducts = [
  { id: 1, name: 'Serum Niacinamide 10% + Zinc 1% Dịu Nhẹ', price: 290000, original_price: 350000, is_featured: true, category: { name: 'Serum' }, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60' },
  { id: 2, name: 'Gel Dưỡng Phục Hồi Ceramides & Panthenol B5', price: 420000, original_price: 490000, is_featured: true, category: { name: 'Kem dưỡng' }, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=60' },
  { id: 3, name: 'Dung Dịch Tẩy Tế Bào Chết BHA 2% Salicylic Acid', price: 550000, original_price: 650000, is_featured: true, category: { name: 'Tẩy tế bào chết' }, image: 'https://images.unsplash.com/photo-1608248597359-bb5e77402c4f?w=500&auto=format&fit=crop&q=60' },
  { id: 4, name: 'Kem Chống Nắng Phổ Rộng SPF 50+ PA++++ Kháng Quang', price: 380000, original_price: 450000, is_featured: true, category: { name: 'Chống nắng' }, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&auto=format&fit=crop&q=60' },
  { id: 5, name: 'Serum Retinol 0.2% Làm Quen & Trẻ Hóa Da Đêm', price: 680000, original_price: 790000, is_featured: false, category: { name: 'Serum' }, image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=500&auto=format&fit=crop&q=60' },
  { id: 6, name: 'Sữa Rửa Mặt Dịu Nhẹ pH 5.5 Cho Da Dầu Mụn', price: 210000, original_price: 260000, is_featured: false, category: { name: 'Làm sạch' }, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60' }
];

export const getProductsAPI = async (params) => {
  try {
    return await api.get('/products', { params });
  } catch {
    return { data: { products: sampleProducts, total: sampleProducts.length } };
  }
};

export const getProductByIdAPI = async (id) => {
  try {
    return await api.get(`/products/${id}`);
  } catch {
    const prod = sampleProducts.find(p => p.id === Number(id)) || sampleProducts[0];
    return { data: { product: prod } };
  }
};

export const getFeaturedProductsAPI = async () => {
  try {
    return await api.get('/products/featured');
  } catch {
    return { data: { products: sampleProducts.filter(p => p.is_featured) } };
  }
};

export const getCategoriesAPI = async () => {
  try {
    return await api.get('/categories');
  } catch {
    return { data: { categories: [{ id: 1, name: 'Tất cả' }, { id: 2, name: 'Serum' }, { id: 3, name: 'Kem dưỡng' }, { id: 4, name: 'Chống nắng' }, { id: 5, name: 'Làm sạch' }] } };
  }
};

export const loginAPI = (data) => api.post('/auth/login', data);
export const registerAPI = (data) => api.post('/auth/register', data);
export const getMyOrdersAPI = () => api.get('/orders/my-orders');
export const createOrderAPI = (data) => api.post('/orders', data);
export const getStatsAPI = () => api.get('/admin/stats');
export const getOrdersAPI = (params) => api.get('/orders', { params });
export const updateOrderStatusAPI = (id, data) => api.put(`/orders/${id}/status`, data);
export const createProductAPI = (data) => api.post('/products', data);
export const deleteProductAPI = (id) => api.delete(`/products/${id}`);

export default api;
