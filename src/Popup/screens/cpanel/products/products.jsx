import React, { useState } from 'react';
import ProductsSold from './tabs/products-sold';
import ProductsPublished from './tabs/products-published';
import ProductsAvailable from './tabs/products-available';
import style from './style.scss';

function Products() {
  const optionsProductsPage = [
    { type: 'mentioned', name: "Mencionados", active: true },
    { type: 'published', name: "Publicados", active: false },
    { type: 'available', name: "Não vendidos", active: false },
  ];

  const [optionsProductFilter, setOptionsProductFilter] = useState(optionsProductsPage);
  const productFilterSelected = optionsProductFilter.find((option) => option.active);

  const handleClick = (option) => {
    const newOptions = optionsProductFilter.map((opt) => ({
      ...opt,
      active: opt.name === option.name,
    }));

    setOptionsProductFilter(newOptions);
  };

  return (
    <div className="Dashboard__Products">
      <div className="options_container">
        <h4>Escolha um filtro abaixo:</h4>
        <div className="options">
          {optionsProductFilter.map((option) => (
            <button
              key={option.type}
              className={option.active ? 'active' : ''}
              type="button"
              onClick={() => handleClick(option)}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      {productFilterSelected.type === 'mentioned' && <ProductsSold />}
      {productFilterSelected.type === 'published' && <ProductsPublished />}
      {productFilterSelected.type === 'available' && <ProductsAvailable />}
    </div>
  );
}

export default Products;
