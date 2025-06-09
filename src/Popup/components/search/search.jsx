import React from 'react';
import style from './style.scss';

function Search({ placeholder, onChange }) {
  return (
    <div className="search">
      <input type="text" placeholder={placeholder || 'Buscar'} onChange={onChange} />
    </div>
  );
}

export default Search;
