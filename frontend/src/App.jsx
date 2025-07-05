import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import "./styling/App.css";
import Login from "./pages/Login";
import AddProduct from "./pages/AddProduct";
import Products from "./pages/Products";
import Product_details from "./pages/Product.jsx";
import Profile_page from "./pages/Profile.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import MyCart from "./pages/MyCart.jsx";
import ChatPage from "./pages/support.jsx";
import History from "./pages/History.jsx";
import Delivery from "./pages/Delivery.jsx";
import SetToken from "./pages/SetToken.jsx";


const NavigationBar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav>
      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        {isAuthenticated ? (
          <>
            <li>
              <Link to="/AddProduct">AddProduct</Link>
            </li>
            <li>
              <Link to="/Products">Products</Link>
            </li>
            <li>
              <Link to="/Profile">Profile</Link>
            </li>
            <li>
              <Link to="#" onClick={handleLogout}>
                Logout
              </Link>
            </li>
            <li>
              <Link to="/History">Orders_History</Link>
            </li>

            <li>
              <Link to="/MyCart">My Cart</Link>
            </li>

            <li>
              <Link to="/Delivery">Delivery</Link>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login">Login</Link>
          </li>
        )}  
        <li>
          <Link to="/chat">Support</Link>
        </li>
      </ul>
    </nav>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="home">
          <header className="header">
            <div className="logo">MarketMarvel</div>
            <NavigationBar />
            <button className="shop-now" onClick={()=> window.location
.href = '/Products'
            }>Shop Now</button>
          </header>

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/set-token" element={<SetToken />} />

            {/* Protected Routes */}
            <Route
              path="/AddProduct"
              element={
                <ProtectedRoute>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product/item/:id"
              element={
                <ProtectedRoute>
                  <Product_details />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Profile"
              element={
                <ProtectedRoute>
                  <Profile_page />
                </ProtectedRoute>
              }
            />
            <Route
              path="/MyCart"
              element={
                <ProtectedRoute>
                  <MyCart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/History"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />

            <Route
              path="/Delivery"
              element={
                <ProtectedRoute>
                  <Delivery />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
