import apiClient from "./axiosConfig";

// --- 1. 인증 (Auth) ---

// 회원가입 (JSON 전송)
// export const signupAPI = (userData) => {
//   return apiClient.post("/auth/signup", userData);
// };

// 로그인 (Form Data 전송 - FastAPI 요구사항)
export const loginAPI = (email, password) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    return apiClient.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
};

// --- 2. 이미지 관련 (Images/Verify) ---
