// src/pages/HomePage.jsx
import React from 'react';
import heroImage from '../assets/hero-iron-man-minimalist.jpg';
import '../styling/HomePage.css';

const HomePage = () => {
  return (
    <>
      <main className="hero">
        <div className="hero-text">
          <h1>Welcome to the Buy Sell Website</h1>
          <p>
             Here you can get the best deals on the best products. 
             Try shopping with us today and you will never regret it.

            <br />
                Here you can buy and sell  <strong> anything  </strong>
          </p>

          <button className="shop-now-button" onClick={() => window.location.href = '/products'}>
            Shop Now </button>
        </div>
        <div className="hero-image">
          <img src={heroImage} alt="Healthy Eating Baby" />
        </div>
      </main>
      
      <footer className="footer">
        <div className="brands">
          <span>Contact Us</span>
          <span>Terms of Use</span>
          <span>Privacy Policy</span>
          <span>FAQ</span>
          <span>Blog</span>
        </div>
      </footer>
    </>
  );
};

export default HomePage;