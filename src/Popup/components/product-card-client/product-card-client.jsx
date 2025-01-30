import React from 'react'
import ProductCard from '../product-card/product-card'
import CardPaymentInfo from '../card-payment-info/card-payment-info'
import style from './style.scss'

function ProductCardClient({productList, index, elementRef}) {

    const products = productList[index]

    if(!products) return null

    const total = products?.reduce( (count, total) => {
        return count + total.price
      }, 0.0 )

    const profileImage = products[0].imageProfile

    return (
        <div className="ProductCardClient" ref={elementRef}>
            <div className="infoClient">
                <div className="info">
                    <h3>{index}</h3>
                </div>

                <div className="total">
                    <h3>{total.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</h3>
                </div>
            </div>

            <div className="product-list">
                {products.map( (product, index) => (
                    <ProductCard hideProductInvalid={true} product={product} key={index} />
                ))}
            </div>
            
            <CardPaymentInfo />
        </div>
    )
}

export default ProductCardClient
