import React, { useState, useEffect } from 'react';
import apiClient from "../api/axiosConfig";
import './Settings.css';

const initialTeamMembers = [];

const ToggleSwitch = ({ checked }) => (
  <label className="toggle-switch">
    <input type="checkbox" checked={checked} disabled />
    <span className="slider round"></span>
  </label>
);

const RoleBadge = ({ role }) => (
  <span className={`role-badge ${role.toLowerCase()}`}>{role}</span>
);

const RoleBasedPermissions = () => {
  const [roles, setRoles] = useState([
    { id: 'admin', name: 'Admin', userManagement: true, contentManagement: true, settingsAccess: true, auditLog: true },
    { id: 'institution', name: 'Institution', userManagement: false, contentManagement: true, settingsAccess: true, auditLog: false },
    { id: 'user', name: 'User', userManagement: true, contentManagement: false, settingsAccess: true, auditLog: false },
  ]);

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
              <th className="center">등록 권한</th>
              <th className="center">발급 권한</th>
              <th className="center">검증 권한</th>
              <th className="center">설정 접근</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.id}>
                <td><RoleBadge role={role.name} /></td>
                <td className="center"><ToggleSwitch checked={role.userManagement} /></td>
                <td className="center"><ToggleSwitch checked={role.contentManagement} /></td>
                <td className="center"><ToggleSwitch checked={role.settingsAccess} /></td>
                <td className="center"><ToggleSwitch checked={role.auditLog} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Settings = () => {
  const [tabValue, setTabValue] = useState('팀원 관리');
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [selectedDepartment, setSelectedDepartment] = useState('모든 부서');

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

  const handleTeamMemberDelete = async (id) => {
    try {
      await apiClient.delete(`/settings/team/${id}`);
      setTeamMembers(prev => prev.filter(member => member.id !== id));
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

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
      <h2 className="page-title">설정 및 권한 관리</h2>

      <div className="tabs-container">
        <div className="tabs-header">
          {['팀원 관리', '사용자 관리'].map((tab) => (
            <button
              key={tab}
              className={`tab-button ${tabValue === tab ? 'active' : ''}`}
              onClick={() => setTabValue(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="tabs-line"></div>
      </div>

      {/* 팀원 관리 */}
      <TabPanel tabName="팀원 관리">
        {/* ❌ 초대 영역 제거됨 */}

        <div className="list-header">
          <h3>전체 멤버 <span className="count-badge">{filteredMembers.length}</span></h3>
        </div>

        <div className="member-list">
          {filteredMembers.map((member) => (
            <div key={member.id} className="member-row">
              <div className="col-user">
                <div className="avatar">{member.email[0].toUpperCase()}</div>
                <div className="user-details">
                  <span className="email">{member.email}</span>
                </div>
              </div>

              <div className="col-team">
                <select value={member.team} className="select-transparent" onChange={() => { }}>
                  <option value="기획팀">기획팀</option>
                  <option value="법무팀">법무팀</option>
                  <option value="sw개발팀">SW개발팀</option>
                  <option value="디자인팀">디자인팀</option>
                  <option value="인사팀">인사팀</option>
                </select>
              </div>

              <div className="col-role">
                <span className={`role-pill ${member.role.toLowerCase()}`}>
                  {member.role}
                </span>
              </div>

              <div className="col-action">
                <button
                  className="btn-delete-icon"
                  onClick={() => handleTeamMemberDelete(member.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </TabPanel>

      {/* 사용자 관리 */}
      <TabPanel tabName="사용자 관리">
        <RoleBasedPermissions />
      </TabPanel>
    </div>
  );
};

export default Settings;
