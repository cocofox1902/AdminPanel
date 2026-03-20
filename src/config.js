/** Production: https://budbeer-api.onrender.com/api — override with REACT_APP_API_URL for local API */
const API_URL =
  process.env.REACT_APP_API_URL || "https://budbeer-api.onrender.com/api";

export default API_URL;
