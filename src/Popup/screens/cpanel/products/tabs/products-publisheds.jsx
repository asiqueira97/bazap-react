import React, {useState} from 'react'
import Search from '../../../../components/search/search'
import ProductCard from '../../../../components/product-card/product-card'
import { removerAcentos } from '../../../../utils/utils'

function ProductsPublisheds() {

    const productsPublished = JSON.parse( localStorage.getItem('published-products') )
    
    const [search, setSearch] = useState([])
    
    const handleSearch = (e) => {
        const value = e.target.value.trim().toLowerCase()
        const filtered = productsPublished.filter( p => {
            return p.name.toLowerCase().includes(value) || removerAcentos(p.name).toLowerCase().includes(value) || p.flag.includes(value)
        } )
        
        if(filtered.length > 0) setSearch(filtered)
    }
    
    const productList = search.length > 0 ? search : productsPublished

    return (
        <div className="Products__content">
            <div>
                <div className="flex-row justify-between align-center" style={{margin: '15px 0px'}}>
                    <h3>Publicados ({productList.length})</h3>
                </div>
                <Search onChange={handleSearch} />
            </div>

            <div className="products">
                { productList.map((product, index) => {

                    const newProduct = {
                        product: product.name,
                        imageUrl: product.urlImages[1] || product.urlImages[0],
                        flag: product.flag
                    }

                    return (
                        <ProductCard key={index} product={newProduct}  />
                    )
                }) }
            </div>
        </div>
    )
}

export default ProductsPublisheds
