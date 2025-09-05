import React from 'react';
import ProductImage from '../../../../components/product-mage/ProductImage';
import style from './style.scss';

function ProductCard({ product, elementRef }) {
  if (!product) return null;

  return (
    <div ref={elementRef} className="product-card">
      <ProductImage productId={product.productId} />
      <p>{product.product}</p>
    </div>
  );
}

export default ProductCard;
