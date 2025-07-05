const token = localStorage.getItem("token");
let userEmail = ""; 

if (token) {
    try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        userEmail = decodedToken.email; 
        console.log("User email of current user is:", userEmail);
    } catch (error) {
        console.error("Error decoding token:", error);
    }
}

export { userEmail }; 
