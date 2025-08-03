import React from 'react';
import style from './style.scss';

function ProductCard({ product, elementRef }) {
  if (!product) return null;

  return (
    <div ref={elementRef} className="product-card">
      <img src={product.image} width="60" />
      <p>{product.product}</p>

      {/* {product.media ? <div className={`flag flag-${product.media}`}>{product.media}</div> : <></>} */}
    </div>
  );
}

export default ProductCard;
