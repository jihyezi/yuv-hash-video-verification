import axios from "axios";

// 1. 기본 설정
const apiClient = axios.create({
    baseURL: "http://127.0.0.1:8000", // 백엔드 주소
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
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
    async (error) => {
        const originalRequest = error.config;

        // 401 에러(인증 실패)
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // 무한 루프 방지용 플래그

            try {
                // 1. 저장해둔 리프레시 토큰 꺼내기
                const refreshToken = localStorage.getItem("refresh_token");

                if (!refreshToken) {
                    throw new Error("리프레시 토큰이 없습니다.");
                }

                // 2. 백엔드에 토큰 갱신 요청 (이건 axios 말고 fetch나 별도 인스턴스로 하는 게 안전)
                const response = await axios.post("http://127.0.0.1:8000/auth/refresh", {
                    refresh_token: refreshToken,
                });

                // 3. 새로 받은 토큰 저장
                const { access_token, refresh_token } = response.data;
                localStorage.setItem("access_token", access_token);
                localStorage.setItem("refresh_token", refresh_token);

                // 4. 실패했던 요청의 헤더를 새 토큰으로 교체
                originalRequest.headers.Authorization = `Bearer ${access_token}`;

                // 5. 실패했던 요청 다시 실행!
                return apiClient(originalRequest);

            } catch (refreshError) {
                // 갱신조차 실패하면 진짜 로그아웃 처리
                console.error("토큰 갱신 실패:", refreshError);
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("user_info");
                window.location.href = "/login"; // 로그인 페이지로 튕겨내기
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;