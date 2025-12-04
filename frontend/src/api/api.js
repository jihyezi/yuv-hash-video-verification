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
export const getDepartmentGalleryAPI = (department_id) => {
    return apiClient.get("/project/list", {
        params: { department_id },
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
        }
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


// --- 5. 증명서 발급 ---
export const generateCertificateAPI = (image, verification_result = "MATCH") => {
    const token = localStorage.getItem("access_token");

    // 이미지 객체에서 원본 등록자와 등록일시 가져오기 (없으면 기본값)
    const originalUploader = image.originalUploader || "정보 없음";
    const originalUploadDate = image.originalUploadDate || "";

    return apiClient.post(
        "/verifyresult/issue",
        {
            report_id: `VR-${Date.now()}`,       // 발급번호
            original_file_id: image.id,         // Gallery 테이블 id
            target_file_name: image.title,      // 검증 대상 파일명
            verification_result: verification_result,
        },
        {
            headers: { Authorization: `Bearer ${token}` },
            responseType: "blob", // PDF 다운로드용
        }
    );
};

export const originCertificateAPI = (certificateId, originalFileId) => {
    return apiClient.post(
        "/certificate/issue",
        {
            certificate_id: certificateId,
            original_file_id: originalFileId,
        },
        {
            responseType: "blob", // PDF 파일(binary)을 받기 위해 필수 설정
        }
    );
};


// --- 6. 실시간 활동 로그 ---

export const fetchActivityLogAPI = async (limit = 100) => {
    try {
        const response = await apiClient.get(`/log/activity`, {
            params: { limit },
        });
        return response.data;
    } catch (error) {
        console.error("활동 로그 조회 실패:", error);
        throw error;
    }
};