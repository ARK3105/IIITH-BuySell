import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styling/Productscss.css";
import { Link } from "react-router-dom";

const token = localStorage.getItem("token");

function Products() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("default");

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
  const [allCategories, setAllCategories] = useState(PRODUCT_CATEGORIES);

 
  useEffect(() => {
    console.log("use effect is called");
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5688/products/display", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });



        const productsWithSellerDetails = await Promise.all(
          response.data.map(async (product) => {
            try {
              const sellerResponse = await axios.get(
                `http://localhost:5688/users/details/${product.Seller_Id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              return {
                ...product,
                sellerName: sellerResponse.data.firstName,  
              };
            } catch (error) {
              console.error("Error fetching seller details:", error);
              return product;
            }
          })
        );

        setProducts(productsWithSellerDetails);
       
      } catch (error) {
        console.error("Server error:", error);
      }
    };

    fetchProducts();
  }, []);
 

 
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((cat) => cat !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

 
  const getFilteredAndSortedProducts = () => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        searchTerm === "" ||
        product.searchKeywords?.some((keyword) =>
          keyword.includes(searchTerm.toLowerCase())
        ) ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);

      const matchesPrice =
        (!priceRange.min || product.price >= Number(priceRange.min)) &&
        (!priceRange.max || product.price <= Number(priceRange.max));

      
      // const isSellerNotUser =
      //   product.seller_id && product.seller_id !== userEmail;

      return (
        matchesSearch && matchesCategory && matchesPrice
      );
    });

  
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();

  return (
    <div className="products-container">
      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="filters">
          <div className="category-filters">
            <h3>Categories</h3>
            {PRODUCT_CATEGORIES.map((category) => (
              <label key={category} className="category-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
                {category}
              </label>
            ))}
          </div>

          <div className="price-filter">
            <h3>Price Range</h3>
            <input
              type="number"
              name="min"
              placeholder="Min Price"
              value={priceRange.min}
              onChange={handlePriceChange}
              className="price-input"
            />
            <input
              type="number"
              name="max"
              placeholder="Max Price"
              value={priceRange.max}
              onChange={handlePriceChange}
              className="price-input"
            />
          </div>

          <div className="sort-options">
            <h3>Sort By</h3>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="sort-select"
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="product-grid">
        {/* <h1>Products ({filteredProducts.length})</h1> */}
        {filteredProducts.map((product) => (
          <div key={product._id} className="product-card">
            <Link to={`/product/item/${product._id}`}>
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
            </Link>
            <p className="price">₹{product.price}</p>
            <p className="description">{product.description}</p>
            <p className="category">{product.category}</p>
            <p className="seller">Seller: {product.sellerName}</p>
            
            {product.tags && product.tags.length > 0 && (
              <div className="tags">
                {product.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
