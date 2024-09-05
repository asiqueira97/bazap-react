import React from 'react'
import { useBazapContext } from '../../../context/BazapContext'
import FilterProducts from '../../../components/filter/filter-products'
import ProductsSold from './tabs/products-sold'
import ProductsPublisheds from './tabs/products-publisheds'
import ProductsAvailable from './tabs/products-available'
import style from './style.scss'

function Products() {

    const { productFilterSelected } = useBazapContext()

    return (
        <div className="Dashboard__Products">
            <FilterProducts />

            {productFilterSelected.name === 'mencionados' && (
                <ProductsSold />
            )}

            {productFilterSelected.name === 'publicados' && (
                <ProductsPublisheds />
            )}

            {productFilterSelected.name === 'disponíveis' && (
                <ProductsAvailable />
            )}
        </div>
    )
}

export default Products
