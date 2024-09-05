import React from 'react'
import style from './style.scss'

function ProductCard({product}) {

    if(!product) return null;

    return (
        <div className="product-card">
            <img src={product.imageUrl} width="60" />
            <p>
                {product.product}
            </p>

            {product.flag ? <div className={`flag flag-${product.flag}`}>{product.flag}</div> : <></>}
        </div>
    )
}

export default ProductCard
