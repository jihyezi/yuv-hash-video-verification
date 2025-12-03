import React, { useState, useEffect } from 'react';
import apiClient from "../api/axiosConfig";   // ⭐ 수정(12/05) — 백엔드 연결
import './Settings.css';

// 초기 팀원 데이터 제거됨 (백엔드에서 받아오도록 변경)
// ⭐ 수정(12/05)
// const initialTeamMembers = [...]
const initialTeamMembers = [];   // DB에서 가져옴

const ToggleSwitch = ({ checked, onChange }) => (
  <label className="toggle-switch">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="slider round"></span>
  </label>
);

const RoleBadge = ({ role }) => (
  <span className={`role-badge ${role.toLowerCase()}`}>{role}</span>
);

// --- 역할 기반 권한 설정 컴포넌트 (사용자 관리 탭 내용) ---
const RoleBasedPermissions = () => {
  const [roles, setRoles] = useState([
    { id: 'admin', name: 'Admin', userManagement: true, contentManagement: true, settingsAccess: true, auditLog: true },
    { id: 'institution', name: 'Institution', userManagement: false, contentManagement: true, settingsAccess: false, auditLog: false },
    { id: 'user', name: 'User', userManagement: false, contentManagement: true, settingsAccess: false, auditLog: false },
  ]);

  const handlePermissionChange = (roleId, permissionKey) => {
    setRoles(prev => prev.map(role =>
      role.id === roleId ? { ...role, [permissionKey]: !role[permissionKey] } : role
    ));
  };

  return (
    <div className="card-box">
      <div className="card-header">
        <h3>역할별 권한 상세 설정</h3>
        <p>각 역할이 시스템에서 수행할 수 있는 작업을 제어합니다.</p>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{ width: '20%' }}>역할</th>
              <th className="center">검증 권한</th>
              <th className="center">발급 권한</th>
              <th className="center">사용자 관리</th>
              <th className="center">설정 접근</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.id}>
                <td><RoleBadge role={role.name} /></td>
                <td className="center"><ToggleSwitch checked={role.userManagement} onChange={() => handlePermissionChange(role.id, 'userManagement')} /></td>
                <td className="center"><ToggleSwitch checked={role.contentManagement} onChange={() => handlePermissionChange(role.id, 'contentManagement')} /></td>
                <td className="center"><ToggleSwitch checked={role.settingsAccess} onChange={() => handlePermissionChange(role.id, 'settingsAccess')} /></td>
                <td className="center"><ToggleSwitch checked={role.auditLog} onChange={() => handlePermissionChange(role.id, 'auditLog')} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 부서 권한 설정 컴포넌트 ---
const DepartmentPermissions = () => {
  const [departments, setDepartments] = useState([
    { id: 'legal', name: 'Legal', type: '법무팀', autoVerify: true, apiAccess: true },
    { id: 'swDev', name: 'SW 개발팀', type: 'SW개발팀', autoVerify: true, apiAccess: true },
    { id: 'design', name: 'Design', type: '디자인팀', autoVerify: false, apiAccess: false },
    { id: 'hr', name: 'HR', type: '인사팀', autoVerify: true, apiAccess: true },
    { id: 'planning', name: 'Planning', type: '기획팀', autoVerify: false, apiAccess: false },
  ]);

  const toggleDept = (id, key) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, [key]: !d[key] } : d));
  };

  return (
    <div className="card-box">
      <div className="card-header">
        <h3>부서별 접근 제어</h3>
        <p>부서 단위로 자동 검증 및 API 사용 권한을 관리합니다.</p>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{ width: '30%' }}>부서명</th>
              <th style={{ width: '20%' }}>팀 코드</th>
              <th className="center">자동 검증 (Auto)</th>
              <th className="center">API 접근</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(dept => (
              <tr key={dept.id}>
                <td style={{ fontWeight: '600', fontSize: '15px' }}>{dept.type}</td>
                <td style={{ color: '#888' }}>{dept.name}</td>
                <td className="center"><ToggleSwitch checked={dept.autoVerify} onChange={() => toggleDept(dept.id, 'autoVerify')} /></td>
                <td className="center"><ToggleSwitch checked={dept.apiAccess} onChange={() => toggleDept(dept.id, 'apiAccess')} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// --- Settings 메인 컴포넌트 ---
const Settings = () => {
  const [tabValue, setTabValue] = useState('팀원 관리');
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [selectedDepartment, setSelectedDepartment] = useState('모든 부서');

  // ⭐ 수정(12/05) — DB에서 팀원 목록 로드
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const res = await apiClient.get("/settings/team");
        setTeamMembers(res.data);
      } catch (err) {
        console.error("팀원 불러오기 실패:", err);
      }
    };

    fetchTeamMembers();
  }, []);

  // ⭐ 수정(12/05) — DB 삭제 연동
  const handleTeamMemberDelete = async (id) => {
    try {
      await apiClient.delete(`/settings/team/${id}`);
      setTeamMembers(prev => prev.filter(member => member.id !== id));
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  const [newMember, setNewMember] = useState({
    email: '',
    team: '법무',  /*12.03*/ 
    role: 'User',
  });

  // ⭐ 수정(12/05) — 초대하기 POST 백엔드 연동
  const handleInvite = async () => {
    try {
      const res = await apiClient.post("/settings/team", newMember);

      setTeamMembers(prev => [...prev, res.data]);

      setNewMember({ email: '', team: '법무', role: 'User' }); /*12.03*/
    } catch (err) {
      console.error("초대 실패:", err);
    }
  };
  
  const departmentOptions = ['모든 부서', '법무팀', '인사팀', '디자인팀','기획팀','sw개발팀']; /*12.03 */
  
  const filteredMembers = teamMembers.filter(member => 
    selectedDepartment === '모든 부서' || member.team.includes(selectedDepartment)
  );

  const TabPanel = ({ tabName, children }) => (
    <div style={{ padding: '20px 0' }} hidden={tabValue !== tabName}>
      {children}
    </div>
  );

  return (
    <div className="settings-container">
      <h2 className="page-title">설정 및 권한 관리</h2> {/* 클래스 추가 */}

      <div className="tabs-container"> {/* 감싸는 div 추가 */}
        <div className="tabs-header">
          {['팀원 관리', '사용자 관리', '부서 권한'].map((tab) => (
            <button
              key={tab}
              className={`tab-button ${tabValue === tab ? 'active' : ''}`}
              onClick={() => setTabValue(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="tabs-line"></div> {/* 하단 라인용 div */}
      </div>

      {/* 팀원 관리 탭 패널 */}
      <TabPanel tabName="팀원 관리">
        <div className="action-bar">
          <div className="invite-group">
            <input
              type="email"
              placeholder="이메일 주소 (user@company.com)"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              className="input-modern"
            />
            <select
              value={newMember.team}
              onChange={(e) => setNewMember({ ...newMember, team: e.target.value })}
              className="select-modern"
            >
              <option value="경영">경영팀</option>
              <option value="법무">법무팀</option>
              <option value="sw개발">SW개발팀</option>
              <option value="디자인">디자인팀</option>
              <option value="인사">인사팀</option>
            </select>
            <select
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              className="select-modern"
            >
              <option value="User">Admin</option>
              <option value="Admin">Institution</option>
              <option value="Admin">User</option>
            </select>
            <button onClick={handleInvite} className="btn-primary">
              + 초대하기
            </button>
          </div>
        </div>

        {/* 팀원 리스트 헤더 */}
        <div className="list-header">
          <h3>전체 멤버 <span className="count-badge">{filteredMembers.length}</span></h3>
        </div>

        {/* 팀원 리스트 (카드형 테이블) */}
        <div className="member-list">
          {filteredMembers.map((member) => (
            <div key={member.id} className="member-row">
              {/* 1. 사용자 정보 */}
              <div className="col-user">
                <div className="avatar">{member.email[0].toUpperCase()}</div>
                <div className="user-details">
                  <span className="email">{member.email}</span>
                  {member.email.startsWith('faker') && <span className="me-tag">ME</span>}
                </div>
              </div>

              {/* 2. 부서 정보 */}
              <div className="col-team">
                <select
                  value={member.team}
                  className="select-transparent"
                  onChange={() => { }} // 기능 연결 필요 시 추가
                >
                  <option value="경영팀">경영팀</option>
                  <option value="법무팀">법무팀</option>
                  <option value="sw개발팀">SW개발팀</option>
                  <option value="디자인팀">디자인팀</option>
                  <option value="인사팀">인사팀</option>
                </select>
              </div>

              {/* 3. 역할 뱃지 */}
              <div className="col-role">
                <span className={`role-pill ${member.role.toLowerCase()}`}>
                  {member.role}
                </span>
              </div>

              {/* 4. 삭제 버튼 */}
              <div className="col-action">
                {member.email.startsWith('faker') ? (
                  <span className="disabled-text">관리자</span>
                ) : (
                  <button
                    className="btn-delete-icon"
                    onClick={() => handleTeamMemberDelete(member.id)}
                    title="팀원 삭제"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </TabPanel>

      {/* 사용자 관리 탭 패널 */}
      <TabPanel tabName="사용자 관리">
        <RoleBasedPermissions />
      </TabPanel>

      {/* 부서 권한 탭 패널 */}
      <TabPanel tabName="부서 권한">
        <DepartmentPermissions />
      </TabPanel>
    </div>
  );
};

export default Settings;
