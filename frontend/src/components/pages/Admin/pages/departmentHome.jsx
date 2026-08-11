import axios from '../../../../utils/axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Building2 } from 'lucide-react';
import './departmentHome.css';

const Department = () => {
  const [department, setDepartment] = useState([]);

  const getDepartments = async () => {
    try {
      const response = await axios.get('/department/get');
      setDepartment(response.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to fetch departments');
    }
  };

  useEffect(() => {
    getDepartments();
  }, []);

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building2 size={28} style={{ color: 'var(--primary)' }} />
          <h2>Departments</h2>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Description</th>
              <th>Doctors Assigned</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {department.map(item => {
              const status = item.status || 'Active';
              const statusClass = status.toLowerCase() === 'active' ? 'status-active' : 'status-inactive';
              return (
                <tr key={item._id}>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.description}</td>
                  <td>{item.doctorsAssigned || 0}</td>
                  <td>
                    <span className={`status-badge ${statusClass}`}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {department.length === 0 && (
          <div className="empty-state-message">
            No departments found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Department;
