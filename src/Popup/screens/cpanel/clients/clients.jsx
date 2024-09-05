import React, {useState, createRef} from 'react'
import Search from '../../../components/search/search'
import ProductCardClient from '../../../components/product-card-client/product-card-client'
import ModaReportClient from '../../../components/modal/modal-report-client'
import { useBazapContext } from '../../../context/BazapContext'
import { generateReportImages, generateReportPdf, removerAcentos } from '../../../utils/utils'
import style from './style.scss'

function Clients() {
    
    const productsByClient = JSON.parse( localStorage.getItem('products-by-client') )
    
    const { handleModal, setShowPix } = useBazapContext()

    const [products, setProducts] = useState(productsByClient)

    const handleSearch = (e) => {
        const value = e.target.value.trim().toLowerCase()
        const filtered = Object.keys(productsByClient).filter( client => {
            return client.toLowerCase().includes(value) || removerAcentos(client).toLowerCase().includes(value)
        } )
        
        if(filtered.length > 0) setProducts(filtered)
    }

    const productList = products.length > 0 ? products : Object.keys(productsByClient)

    const elRefs = Array(productList.length).fill().map((_, i) => createRef())

    const handleClickModal = () => {
        setShowPix(true)
        handleModal('report-clients','open')
    }

    return (
        <>
            <div className="Dashboard__Clients">
                <div className="download-container">
                    <h3>Produtos separados por cliente</h3>
                    <button type="button" onClick={handleClickModal}>Baixar relatório</button>
                </div>

                <div className="Dashboard__Clients-content">
                    <Search 
                        title={''} 
                        total={productList.length} 
                        placeholder={'Buscar cliente'}
                        onChange={handleSearch}
                        origin='clients'
                    />

                    <div className="Dashboard__Clients-productList">
                        {productList.length > 0 && productList.map( (key, index) => <ProductCardClient elementRef={elRefs[index]} productList={productsByClient} index={key} key={index} /> ) }
                    </div>

                </div>
            </div>
            
            <ModaReportClient name='report-clients'>
                <p className="title">Escolha a forma de download</p>

                <div className="info-download">
                    <ul>
                        <li>PDF: Arquivo pdf completo com todas as vendas separado por cliente.</li>
                        <li>Imagens: Arquivo zip com imagens de venda por cliente.</li>
                    </ul>
                </div>

                <div className="flex-row justify-around align-center">
                    <div className="flex-row" style={{gap: 10}}>
                        <button
                            className="download-button"
                            onClick={() => generateReportPdf(elRefs)}
                        >
                            PDF
                        </button>

                        <button 
                            className="download-button" 
                            onClick={() => generateReportImages(productList, elRefs)}
                        >
                            IMAGENS
                        </button>
                    </div>
                </div>
            </ModaReportClient>
        </>
    )
}

export default Clients
