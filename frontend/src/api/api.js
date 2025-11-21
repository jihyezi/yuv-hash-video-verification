import apiClient from "./axiosConfig";


// --- 1. 인증 (Auth) ---

// 회원가입 (JSON 전송)
export const signupAPI = (userData) => {
   return apiClient.post("/auth/signup", userData);
 };

// 로그인 (Form Data 전송 - FastAPI 요구사항)
export const loginAPI = (email, password) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    return apiClient.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
};

// --- 2. 대시보드 (Dashboard 데이터 가져오기) --- 

// 전체 gallery 총 개수
export const getTotalGalleryCount = () => {
    return apiClient.get("/dashboard/gallery-count");
};

// 전체 API 호출 횟수
export const getTotalApiCalls = () => {
    return apiClient.get("/dashboard/api-count");
};

// 전체 사용자 수
export const getUserCount = () => {
    return apiClient.get("/dashboard/user-count");
};


// --- 3. 이미지 관련 (Images/Verify) ---


