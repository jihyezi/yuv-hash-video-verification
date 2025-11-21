import apiClient from "./axiosConfig";

// --- 1. 회원가입 (Auth) ---
export const signupAPI = (userData) => {
    return apiClient.post("/auth/signup", userData);
};

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