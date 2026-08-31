import { useEffect, useState } from 'react';
import notify from '../../../../utils/toast';
import axios from '../../../../utils/axios';
import { ScrollText, User, Clock } from 'lucide-react';
import Pagination from '../../../Pagination/pagination';
import './logsHome.css';

const roleColor = role => {
  switch (role) {
    case 'admin':
      return 'role-admin';
    case 'doctor':
      return 'role-doctor';
    default:
      return 'role-patient';
  }
};

const LogsHome = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const getLogs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/activity-logs?page=${page}&limit=15`);
        setLogs(res.data.items || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (e) {
        notify.error(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    };
    getLogs();
  }, [page]);

  return (
    <div className="logs-home-container">

      <div className="dashboard-header">
        <div>
          <h1>Activity Logs</h1>
          <p>Audit trail of all system activity.</p>
        </div>
        <div className="header-badge">
          <ScrollText size={16} />
          <span>Audit Trail</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading activity logs...</div>
      ) : logs.length > 0 ? (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Details</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id}>
                  <td>
                    <span className="cell-with-icon">
                      <User size={14} />
                      {log.user?.name || 'System'}
                    </span>
                  </td>
                  <td>
                    <span className={`role-tag ${roleColor(log.role)}`}>{log.role}</span>
                  </td>
                  <td><strong>{log.action}</strong></td>
                  <td className="log-details-cell">{log.details}</td>
                  <td>
                    <span className="cell-with-icon">
                      <Clock size={14} />
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : (
        <div className="empty-logs">
          <ScrollText size={64} strokeWidth={1} />
          <h3>No activity yet</h3>
          <p>System actions will be recorded here.</p>
        </div>
      )}
    </div>
  );
};

export default LogsHome;
