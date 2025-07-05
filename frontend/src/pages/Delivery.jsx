import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styling/Delivery.css";
import { userEmail } from "../user_email";

const token = localStorage.getItem("token");



const Delivery = () => {
  const [products, setProducts] = useState([]);
  const userEmail_1 = userEmail;
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");  


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // const response = await axios.get("http://localhost:5688/order/display");
       
        const response = await axios.get("http://localhost:5688/order/display", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        


        console.log("Response from sold products:", response.data);
        const filteredProducts = response.data.filter(
          (product) => product.Status === "pending" && product.Seller_Id === userEmail_1
        );
        console.log("Filtered products:", filteredProducts);

        const productDetailsPromises = filteredProducts.map(async (order) => {
          try {
            // const productResponse = await axios.get(
            //   `http://localhost:5688/products/item/${order.product_id}`
            // );
            const productResponse = await axios.get(
              `http://localhost:5688/products/item/${order.product_id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );


            // console.log("Product response is:", productResponse.data);
            // return { ...order, productDetails: productResponse.data }; 
            const buyerResponse = await axios.get(
              `http://localhost:5688/users/details/${order.Buyer_Id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            console.log("product response is :", productResponse.data);
            console.log("buyer response is :", buyerResponse.data);
            return {
              ...order,
              productDetails: productResponse.data,
              buyerName: buyerResponse.data.firstName,  
            };
            
          } catch (err) {
            console.error(
              `Error fetching product details for product ID ${order.product_id}:`,
              err
            );
            return { ...order, productDetails: null };
          }
        });
  
      
        const resolvedProductDetails = await Promise.all(productDetailsPromises);
        console.log("Resolved product details:", resolvedProductDetails);
  
        setProducts(resolvedProductDetails); 
      } catch (error) {
        console.error("Error fetching sold products:", error);
      }
    };
  
    fetchProducts();
    
  }, [userEmail_1]);

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleOtpSubmit = async (productId) => {
    try {
      const response = await axios.post(
        `http://localhost:5688/order/verify-otp`,
        {
          productId,
          otp,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }


      );
      console.log("Response from OTP verification:", response.data);
      if (response.data.success){

        const response = await axios.post(`http://localhost:5688/order/update-status`, {
          productId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
        



      );
        console.log("Updated status of the product to delivered:", response.data);
        const updatedProducts = products.filter(
          (product) => product._id !== productId
        );
        setProducts(updatedProducts);

        localStorage.removeItem('orderDetails');
        localStorage.removeItem('otp');
        
        setSuccessMessage("OTP verified successfully! Product marked as delivered."); 
        setTimeout(() => setSuccessMessage(""), 3000); 


        setMessage(response.data);
      }
      else {
        setMessage("Failed to verify OTP.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setMessage("Failed to verify OTP.");
    }
  };

  return (
    <div className="delivery">
    <h1>Products for Delivery</h1>
    <div className="products">
      {products.length > 0 ? (
        products.map((product) => (
          <div key={product._id} className="product-card">
            <img
              src={product.productDetails?.image}
              alt={product.productDetails?.name} 
            />
            <div className="product-details">
              <h2>{product.productDetails?.name}</h2>
              <p>Price: ${product.productDetails?.price}</p>
              <p>Description: {product.productDetails?.description}</p>
              <p>Buyer: {product.buyerName}</p>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={handleOtpChange}
              />
              <button onClick={() => handleOtpSubmit(product._id)}>
                Submit OTP
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="default_display">No products to display.</p>
      )}
    </div>

    
    {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
        </div>
      )}
    {message && (
      <div className="error-message">
        <p>{message}</p>
      </div>
    )}

  </div>
  
  );
};

export default Delivery;
