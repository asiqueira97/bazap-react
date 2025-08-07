import React from 'react';
import style from './style.scss';
import ImageNotFound from '.././../../../../assets/sem_foto.png'

function ProductCard({ product, elementRef }) {
  if (!product) return null;

  return (
    <div ref={elementRef} className="product-card">
      {product?.image
        ? <img src={product.image} width="60" />
        : <img src={ImageNotFound} />
      }
      <p>{product.product}</p>
    </div>
  );
}

export default ProductCard;
