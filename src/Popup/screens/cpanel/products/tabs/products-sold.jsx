import React, { useState, useRef, useEffect, createRef, useMemo } from "react";
import { useAppStore } from "../../../../../store/useAppStore";
import Search from "../../../../components/search/search";
import ProductImage from "../../../../components/product-mage/ProductImage";
import "./styles.scss";
import { generateMentionedsPDF } from "../../../../utils/utils";

export default function ProductsSold() {

  const { buyersPerProduct, keywords } = useAppStore()

  if (!buyersPerProduct.length || !keywords) return null

  const config = {
    interestWords: keywords.interest,
    queueWords: keywords.wait,
    desistanceWords: keywords.desist,

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

  const productList = useMemo(() => {
    return buyersPerProduct.filter(item =>
      item.product.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, buyersPerProduct]);

  const cardRefs = useRef([]);
  cardRefs.current = productList.map(
    (_, i) => cardRefs.current[i] ?? createRef()
  );

  const handleClickDownload = () => {
    generateMentionedsPDF(cardRefs)
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <div>
        <div className="flex-row justify-between align-center" style={{ margin: '15px 0px' }}>
          <h3>Mencionados ({productList.length})</h3>
          <button className="download-button-rel-products" onClick={handleClickDownload}>
            Baixar
          </button>
        </div>
        <Search placeholder="Buscar produto..." onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="products-mentioneds">

        {productList.map((product, index) => {
          const owner = product?.levou?.toUpperCase() || 'Desconhecido'

          return (
            <div
              ref={cardRefs.current[index]}
              className="product-mentioned"
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
                <ProductImage productId={product.productId} />
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
                    const icon = contact === owner ? "✅" : keyword ? interestIcons[keyword] : ''

                    return (
                      <div className="timeline-item" key={idx}>
                        <div className="timeline-dot" style={{ backgroundColor: color }}></div>
                        <div className="timeline-content">
                          <span style={{ fontWeight: "bold" }}>{contact}</span> — {client.interest} {icon}
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
    </div>
  );
}