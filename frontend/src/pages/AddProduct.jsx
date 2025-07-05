import React, { useState, useEffect } from "react";
import "../styling/AddProduct.css";
import axios from "axios";

const token = localStorage.getItem("token");

const AddProduct = () => {
  
  const PRODUCT_CATEGORIES = [
    "Electronics",
    "Books",
    "Clothing",
    "Furniture",
    "Sports Equipment",
    "Study Materials",
    "Other",
    "MEN",
    "Women",
    "Kids",
  ];

  const [formData, setFormData] = useState({
    category: "",
    name: "",
    price: "",
    description: "",
    Seller_Id: "",
    image: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    

    setFormData({ ...formData, [name]: value });
  };

  const token = localStorage.getItem("token");
  const decodedToken = JSON.parse(atob(token.split('.')[1]));
  const userEmail = decodedToken.email;

  useEffect(() => {
    setFormData((prevFormData) => ({ ...prevFormData, Seller_Id: userEmail }));
  }, [userEmail]);


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailPattern =
      /^[a-zA-Z0-9._]+\.+([a-zA-Z0-9._]+)@students\.iiit\.ac\.in$/;

    if (!emailPattern.test(formData.Seller_Id)) {
      alert("Please enter a valid email ID");
      return;
    }

    try
      {
      const productData = {
        category: formData.category,
        name: formData.name,
        price: formData.price,
        description: formData.description,
        Seller_Id: userEmail,
        image: formData.image,
      };

  
      const response = await axios.post(
        "http://localhost:5688/products/add",
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      alert("Product added successfully");
      setFormData({
        category: "",
        name: "",
        price: "",
        description: "",
        Seller_Id: "",
        image: "",
      });
      console.log("Product added:", response.data);
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <div className="add-product">
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit} className="product-form">
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          {PRODUCT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
        ></textarea>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          required
        />

        <button type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default AddProduct;
