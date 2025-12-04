import React from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import './ProtectedRoute.css'; // CSS 파일명 확인 필요

// 1. 역할별 권한 정의
const ROLE_PERMISSIONS = {
    admin: ['view', 'upload', 'settings'],
    user: ['view', 'upload'],
    institution: ['view'],
};

// 2. 역할 이름 정규화
const normalizeRole = (role) => {
    if (!role) return "user"; // 기본값 소문자
    const lowerRole = role.toLowerCase().trim();
    if (['admin', 'institution', 'user'].includes(lowerRole)) {
        return lowerRole;
    }
    return 'user';
};

// 3. 권한 없음 페이지 컴포넌트
const ForbiddenPage = () => {
    const navigate = useNavigate();

    return (
        <div className="forbidden-container">
            <div className="forbidden-card">
                <div className="icon-wrapper">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>

                <h2>접근 권한이 없습니다</h2>
                <p>
                    요청하신 페이지를 보실 수 있는 권한이 부족합니다.<br />
                    관리자에게 문의하거나 홈으로 이동해주세요.
                </p>

                <div className="button-group">
                    <button className="home-btn" onClick={() => navigate('/')}>
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
};

// 4. 메인 보호 라우트 컴포넌트
export const ProtectedRoute = ({ userRole, requiredPermission }) => {
    // [수정됨] 로그인 안 된 경우 로그인 페이지로 리다이렉트
    // (만약 userRole이 null/undefined이면 로그인이 안 된 것으로 간주)
    if (!userRole) {
        // alert("로그인이 필요합니다."); // 필요하다면 주석 해제
        return <Navigate to="/login" replace />; // 보통 /signup 보단 /login으로 보냅니다
    }

    // [수정됨] 권한 체크 로직 복구
    const normalizedRole = normalizeRole(userRole);
    const permissions = ROLE_PERMISSIONS[normalizedRole] || [];

    // requiredPermission이 prop으로 넘어오지 않았다면(그냥 로그인만 필요하면) 통과시킬 수도 있음
    // 여기서는 "필수 권한이 있다면 체크한다"는 로직입니다.
    const hasPermission = requiredPermission
        ? permissions.includes(requiredPermission)
        : true;

    // 권한 없으면 ForbiddenPage 렌더링
    if (!hasPermission) {
        return <ForbiddenPage />;
    }

    // 권한 있으면 정상 통과 (자식 컴포넌트 렌더링)
    return <Outlet />;
};