import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft, LayoutDashboard } from 'lucide-react';
import './commandPalette.css';

const roleSections = {
  admin: [
    { label: 'Dashboard', to: '/admin' },
    { label: 'Departments', to: '/admin/departments' },
    { label: 'Doctors', to: '/admin/doctors' },
    { label: 'Add Doctor', to: '/admin/doctors/add' },
    { label: 'Patients', to: '/admin/patients' },
    { label: 'Appointments', to: '/admin/appointments' },
    { label: 'Medicines', to: '/admin/medicines' },
    { label: 'Add Medicine', to: '/admin/medicines/add' },
    { label: 'Analytics', to: '/admin/analytics' },
    { label: 'Invoices', to: '/admin/invoices' },
    { label: 'Activity Logs', to: '/admin/logs' },
  ],
  doctor: [
    { label: 'Dashboard', to: '/doctor' },
    { label: 'Appointments', to: '/doctor/appointments' },
    { label: 'Calendar', to: '/doctor/calendar' },
    { label: "Today's Appointments", to: '/doctor/today' },
    { label: 'My Availability', to: '/doctor/availability' },
    { label: 'Profile', to: '/doctor/profile' },
  ],
  patient: [
    { label: 'Dashboard', to: '/patient' },
    { label: 'Book Appointment', to: '/patient/appointments' },
    { label: 'My Appointments', to: '/patient/my-appointments' },
    { label: 'Prescriptions', to: '/patient/prescriptions' },
    { label: 'Medical Records', to: '/patient/records' },
    { label: 'Invoices', to: '/patient/invoices' },
    { label: 'Profile', to: '/patient/profile' },
  ],
};

const getInitial = () => {
  try {
    const last = localStorage.getItem('lastActiveSection');
    if (last && roleSections[last]) return last;
  } catch {}
  return localStorage.getItem('role') || 'patient';
};

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const section = getInitial();

  const allItems = useMemo(() => {
    const list = roleSections[section] || [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(i => i.label.toLowerCase().includes(q));
  }, [query, section]);

  useEffect(() => {
    const onKeyDown = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
        setQuery('');
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const go = item => {
    localStorage.setItem('lastActiveSection', section);
    setOpen(false);
    setQuery('');
    navigate(item.to);
  };

  const onKeyDown = e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(prev => (prev + 1) % Math.max(allItems.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(prev => (prev - 1 + Math.max(allItems.length, 1)) % Math.max(allItems.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[activeIdx]) go(allItems[activeIdx]);
    }
  };

  if (!open) return null;

  return (
    <div className="cmd-overlay" onMouseDown={() => setOpen(false)}>
      <div className="cmd-palette" onMouseDown={e => e.stopPropagation()}>
        <div className="cmd-input-wrap">
          <Search size={18} className="cmd-search-icon" />
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="Jump to a page... (↑↓ to navigate, Enter to select)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <kbd className="cmd-kbd">ESC</kbd>
        </div>

        <div className="cmd-list" ref={listRef}>
          {allItems.length > 0 ? (
            allItems.map((item, idx) => (
              <button
                key={item.to}
                className={`cmd-item ${idx === activeIdx ? 'active' : ''}`}
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => go(item)}
                role="option"
                aria-selected={idx === activeIdx}
              >
                <LayoutDashboard size={16} />
                <span>{item.label}</span>
                <kbd className="cmd-enter-hint">
                  <CornerDownLeft size={12} />
                </kbd>
              </button>
            ))
          ) : (
            <div className="cmd-empty">No results for "{query}"</div>
          )}
        </div>

        <div className="cmd-footer">
          <span><kbd>Ctrl K</kbd> Open navigation</span>
          <span><kbd>↑↓</kbd> Navigate</span>
          <span><kbd>Enter</kbd> Select</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
