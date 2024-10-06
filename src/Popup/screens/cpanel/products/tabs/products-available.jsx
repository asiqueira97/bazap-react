import React, {useState, createRef} from 'react'
import Search from '../../../../components/search/search'
import ProductCard from '../../../../components/product-card/product-card'
import { removerAcentos, generateProducsAvailable} from '../../../../utils/utils'

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

    const elRefs = Array(productList.length).fill().map((_, i) => createRef())

    const refTest = createRef()

    const handleClickDownload = () => {
        console.log('gerar download product')
        generateProducsAvailable(refTest)
    }

    return (
        <div className="Products__content">

            <div>
                <div className="flex-row justify-between align-center" style={{margin: '15px 0px'}}>
                    <h3>Disponíveis ({productList.length})</h3>
                    <button className="download-button" onClick={handleClickDownload}>Baixar</button>
                </div>
                <Search onChange={handleSearch} />
            </div>

            <div className="products" ref={refTest}>
                { productList.map((product, index) => {

                    const newProduct = {
                        product: product.name,
                        imageUrl: product.urlImages[1] || product.urlImages[0]
                    }

                    return (
                        <ProductCard key={index} product={newProduct} elementRef={elRefs[index]}  />
                    )
                }) }
            </div>
        </div>
    )
}

export default ProductsAvailable
