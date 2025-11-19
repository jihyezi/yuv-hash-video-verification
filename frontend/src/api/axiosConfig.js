import axios from "axios";

// 1. 기본 설정
const apiClient = axios.create({
    baseURL: "http://127.0.0.1:8000", // 백엔드 주소
    timeout: 10000, // 10초 타임아웃
    headers: {
        "Content-Type": "application/json",
    },
});

// 2. 요청 인터셉터 (Request Interceptor)
apiClient.interceptors.request.use(
    (config) => {
        // localStorage에서 토큰 가져오기
        const token = localStorage.getItem("access_token");

        // 토큰이 있다면 헤더에 'Authorization' 추가
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. 응답 인터셉터 (Response Interceptor)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // 예: 401 에러(인증 실패)가 뜨면 로그인 페이지로 튕겨내기 등을 여기서 처리 가능
        console.error("API Error:", error.response || error.message);
        return Promise.reject(error);
    }
);

export default apiClient;