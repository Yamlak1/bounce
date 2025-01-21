import axios from "axios";

const BACKEND_URL = "http://localhost:8080/api/users"; // Backend API URL

// Function to register a user
export const registerUser = async (
  chatId: string,
  username: string
): Promise<string> => {
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

// Function to check if a user exists
export const checkUser = async (chatId: string): Promise<boolean> => {
  try {
    const response = await axios.post(`${BACKEND_URL}/check`, { chatId });
    return response.data.exists || !!response.data.id; // User exists if id is present or 'exists' is true
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error checking user:", error.message);
      throw new Error("Failed to check user. Please try again.");
    }
    throw new Error("An unknown error occurred.");
  }
};
