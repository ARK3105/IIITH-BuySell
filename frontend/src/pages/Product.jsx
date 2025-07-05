import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios"; 
import "../styling/Productdetails.css";


const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);

  const [add_to_cart, setAdd_to_cart] = useState(false);

  const token = localStorage.getItem("token");
  let userEmail = "";

  if (token) {
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      userEmail = decodedToken.email;
      console.log("User email ofcurrent user is :", userEmail);
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    console.log("Product ID:", id);
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5688/products/item/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.Seller_Id === userEmail) {
          console.log("You are the seller");
          setAdd_to_cart(true);
        } else {
          console.log("You are not the seller");
        }
        console.log("Response from product details:", response.data);

        const USER_EMAIL = response.data.Seller_Id;
        console.log("USER EMAIL of seller is :", USER_EMAIL);

        const user_details = await axios.get(
          `http://localhost:5688/users/details/${USER_EMAIL}`,
          {
            params: {
              email: USER_EMAIL,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(user_details.data);

        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handle_add_to_cart = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5688/cart/add`,
        {
          product_id: product._id,
          quantity: 1,
          Buyer: userEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Added to cart:", response.data);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (!product) {
    return <p>Loading...</p>;
  }

  return (
    <div className="product-details">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="product-info">
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p>
          <strong>Price:</strong> ${product.price}
        </p>
        <p>
          <strong>Category:</strong> {product.category}
        </p>
        <p>
          <strong>Seller:</strong> {user?.firstName} {user?.lastName}
        </p>

        {add_to_cart ? (
          <p>
            <strong>You are the seller of this product</strong>
          </p>
        ) : (
          <Link to="/MyCart">
            <button className="add-to-cart" onClick={handle_add_to_cart}>
              Add to Cart_2
            </button>
          </Link>
        )}

        {/* <Link to="/MyCart">
          <button className="add-to-cart" onClick={handle_add_to_cart}>Add to Cart</button>
        </Link> */}
      </div>
    </div>
  );
};

export default ProductDetails;
