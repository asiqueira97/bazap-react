import React from 'react';
import { useAppStore } from '../../../../store/useAppStore';
import style from './style.scss';

const Dashboard = () => {
  const { buyersPerProduct, publishedProducts, dateSearched } = useAppStore()

  if (!buyersPerProduct.length) {
    return (
      <h1>Dados não processados</h1>
    )
  }

  const buyersPerProductFiltered = buyersPerProduct.filter(prod => prod.levou !== null)

  const total = buyersPerProductFiltered.reduce((acc, item) => acc + item.price, 0.0);
  const totalProductsPublished = publishedProducts.length ?? 0;
  const totalProductsSold = buyersPerProductFiltered.length ?? 0;
  const totalProductsAvailable = totalProductsPublished - totalProductsSold;
  const totalClients = new Set(buyersPerProductFiltered.map(p => p.levou).filter(Boolean)).size ?? 0;

  return (
    <div className="Dashboard__cards">
      <h2>Resumo do dia {dateSearched ?? ''}</h2>

      <div className="Dashboard__cards-content">
        <div className="card">
          <h4>Total (estimado)</h4>
          <span className="color-green">
            {total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>

        <div className="card">
          <h4>Clientes</h4>
          <span>{totalClients}</span>
        </div>
      </div>

      <div className="Dashboard__cards-content" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
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
          IMPORTANTE: Para o bom funcionamento do programa, é esperado que todas as publicações dos
          produtos tenham sido feitas corretamente. Caso contrário, poderá haver diferença nos
          cálculos e separação dos produtos.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
