import { useEffect, useState } from 'react';
import notify from '../../../../utils/toast';
import axios from '../../../../utils/axios';
import {
  Users,
  Stethoscope,
  CalendarCheck,
  Receipt,
  Star,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  CalendarRange,
} from 'lucide-react';
import './analyticsHome.css';

const AnalyticsHome = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (appliedFrom) params.set('from', appliedFrom);
        if (appliedTo) params.set('to', appliedTo);
        const qs = params.toString() ? `?${params.toString()}` : '';
        const res = await axios.get(`/analytics/overview${qs}`);
        setData(res.data);
      } catch (e) {
        notify.error(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [appliedFrom, appliedTo]);

  const applyRange = () => {
    if (from && to && from > to) return notify.warning('Start date must be before end date');
    setAppliedFrom(from);
    setAppliedTo(to);
  };

  const clearRange = () => {
    setFrom('');
    setTo('');
    setAppliedFrom('');
    setAppliedTo('');
  };

  if (loading) return <div className="loading-state">Loading analytics...</div>;
  if (!data) return <div className="loading-state">No analytics data available.</div>;

  const { counts, statusBreakdown, appointmentsPerDoctor, appointmentsPerDay, revenue, avgRating, ratingsCount } = data;
  const maxDoctor = Math.max(...appointmentsPerDoctor.map(d => d.count), 1);
  const maxDay = Math.max(...appointmentsPerDay.map(d => d.count), 1);

  return (
    <div className="analytics-container">

      <div className="dashboard-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Overview of hospital performance and key metrics.</p>
        </div>
        <div className="header-badge">
          <TrendingUp size={16} />
          <span>Live Overview</span>
        </div>
      </div>

      <div className="analytics-range-filter">
        <div className="range-filter-label">
          <CalendarRange size={16} /> Date Range
        </div>
        <div className="range-inputs">
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={e => setFrom(e.target.value)}
            aria-label="From date"
          />
          <span className="range-sep">to</span>
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={e => setTo(e.target.value)}
            aria-label="To date"
          />
        </div>
        <div className="range-actions">
          <button className="range-apply-btn" onClick={applyRange}>Apply</button>
          {(from || to || appliedFrom || appliedTo) && (
            <button className="range-clear-btn" onClick={clearRange}>Clear</button>
          )}
        </div>
        {(appliedFrom || appliedTo) && (
          <span className="range-active-note">
            Showing revenue for {appliedFrom || 'start'} — {appliedTo || 'today'}
          </span>
        )}
      </div>

      <div className="analytics-cards">
        <div className="analytics-card">
          <div className="analytics-card-icon"><Users size={20} /></div>
          <div>
            <span className="analytics-card-label">Total Patients</span>
            <span className="analytics-card-value">{counts.patients}</span>
          </div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-icon"><Stethoscope size={20} /></div>
          <div>
            <span className="analytics-card-label">Total Doctors</span>
            <span className="analytics-card-value">{counts.doctors}</span>
          </div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-icon"><CalendarCheck size={20} /></div>
          <div>
            <span className="analytics-card-label">Total Appointments</span>
            <span className="analytics-card-value">{counts.appointments}</span>
          </div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-icon"><Receipt size={20} /></div>
          <div>
            <span className="analytics-card-label">Total Invoices</span>
            <span className="analytics-card-value">{counts.invoices}</span>
          </div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-icon"><IndianRupee size={20} /></div>
          <div>
            <span className="analytics-card-label">Revenue Collected</span>
            <span className="analytics-card-value">₹{revenue.totalRevenue.toLocaleString()}</span>
          </div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-icon"><Star size={20} /></div>
          <div>
            <span className="analytics-card-label">Avg Rating</span>
            <span className="analytics-card-value">{avgRating || '—'} <small>({ratingsCount})</small></span>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-panel">
          <h3>Appointment Status Breakdown</h3>
          <div className="status-bar-list">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div className="status-bar-item" key={status}>
                <span className="status-bar-label">{status}</span>
                <div className="status-bar-track">
                  <div
                    className={`status-bar-fill ${status.toLowerCase()}`}
                    style={{ width: `${counts.appointments ? (count / counts.appointments) * 100 : 0}%` }}
                  />
                </div>
                <span className="status-bar-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-panel">
          <h3>Top Doctors by Appointments</h3>
          {appointmentsPerDoctor.length > 0 ? (
            <div className="doctor-bar-list">
              {appointmentsPerDoctor.map((d, i) => (
                <div className="doctor-bar-item" key={i}>
                  <span className="doctor-bar-label">{d.name}</span>
                  <div className="doctor-bar-track">
                    <div className="doctor-bar-fill" style={{ width: `${(d.count / maxDoctor) * 100}%` }} />
                  </div>
                  <span className="doctor-bar-count">{d.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="analytics-empty">
              <AlertCircle size={24} />
              <p>No appointments recorded yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="analytics-panel">
        <h3>Appointments in the Last {appointmentsPerDay.length || 14} Days</h3>
        {appointmentsPerDay.length > 0 ? (
          <div className="daily-bars">
            {appointmentsPerDay.map((d, i) => (
              <div className="daily-bar" key={i} title={`${d.date}: ${d.count}`}>
                <div className="daily-bar-value">{d.count || ''}</div>
                <div className="daily-bar-track">
                  <div className="daily-bar-fill" style={{ height: `${(d.count / maxDay) * 100}%` }} />
                </div>
                <div className="daily-bar-label">{d.date ? d.date.slice(5) : d.date}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="analytics-empty">
            <p>No appointment data for this period.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsHome;
