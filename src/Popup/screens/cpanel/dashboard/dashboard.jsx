import React from 'react';
import { useAppStore } from '../../../../store/useAppStore';
import { FiEye, FiEyeOff } from "react-icons/fi";
import style from './style.scss';

const Dashboard = () => {

  const [showValueTotal, setShowValueTotal] = React.useState(false);

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
  const totalProductsAvailable = totalProductsPublished > totalProductsSold ? totalProductsPublished - totalProductsSold : 0;
  const totalClients = new Set(buyersPerProductFiltered.map(p => p.levou).filter(Boolean)).size ?? 0;

  return (
    <div className="Dashboard__cards">
      <h2>Resumo do dia {dateSearched ?? ''}</h2>

      <div className="Dashboard__cards-content">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h4>Total (estimado)</h4>
            <button onClick={() => setShowValueTotal(!showValueTotal)}>
              {showValueTotal ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <span className="color-green">
            {showValueTotal ? total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }) : 'R$ *****'}
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
    </div>
  );
};

export default Dashboard;
