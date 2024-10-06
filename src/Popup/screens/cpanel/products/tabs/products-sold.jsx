import React, {useState} from 'react'
import Search from '../../../../components/search/search'
import ProductSoldCard from '../../../../components/product-sold-card/product-sold-card'
import { removerAcentos } from '../../../../utils/utils'

function ProductsSold() {

    const productsSold = JSON.parse(
        localStorage.getItem('products-mentioned')
    )

    const [search, setSearch] = useState([])

    const handleSearch = (e) => {
        const value = e.target.value.trim()
        const filtered = Object.keys(productsSold).filter( product => {
            return product.toLowerCase().includes(value) || removerAcentos(product).toLowerCase().includes(value)
        } )

       if(filtered.length > 0) setSearch(filtered)
    }

    const productList = search.length > 0 ? search : Object.keys( productsSold )

    return (
        <div className="Products__content">
            <div>
                <div className="flex-row justify-between align-center" style={{margin: '15px 0px'}}>
                    <h3>Mencionados ({productList.length})</h3>
                </div>
                <Search onChange={handleSearch} />
            </div>

            <div className="products-sold">
                { productList.map((key, index) => (
                    <ProductSoldCard key={index} product={key} products={productsSold} />   
                )) }
            </div>
        </div>
    )
}

export default ProductsSold
