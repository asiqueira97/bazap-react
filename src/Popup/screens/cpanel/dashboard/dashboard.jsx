import React from 'react'
import style from './style.scss'

const Dashboard = () => {
    const getProductsByClient = JSON.parse( localStorage.getItem('products-by-client') ) || []
    const getProductsPublished = JSON.parse( localStorage.getItem('published-products') ) || []

    const flatProductsByClient = Object.values(getProductsByClient).flat()

    const productsSold = getProductsPublished.filter( prod => flatProductsByClient.some( sold => sold.id === prod.id ) )
    const availables = getProductsPublished.filter( prod => !productsSold.some( sold => sold.id === prod.id ))

    const total = flatProductsByClient.reduce((acc, item) => acc + item.price, 0.0);
    const totalClients = Object.keys(getProductsByClient).length;
    const totalProductsPublished = getProductsPublished.length;
    const totalProductsSold = productsSold.length;
    const totalProductsAvailable = availables.length

    return (
        <div className="Dashboard__cards">
            <h2>Resumo do dia</h2>

            <div className="Dashboard__cards-content">
                <div className="card">
                    <h4>Total (estimado)</h4>
                    <span className="color-green">{total.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</span>
                </div>

                <div className="card">
                    <h4>Clientes</h4>
                    <span>{totalClients}</span>
                </div>
            </div>


            <div className="Dashboard__cards-content" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
                <div className="card">
                    <h4>Peças publicadas</h4>
                    <span>{totalProductsPublished}</span>
                </div>

                <div className="card">
                    <h4>Peças vendidas</h4>
                    <span>{totalProductsSold}</span>
                </div>

                <div className="card">
                    <h4>Peças disponíveis</h4>
                    <span>{totalProductsAvailable}</span>
                </div>
            </div>

            <div className="Dashboard__info">
                <p>
                    IMPORTANTE: Para o bom funcionamento do programa, é esperado que todas as publicações dos produtos tenham sido feitas corretamente. Caso contrário, poderá haver
                    diferença nos cálculos e separação dos produtos.
                </p>
            </div>

        </div>
    )
}

export default Dashboard
