import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import './themeToggle.css';

const ThemeToggle = () => {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <button
      className="theme-toggle"
      onClick={() => setDark((prev) => !prev)}
      aria-label="Toggle light and dark mode"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
      <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
};

export default ThemeToggle;
