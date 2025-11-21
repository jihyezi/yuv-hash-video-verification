import apiClient from "./axiosConfig";

<<<<<<< HEAD
// --- 1. 회원가입 (Auth) ---
// export const signupAPI = (userData) => {
//   return apiClient.post("/auth/signup", userData);
// };
=======
// --- 1. 인증 (Auth) ---

// 회원가입 (JSON 전송)
export const signupAPI = (userData) => {
   return apiClient.post("/auth/signup", userData);
 };
>>>>>>> ec4077c911fcdc2ed5088880abbd53fb6abc693f

// --- 2. 로그인 (Login) ---
export const loginAPI = (email, password) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    return apiClient.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
};

// --- 3. 이미지 등록 (Images) ---
export const uploadImageAPI = (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post("/gallery/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};