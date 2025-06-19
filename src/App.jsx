import { Route, Routes, useParams } from 'react-router-dom';
import './App.css';
import Home from './page/Home';
import Login from './page/auth/Login';
import Register from './page/auth/Register';
import ProtectedRoute from './components/auth/Protected';
import AdminPage from './page/dashboard/AdminPage';
import Navbar from './components/Navbar';
import ErrorPage from './page/404/ErrorPage';
import Product from './page/shop/Product';
import DetailProduct from './page/shop/DetailProduct';
import Create from './page/dashboard/Create';
import Verify from './page/auth/Verify';
import EditProducr from './page/dashboard/EditProducr';
import DetailUser from './page/users/DetailUser';
import ListUser from './page/dashboard/ListUser';
import PaymentSuccess from './page/shop/PaymentSucces';
import Cart from './page/shop/cart/Cart';
import HomeAdmin from './page/dashboard/HomeAdmin';
import CategoryPage from './page/dashboard/Category';


function UrlAdmin() {
  const { code } = useParams();
  const validCode = localStorage.getItem('admin_code'); // ambil di sini!
  if (code === validCode) {
    return (
      <ProtectedRoute>
        <AdminPage />
      </ProtectedRoute>
    );
  }
  return <ErrorPage />;
}

function App() {
  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/verify/:token' element={<Verify />} />
        <Route path='/' element={<Home />} />
        <Route path='*' element={<ErrorPage />} />
        <Route path='/:code' element={<UrlAdmin />} />
        <Route path='/toko' element={<Product />} />
        <Route
          path='/product/:id'
          element={
            <ProtectedRoute>
              <DetailProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path='/create'
          element={
            <ProtectedRoute adminOnly>
              <Create />
            </ProtectedRoute>
          }
        />
        <Route
          path='/users'
          element={
            <ProtectedRoute adminOnly>
              <ListUser />
            </ProtectedRoute>
          }
        />
        <Route
          path='/product/edit/:id'
          element={
            <ProtectedRoute adminOnly>
              <EditProducr />
            </ProtectedRoute>
          }
        />
        <Route
          path='/category'
          element={
            <ProtectedRoute adminOnly>
              <CategoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/utama'
          element={
            <ProtectedRoute adminOnly>
              <HomeAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path='/user/detail/:id'
          element={
            <ProtectedRoute >
              <DetailUser />
            </ProtectedRoute>
          }
        />
        <Route
          path='/success'
          element={
            <ProtectedRoute >
              <PaymentSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path='/cart'
          element={
            <ProtectedRoute >
              <Cart />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
