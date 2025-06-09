import React, { useState } from "react";
import { useAppStore } from "../../../../../store/useAppStore";
import Search from "../../../../components/search/search";
import "./styles.scss";

export default function ProductsSold() {

  const { buyersPerProduct } = useAppStore()

  if (!buyersPerProduct.length) return null

  const config = {
    interestWords: ["quero", "qr", "qro"],
    queueWords: ["fila"],
    desistanceWords: ["desisto"],

    colors: {
      interest: "#28a745",
      queue: "#ffc107",
      desistance: "#dc3545"
    },

    icons: {
      queue: "⏳",
      desistance: "❌"
    },

    labels: {
      interest: "Quero",
      queue: "Fila",
      desistance: "Desistiu"
    }
  };


  const allowedWords = [
    ...config.interestWords,
    ...config.queueWords,
    ...config.desistanceWords
  ];

  const interestColors = Object.fromEntries([
    ...config.interestWords.map(word => [word, config.colors.interest]),
    ...config.queueWords.map(word => [word, config.colors.queue]),
    ...config.desistanceWords.map(word => [word, config.colors.desistance])
  ]);

  const interestIcons = Object.fromEntries([
    ...config.queueWords.map(word => [word, config.icons.queue]),
    ...config.desistanceWords.map(word => [word, config.icons.desistance])
  ]);

  const interestLabels = Object.fromEntries([
    ...config.interestWords.map(word => [word, config.labels.interest]),
    ...config.queueWords.map(word => [word, config.labels.queue]),
    ...config.desistanceWords.map(word => [word, config.labels.desistance])
  ]);


  function detectKeyword(interest) {
    const interestLower = interest.toLowerCase();
    return allowedWords.find(word => interestLower.includes(word)) || null;
  }

  const [search, setSearch] = useState('');

  const productList = React.useMemo(() => {
    return buyersPerProduct.filter(item =>
      item.product.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, buyersPerProduct]);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>

      <div>
        <div className="flex-row justify-between align-center" style={{ margin: '15px 0px' }}>
          <h3>Mencionados ({productList.length})</h3>
        </div>
        <Search placeholder="Buscar produto..." onChange={e => setSearch(e.target.value)} />
      </div>

      {productList.map((product) => {
        const owner = product?.levou?.toUpperCase() || 'Desconhecido'

        return (
          <div
            key={product.productId}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "40px",
              backgroundColor: "#fff"
            }}
          >
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <img
                src={product.productImage}
                alt="Produto"
                style={{ width: "85px", height: "85px", borderRadius: "8px", objectFit: "cover" }}
              />
              <div>
                <h3 style={{ margin: 0 }}>{product.product}</h3>
                <div className="price">
                  <p>Preço: {product.price.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</p>
                </div>

                {owner !== 'Desconhecido' && (
                  <div className="owner">
                    <p>Dono(a):</p>
                    <p>
                      <strong>{owner} ✅</strong>
                    </p>
                  </div>
                )}

              </div>
            </div>

            <div className="timeline">
              {product.mensagens
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((client, idx) => {
                  const contact = client?.contact.toUpperCase() || 'Desconhecido'
                  const keyword = detectKeyword(client.interest);
                  const color = keyword ? interestColors[keyword] : "#ccc";
                  const label = keyword ? interestLabels[keyword] : client.interest;
                  const icon = contact === owner ? "✅" : keyword ? interestIcons[keyword] : ''

                  return (
                    <div className="timeline-item" key={idx}>
                      <div className="timeline-dot" style={{ backgroundColor: color }}></div>
                      <div className="timeline-content">
                        <span style={{ fontWeight: "bold" }}>{contact}</span> — {label} {icon}
                        <div className="timestamp">{client.time}</div>
                      </div>
                    </div>
                  )
                })}
            </div>

          </div>
        );
      })}
    </div>
  );
}