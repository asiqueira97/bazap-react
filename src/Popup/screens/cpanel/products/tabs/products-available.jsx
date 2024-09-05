import React, {useState} from 'react'
import Search from '../../../../components/search/search'
import ProductCard from '../../../../components/product-card/product-card'
import { removerAcentos } from '../../../../utils/utils'

function ProductsAvailable() {

    const productsByClient = JSON.parse( localStorage.getItem('products-by-client') )
    const productsPublished = JSON.parse( localStorage.getItem('published-products') )

    const productsAllClients = Object.values(productsByClient).flat()

    const isSold = (product) => productsAllClients.some(soldProduct => soldProduct.id === product.id);
    const productsAvailable = productsPublished.filter(product => !isSold(product));

    const [search, setSearch] = useState([])

    const handleSearch = (e) => {
        const value = e.target.value.trim().toLowerCase()
        const filtered = productsAvailable.filter( p => {
            return p.name.toLowerCase().includes(value) || removerAcentos(p.name).toLowerCase().includes(value)
        } )
        
        if(filtered.length > 0) setSearch(filtered)
    }

    const productList = search.length ? search : productsAvailable

    return (
        <div className="Products__content">
            <Search title={'publicados'} total={productList.length} onChange={handleSearch} />

            <div className="products">
                { productList.map((product, index) => {

                    const newProduct = {
                        product: product.name,
                        imageUrl: product.urlImages[1] || product.urlImages[0]
                    }

                    return (
                        <ProductCard key={index} product={newProduct}  />
                    )
                }) }
            </div>
        </div>
    )
}

export default ProductsAvailable
