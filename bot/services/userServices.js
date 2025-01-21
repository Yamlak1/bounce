const axios = require("axios");

const BACKEND_URL = "https://bounce-backend-ubdt.onrender.com/api/users";
// const BACKEND_URL = "http://localhost:8080/api/users";

// Function to register a user
const registerUser = async (chatId, username) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/register`, {
      chatId,
      username,
    });
    return response.data.message;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error registering user:", error.message);
      throw new Error("Failed to register user. Please try again.");
    }
    throw new Error("An unknown error occurred.");
  }
};

const checkUser = async (chatId) => {
  try {
    console.log(chatId + "++++++++++++++++++");
    const response = await axios.post(`${BACKEND_URL}/check`, { chatId });
    return response.data.exists || !!response.data.id;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error checking user:", error.message);
      throw new Error("Failed to check user. Please try again.");
    }
    throw new Error("An unknown error occurred.");
  }
};

module.exports = {
  registerUser,
  checkUser,
};
