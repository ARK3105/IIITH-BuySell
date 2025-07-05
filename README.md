# IIIT Buy-Sell Portal

A full-stack MERN web application for secure, seamless buying and selling within the IIIT Hyderabad community. Built to provide a dedicated, authenticated marketplace for students and staff.

---

## 🚀 Features

- **User Authentication**
  - Secure registration and login with email verification
  - Passwords hashed using bcrypt.js
  - Persistent login with JWT (remains logged in across browser restarts)
  - CAS (Central Authentication Service) login integration
  - Google/LibreCaptcha 

- **User Roles**
  - Any user can act as both Buyer and Seller
  - Profile page with editable user details

- **Product Management**
  - Add, edit, and view products with categories (clothing, grocery, etc.)
  - Search and filter items by name and category (multi-select)
  - Individual item pages with detailed descriptions

- **Cart & Orders**
  - Add/remove items to/from cart
  - Place orders for multiple items (cannot buy own products)
  - Order history with tabs for pending, bought, and sold items
  - OTP-based order completion (Hashed OTP stored in localstorage) 
  - Seller can close transactions using buyer-provided OTP

- **Delivery Management**
  - Sellers see pending deliveries and can complete them with OTP verification

- **Security**
  - All backend routes protected with JWT
  - Frontend route protection (React Router + custom guards)
  - Only logged-in users can access main features

- **Support**
  - Integrated AI-powered chatbot (Gemini API) for user support
  - Chat UI with session-based conversation memory

- **UI/UX**
  - Responsive, modern design 
  - Persistent navigation bar on all authenticated pages
  - Clean URL routing for all pages

---

## 🛠️ Tech Stack

- **Frontend:** React.js (with React Router)
- **Backend:** Node.js, Express.js 
- **Database:** MongoDB 
- **Authentication:** JWT, bcrypt.js, CAS
- **AI Support:** Gemini API (for chatbot)

<!-- ---

## 📂 Project Structure

```
<roll_no>/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── cas_middleware.js
│   ├── cas_login.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── ...
│   └── package.json
└── README.md
``` -->

---

## ⚡ How to Run

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd IIITH-BuySell
   ```

2. **Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the app**
   - Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📝 Implementation Highlights

- **Authentication & Security:**  
  All sensitive data is protected using JWT tokens and bcrypt-hashed passwords. CAS login ensures only IIIT users can register. All backend APIs are protected and require valid tokens.

- **Order & Delivery Flow:**  
  Orders are placed via the cart, with OTP-based completion for secure handover. OTPs are hashed in the localstorage for security.

- **Search & Filter:**  
  Powerful search and multi-category filter for products, with real-time updates.

- **Chatbot Support:**  
  AI-powered chatbot for instant support, with session-based memory for context-aware responses.

- **Robust Routing:**  
  All routes are protected; unauthorized access redirects to login. Navigation bar is always visible post-login for seamless navigation.


<!-- > ## 📄 Screenshots -->

<!-- > _Add screenshots of your main pages: Login, Dashboard, Product Search, Cart, Orders, Delivery, Chatbot, etc._ -->

---

## 💡 Why This Project Stands Out

- **End-to-end secure marketplace for a closed community**
- **Modern, responsive UI with persistent navigation**
- **Advanced authentication (CAS, JWT, Captcha)**
- **AI-powered support for enhanced user experience**
- **Clean, modular codebase with RESTful APIs and React best practices**

---

## 👤 Author

- **Name:** Atharva Kulkarni
- **Email:** atharva.kulkarni@students.iiit.ac.in

---

## 📜 License


This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


---
