import apiClient from "./axiosConfig";

// --- 1. 회원가입 (Auth) ---
export const signupAPI = (userData) => {
    return apiClient.post("/auth/signup", userData);
};

// --- 2. 로그인 (Login) ---
export const loginAPI = (email, password) => {
    return apiClient.post("/auth/login", {
        email: email,
        password: password
    });
};

// --- 3. 부서 목록 조회 (Departments) ---
export const getDepartmentsAPI = () => {
    return apiClient.get("/auth/departments");
};

// --- 4. 이미지 등록 (Images) ---
export const uploadImageAPI = (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post("/gallery/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};