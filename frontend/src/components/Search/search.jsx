import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import './search.css';

const Search = ({ onSearch, placeholder = 'Search...' }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (onSearch) onSearch(query.trim());
  };

  const handleChange = e => {
    setQuery(e.target.value);
    if (onSearch && e.target.value === '') onSearch('');
  };

  return (
    <form className="search-container" onSubmit={handleSubmit} role="search">
      <SearchIcon size={16} className="search-icon" />
      <input
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        aria-label="Search"
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default Search;
