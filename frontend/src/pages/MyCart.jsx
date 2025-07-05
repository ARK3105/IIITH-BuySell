import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import "../styling/MyCart.css";
import { userEmail } from "../user_email";

const token = localStorage.getItem("token");

const MyCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    console.log("i am in my cart");
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const response = await axios.get(`http://localhost:5688/cart/display`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("response for cart items:", response.data);
        // console.log("Cart items:", response.data);
        // setCartItems(response.data);
        const user = JSON.parse(atob(token.split(".")[1]));
        const userEmail = user.email;
        console.log("User email for display:", userEmail);
        const filteredCartItems = response.data.filter(
          (item) => item.Buyer === userEmail && item.status === "cart"
        );
        // const filteredCartItems = response.data.filter(item => item.owner_id === userEmail);
        setCartItems(filteredCartItems);
        
        // const products = await Promise.all(
        //   response.data.map(async (item) => {
        //     const product = await axios.get(
        //       `http://localhost:5688/products/item/${item.product_id}`
        //     );
        //     return product.data;
        //   })
        // );
        console.log("Filtered cart items:", filteredCartItems);

        const products = await Promise.all(
          filteredCartItems.map(async (item) => {
            const product = await axios.get(
              `http://localhost:5688/products/item/${item.product_id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            return product.data;
          })
        );

        // console.log("Products:", products);
        setProducts(products);
      
        const total = products.reduce((acc, product, index) => {
          return acc + product.price * filteredCartItems[index].quantity;
        }, 0);

        console.log("Total:", total);
        setTotal(total);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, []);

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000); 
  };

  const handle_remove = async (product_id) => {
    try {
      const response = await axios.delete(
        `http://localhost:5688/cart/remove/${product_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("removing product id:", product_id);
      console.log("Removed successfully:", response.data);
      const newCartItems = cartItems.filter(
        (item) => item.product_id !== product_id
      );
      setCartItems(newCartItems);
      const newProducts = products.filter(
        (product) => product._id !== product_id
      );
      setProducts(newProducts);




      const newTotal = newProducts.reduce((acc, product, index) => {
        return acc + product.price * newCartItems[index].quantity;
      }, 0);
      setTotal(newTotal);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handle_order = async () => {
    try {
      if (total === 0) {
        setMessage("Please add items to the cart");
        return;
      }

      const response = await axios.post(
        `http://localhost:5688/cart/order`,
        {
          cartItems,
          products,
          total,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const otp = generateOTP();
      const hashedOtp = otp;
      console.log("Saving order details in the order collection and OTP");

 
      const orderDetails = cartItems.map((item) => ({
        buyer_id: userEmail,
        product_id: item.product_id,
        seller_id: products.find((product) => product._id === item.product_id)
          .Seller_Id,
        quantity: item.quantity,
        amount:
          item.quantity *
          products.find((product) => product._id === item.product_id).price,
        otp: hashedOtp,
      }));

      console.log("Order details are :", orderDetails);

      await axios.post(
        "http://localhost:5688/order/add-order",
        {
          orders: orderDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const local_orders = cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        otp: otp,
      }));
      console.log("Local orders:", local_orders);
   
      const orders = JSON.parse(localStorage.getItem("orders")) || [];
      console.log("Existing orders:", orders);
      
      const updatedOrders = [...orders, ...local_orders];
      console.log("Updated orders:", updatedOrders);
      
      localStorage.setItem("orders", JSON.stringify(updatedOrders));

      console.log("Order placed successfully:", response.data);
      setMessage("Order placed successfully");
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  return (
    <div className="cart">
      <h1>My Cart</h1>
      <div className="cart-items">
        {products.length > 0 && cartItems.length > 0 ? (
          products.map((product, index) => (
            <div key={product._id} className="cart-item">
              <img src={product.image} alt={product.name} />
              <div>
                <h2>{product.name}</h2>
                <p>Price: ${product.price}</p>
                <p>Quantity: {cartItems[index]?.quantity || 0}</p>{" "}
                <button
                  className="remove"
                  onClick={() => handle_remove(product._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="cartdisplay">No items in your cart.</p>
        )}
      </div>
      <h2>Total: ${total}</h2>

      <button className="Order" onClick={handle_order}>
        Order
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default MyCart;
