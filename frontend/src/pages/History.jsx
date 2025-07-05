import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styling/History.css";
import { userEmail } from "../user_email";

const token = localStorage.getItem("token");


const History = () => {
  const [activeTab, setActiveTab] = useState("pendingOrders");
  const [pendingOrders, setPendingOrders] = useState([]);
  const [productsBought, setProductsBought] = useState([]);
  const [productsSold, setProductsSold] = useState([]);
  const [error, setError] = useState(null);
  const userEmail_1 = userEmail;

  useEffect(() => {
    console.log("User email:", userEmail_1);
    
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchPendingOrders(),
          fetchProductsBought(),
          fetchProductsSold(),
        ]);
      } catch (err) {
        setError(
          "An error occurred while fetching data. Please try again later."
        );
      }
    };

    fetchData();
  }, []);



  const fetchPendingOrders = async () => {
    try {
      console.log("Fetching pending orders lkasdf");

     // const response = await axios.get("http://localhost:5688/order/display");
      const response = await axios.get("http://localhost:5688/order/display", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      console.log("Response from pending orders:", response.data);
      const filteredOrders = response.data.filter(
        (order) => order.Buyer_Id === userEmail_1 && order.Status === "pending"
      );
      console.log("Filtered orders:", filteredOrders);
      /// local storage
      const orders = JSON.parse(localStorage.getItem("orders")) || [];
      console.log("Orders:", orders);



      if (orders.length === 0) {
        console.log("No orders to display");
        return;
      }
      const productDetailsPromises = filteredOrders.map(async (order) => {
        try {
          const productResponse = await axios.get(
            `http://localhost:5688/products/item/${order.product_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          // return { ...order, productDetails: productResponse.data };
          // const otp = orderDetails.otp;
          const orderDetails = orders.find(
            (orderDetails) => orderDetails.product_id === order.product_id
          );
          if (!orderDetails) {
            console.log(`No order details found for product ID ${order.product_id}`);
            return { ...order, productDetails: productResponse.data, otp: null, quantity: null };
          }
  
          console.log("Order details:", orderDetails);
          return {
            ...order,
            productDetails: productResponse.data,
            otp : orderDetails.otp,
            quantity: orderDetails.quantity,
          };
        } catch (err) {
          console.error(
            `Error fetching product details for product ID ${order.product_id}:`,
            err
          );
          return { ...order, productDetails: null, otp: null };
        }
      });
      console.log("product response:", productDetailsPromises);
      setPendingOrders(await Promise.all(productDetailsPromises));
    } catch (err) {
      console.error("Error fetching pending orders:", err);
      setError("Failed to load pending orders.");
    }
  };

  const fetchProductsBought = async () => {
    try {
      const response = await axios.get(`http://localhost:5688/order/display`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      );
      console.log("Response from products bought:", response.data);
      const filteredProducts = response.data.filter(
        (product) =>
          product.Buyer_Id === userEmail_1 && product.Status === "delivered"
      );
      console.log("Filtered products:", filteredProducts);
      const productDetailsPromises = filteredProducts.map(async (order) => {
        try {
          console.log("product_id:", order.product_id);
          const productResponse = await axios.get(
            `http://localhost:5688/products/item/${order.product_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log("Product response:", productResponse.data);
          return { ...order, productDetails: productResponse.data };
        } catch (err) {
          console.error(
            `Error fetching product details for product ID ${order.product_id}:`,
            err
          );
          return { ...order, productDetails: null };
        }
      });
      console.log("product response:", productDetailsPromises);
      setProductsBought(await Promise.all(productDetailsPromises));
    } catch (err) {
      console.error("Error fetching products bought:", err);
      setError("Failed to load products bought.");
    }
  };

  const fetchProductsSold = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5688/products/display`
        ,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
        
      );
      console.log("Response from products sold:", response.data);
      const filteredProducts = response.data.filter(
        (product) => product.Seller_Id === userEmail_1
      );
      console.log("Filtered products:", filteredProducts);
      setProductsSold(filteredProducts);
    } catch (err) {
      console.error("Error fetching products sold:", err);
      setError("Failed to load products sold.");
    }
  };

  const renderProducts = (products) => {
    console.log("Products:", products);
    if (products.length === 0) {
      return <div className="no-products">No products to display</div>;
    }
    if (products[0].productDetails) {
      return products.map((order, index) => (
        <div key={order._id || index} className="product-card">
          <img
            src={order.productDetails.image}
            alt={order.productDetails.name}
          />
          <div className="product-details">
            <h2>{order.productDetails.name}</h2>
            <br></br>
            <p>Price: ${order.productDetails.price}</p>
            <p>Description: {order.productDetails.description}</p>
            {order.otp && (
              <div className="otp">
                <strong>OTP: </strong>
                {order.otp}
              </div>
            )}
          </div>
        </div>
      ));
    }

    return products.map((product, index) => (
      <div key={product._id || index} className="product-card">
        <img src={product.image} alt={product.name} />
        <div className="product-details">
          <h2>{product.name}</h2>
          <br></br>
          <p>Price: ${product.price}</p>
          {/* <p>Quantity: {product.quantity}</p> */}
        </div>
      </div>
    ));
  };

  return (
    <div className="history">
      <h1>Order History</h1>
      {error && <div className="error-message">{error}</div> &&
        activeTab === "pendingOrders"}
      <div className="tabs">
        <button
          className={activeTab === "pendingOrders" ? "active" : ""}
          onClick={() => setActiveTab("pendingOrders")}
        >
          Pending Orders
        </button>
        <button
          className={activeTab === "productsSold" ? "active" : ""}
          onClick={() => setActiveTab("productsSold")}
        >
          Products Sold
        </button>
        <button
          className={activeTab === "productsBought" ? "active" : ""}
          onClick={() => setActiveTab("productsBought")}
        >
          Products Bought
        </button>
      </div>
      <div className="tab-content">
        {activeTab === "productsSold" && renderProducts(productsSold)}
        {activeTab === "pendingOrders" && renderProducts(pendingOrders)}
        {activeTab === "productsBought" && renderProducts(productsBought)}
      </div>
    </div>
  );
};

export default History;
