import apiClient from "./axiosConfig";


// --- 1. 인증 (Auth) ---

// 회원가입 (JSON 전송)
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

export const getDashboardStatsAPI = () => {
    return apiClient.get("/dashboard/stats");
};
