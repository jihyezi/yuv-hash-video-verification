import React, { useState } from 'react';
import './Settings.css'; // 외부 CSS 파일 import

// 초기 팀원 데이터
const initialTeamMembers = [
  { id: 3, email: 'fakerisoverlucia@example.com', team: '경영팀', role: 'Admin' },
  { id: 4, email: 'poletrowing63@example.com', team: '변화대응팀', role: 'User' },
  { id: 5, email: 'legal_team@example.com', team: '법무팀', role: 'User' },
];

// --- 역할 기반 권한 설정 컴포넌트 (사용자 관리 탭 내용) ---
const RoleBasedPermissions = () => {
    const [roles, setRoles] = useState([
        { id: 'admin', name: 'Admin', userManagement: true, contentManagement: true, settingsAccess: true, auditLog: true },
        { id: 'institution', name: 'Institution', userManagement: false, contentManagement: true, settingsAccess: false, auditLog: false },
        { id: 'user', name: 'User', userManagement: false, contentManagement: true, settingsAccess: false, auditLog: false },
    ]);

    const handlePermissionChange = (roleId, permissionKey) => {
        setRoles(prevRoles => prevRoles.map(role =>
            role.id === roleId
                ? { ...role, [permissionKey]: !role[permissionKey] }
                : role
        ));
    };

    return (
        <div className="permissions-section">
            <h3 style={{ margin: '15px 0' }}>역할별 권한 기준</h3>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>역할 (ROLE)</th>
                            <th>검증</th>
                            <th>발급</th>
                            <th>사용자 관리</th>
                            <th>설정 관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map(role => (
                            <tr key={role.id}>
                                <td>{role.name}</td>
                                <td className="checkbox-cell">
                                    <input 
                                        type="checkbox" 
                                        checked={role.userManagement} 
                                        onChange={() => handlePermissionChange(role.id, 'userManagement')} 
                                    />
                                </td>
                                <td className="checkbox-cell">
                                    <input 
                                        type="checkbox" 
                                        checked={role.contentManagement} 
                                        onChange={() => handlePermissionChange(role.id, 'contentManagement')} 
                                    />
                                </td>
                                <td className="checkbox-cell">
                                    <input 
                                        type="checkbox" 
                                        checked={role.settingsAccess} 
                                        onChange={() => handlePermissionChange(role.id, 'settingsAccess')} 
                                    />
                                </td>
                                <td className="checkbox-cell">
                                    <input 
                                        type="checkbox" 
                                        checked={role.auditLog} 
                                        onChange={() => handlePermissionChange(role.id, 'auditLog')} 
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- 부서 권한 설정 컴포넌트 (부서 권한 탭 내용) ---
const DepartmentPermissions = () => {
    const [departments, setDepartments] = useState([
      { id: 'legal', name: 'Legal', type: '법무팀', autoVerify: true, apiAccess: true },
      { id: 'swDev', name: 'SW 개발팀', type: 'SW개발팀', autoVerify: true, apiAccess: true },
      { id: 'design', name: 'Design', type: '디자인팀', autoVerify: false, apiAccess: false },
      { id: 'hr', name: 'HR', type: '인사팀', autoVerify: true, apiAccess: true },
      { id: 'planning', name: 'Planning', type: '기획팀', autoVerify: false, apiAccess: false },
    ]);

    const handleAutoVerifyChange = (deptId) => {
        setDepartments(prev =>
            prev.map(d => d.id === deptId ? { ...d, autoVerify: !d.autoVerify } : d)
        );
    };

    const handleApiAccessChange = (deptId) => {
        setDepartments(prev =>
            prev.map(d => d.id === deptId ? { ...d, apiAccess: !d.apiAccess } : d)
        );
    };

    return (
        <div className="permissions-section">
            <h3 style={{ margin: '15px 0' }}>부서별 권한 기준</h3>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>역할 (ROLE)</th>
                            <th>부서명</th>
                            <th>자동 검증(AUTO SYSTEM)</th>
                            <th>API 접근 허용</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map(dept => (
                            <tr key={dept.id}>
                                <td>{dept.name}</td>
                                <td>{dept.type}</td>
                                <td className="checkbox-cell">
                                    <input 
                                        type="checkbox" 
                                        checked={dept.autoVerify} 
                                        onChange={() => handleAutoVerifyChange(dept.id)} 
                                    />
                                </td>
                                <td className="checkbox-cell">
                                    <input 
                                        type="checkbox" 
                                        checked={dept.apiAccess} 
                                        onChange={() => handleApiAccessChange(dept.id)} 
                                    />
                                </td>
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

  const handleTeamMemberDelete = (id) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
  };
  
  const [newMember, setNewMember] = useState({
    email: '',
    team: '경영', 
    role: 'User',
  });

  const handleInvite = () => {
    const newId = Date.now();
    setTeamMembers([...teamMembers, { id: newId, ...newMember, team: `${newMember.team}팀` }]); 
    setNewMember({ email: '', team: '경영', role: 'User' });
  };
  
  const departmentOptions = ['모든 부서', '경영', '변화대응', '법무'];
  
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
      <h2 style={{ marginBottom: '20px' }}>설정 및 권한 관리</h2>

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
      
      {/* 팀원 관리 탭 패널 */}
      <TabPanel tabName="팀원 관리">
        <h3 style={{ margin: '15px 0' }}>새 팀원 초대</h3>
        <div className="invite-form-container">
          <input 
            type="email"
            placeholder="팀원의 이메일 주소" 
            value={newMember.email}
            onChange={(e) => setNewMember({...newMember, email: e.target.value})}
            className="input-field"
          />
          <select 
            value={newMember.team} 
            onChange={(e) => setNewMember({...newMember, team: e.target.value})}
            className="select-field"
          >
            <option value="법무">부서 (팀) 배정: 법무팀</option>
            <option value="sw개발">부서 (팀) 배정: sw개발팀</option>
            <option value="디자인">부서 (팀) 배정: 디자인팀</option>
            <option value="인사">부서 (팀) 배정: 인사팀</option>
            <option value="기획">부서 (팀) 배정: 기획팀</option>
          </select>
          <select 
            value={newMember.role} 
            onChange={(e) => setNewMember({...newMember, role: e.target.value})}
            className="select-field"
          >
            <option value="Admin">역할 (Role) 배정: Admin</option>
            <option value="User">역할 (Role) 배정: User</option>
          </select>
          <button onClick={handleInvite} className="primary-button">
            초대하기
          </button>
        </div>

        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            margin: '25px 0 10px 0' 
        }}>
            <h3 style={{ margin: 0 }}>현재 팀원 (총 {filteredMembers.length}명)</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
                <select 
                    className="small-select-field"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                    {departmentOptions.map(dept => (
                        <option key={dept} value={dept}>
                            {dept === '모든 부서' ? dept : `${dept} 부서 보기`}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>사용자</th>
                <th>부서 (팀)</th>
                <th>역할 (Role)</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td>
                    {member.email}
                    {member.email === 'fakerisoverlucia@example.com' && <span style={{ marginLeft: '5px', color: 'gray', fontSize: '12px' }}>(본인)</span>}
                  </td>
                  <td className="table-center-cell">
                    <select value={member.team} className="select-inline">
                        <option value="경영팀">법무팀</option>
                        <option value="sw개발팀">sw개발팀</option>
                        <option value="디자인팀">디자인팀</option>
                        <option value="인사팀">인사팀</option>
                        <option value="기획팀">기획팀</option>
                    </select>
                  </td>
                  <td className="table-center-cell">
                    <select value={member.role} className="select-inline">
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                    </select>
                  </td>
                  <td className="table-center-cell">
                    {member.email !== 'fakerisoverlucia@example.com' ? (
                      <button 
                        className="delete-button"
                        onClick={() => handleTeamMemberDelete(member.id)}
                      >
                        삭제
                      </button>
                    ) : (
                      <span style={{ color: 'gray', fontSize: '12px' }}>(본인)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
