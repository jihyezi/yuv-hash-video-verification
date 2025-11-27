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

// 활동 로그 조회 
export const getActivityLogsAPI = () => {
    return apiClient.get("/log/activity");
};

// 최신 파일 목록 조회
export const getRecentFilesAPI = () => {
    return apiClient.get("/dashboard/files");
};


// --- 3. 이미지 관련 (Images/Verify) ---
// 이미지 위변조 검증
export const verifyImageAPI = (file, original_file_id) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("original_file_id", original_file_id);

    return apiClient.post("/verify/detect", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
        },
    });
};

// 내 부서 이미지 목록 조회 (GalleryModal용)
export const getDepartmentGalleryAPI = () => {
    return apiClient.get("/project/list", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
    });
};


// --- 3. 부서 목록 조회 (Departments) ---
export const getDepartmentsAPI = () => {
    return apiClient.get("/auth/departments");
};

// --- 4. 이미지 등록 (Images) ---
export const uploadImageAPI = (file) => {
    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post("/gallery/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },

    });
};

export const getDashboardStatsAPI = () => {
    return apiClient.get("/dashboard/stats");
};


