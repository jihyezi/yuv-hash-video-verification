import React, { useState } from 'react';
import "./Settings.css"

// 초기 팀원 데이터 (기존과 동일)
const initialTeamMembers = [
  { id: 3, email: 'fakerisoverlucia@example.com', team: '경영팀', role: 'Admin' },
  { id: 4, email: 'poletrowing63@example.com', team: '변화대응팀', role: 'User' },
  { id: 5, email: 'legal_team@example.com', team: '법무팀', role: 'User' },
];

// --- 💡 새로운 컴포넌트 1: 역할 기반 권한 설정 (사용자 관리 탭) ---
const RoleBasedPermissions = () => {
    // 실제 데이터는 API에서 가져오거나 전역 상태 관리 (Redux, Context API 등)를 통해 관리
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

// --- 💡 새로운 컴포넌트 2: 부서 권한 설정 (부서 권한 탭) ---
const DepartmentPermissions = () => {
    // 실제 데이터는 API에서 가져오거나 전역 상태 관리를 통해 관리
    const [departments, setDepartments] = useState([
        { id: 'management', name: 'Management', type: '경영팀', defaultPermissions: true },
        { id: 'accounting', name: 'Accounting', type: '회계팀', defaultPermissions: false },
        { id: 'legal', name: 'Legal', type: '법무팀', defaultPermissions: true },
        { id: 'fieldResponse', name: 'Field Response', type: '현장대응팀', defaultPermissions: false },
    ]);

    const handlePermissionChange = (deptId) => {
        setDepartments(prevDepts => prevDepts.map(dept =>
            dept.id === deptId
                ? { ...dept, defaultPermissions: !dept.defaultPermissions }
                : dept
        ));
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
                                        checked={dept.defaultPermissions} 
                                        onChange={() => handlePermissionChange(dept.id)} 
                                    />
                                </td>
                                <td className="checkbox-cell">
                                <input 
                                        type="checkbox" 
                                        checked={dept.defaultPermissions} 
                                        onChange={() => handlePermissionChange(dept.id)} 
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


// --- Settings 메인 컴포넌트 (기존과 유사하나 TabPanel 내부 변경) ---
const Settings = () => {
  const [tabValue, setTabValue] = useState('팀원 관리');
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [selectedDepartment, setSelectedDepartment] = useState('모든 부서');

  const handleTeamMemberDelete = (id) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
  };
  
  const [newMember, setNewMember] = useState({
    email: '',
    team: '경영', // '경영팀' 대신 '경영'으로 변경하여 select option 값과 일치
    role: 'User',
  });

  const handleInvite = () => {
    console.log('초대 클릭됨:', newMember);
    const newId = Date.now();
    // '경영'을 '경영팀'으로 다시 조합
    setTeamMembers([...teamMembers, { id: newId, ...newMember, team: `${newMember.team}팀` }]); 
    setNewMember({ email: '', team: '경영', role: 'User' });
  };
  
  const departmentOptions = ['모든 부서', '경영', '법무'];
  
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
      
      {/* 팀원 관리 탭 패널 (기존과 동일) */}
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
            <option value="경영">부서 (팀) 배정: 경영팀</option>
            <option value="변화대응">부서 (팀) 배정: 변화대응팀</option>
            <option value="법무">부서 (팀) 배정: 법무팀</option>
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
                  <td>
                    <select value={member.team} className="select-inline">
                        <option value="경영팀">경영팀</option>
                        <option value="변화대응팀">변화대응팀</option>
                        <option value="법무팀">법무팀</option>
                    </select>
                  </td>
                  <td>
                    <select value={member.role} className="select-inline">
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                    </select>
                  </td>
                  <td>
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

      {/* 💡 사용자 관리 탭 패널 (새로운 컴포넌트 렌더링) */}
      <TabPanel tabName="사용자 관리">
        <RoleBasedPermissions />
      </TabPanel>

      {/* 💡 부서 권한 탭 패널 (새로운 컴포넌트 렌더링) */}
      <TabPanel tabName="부서 권한">
        <DepartmentPermissions />
      </TabPanel>
    </div>
  );
};

export default Settings;