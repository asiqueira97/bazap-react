import React, { useState, createRef } from 'react';
import Search from '../../../components/search/search';
import ProductCardClient from '../components/product-card-client/product-card-client';
import { generateReportImages, generateReportPdf, removerAcentos } from '../../../utils/utils';
import { useAppStore } from '../../../../store/useAppStore';
import Modal from '../../../components/modal/Modal';
import style from './style.scss';

function Clients() {

  const { buyersPerProduct } = useAppStore()

  const productsByClient = buyersPerProduct.reduce((acc, produto) => {
    const client = produto.levou;

    if (!client) return acc;

    if (!acc[client]) acc[client] = [];

    acc[client].push({
      productId: produto.productId,
      product: produto.product,
      price: produto.price,
      image: produto.productImage
    });

    return acc;
  }, {});

  const [modalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState(productsByClient);

  const handleSearch = (e) => {
    const value = e.target.value.trim().toLowerCase();
    const filtered = Object.keys(productsByClient).filter(
      (client) => client.toLowerCase().includes(value) || removerAcentos(client).toLowerCase().includes(value)
    );

    if (filtered.length > 0) setProducts(filtered);
  };

  const productList = products.length > 0 ? products : Object.keys(productsByClient);

  const elRefs = Array(productList.length)
    .fill()
    .map((_, i) => createRef());

  // const handleClickModal = () => handleModal('report-clients', 'open');
  const handleClickModal = () => setModalOpen(true)

  return (
    <>
      <div className="Dashboard__Clients">
        <div className="download-container">
          <h3>Produtos separados por cliente</h3>
          <button type="button" onClick={handleClickModal}>
            Baixar relatório
          </button>
        </div>

        <div className="Dashboard__Clients-content">
          <Search
            placeholder={'Buscar cliente'}
            onChange={handleSearch}
          />

          <div className="Dashboard__Clients-productList">
            {productList.length > 0 &&
              productList.map((key, index) => (
                <ProductCardClient
                  elementRef={elRefs[index]}
                  productList={productsByClient}
                  index={key}
                  key={index}
                />
              ))}
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <p className="title">Escolha a forma de download</p>

        <div className="info-download">
          <ul>
            <li>PDF: Arquivo pdf completo com todas as vendas separado por cliente.</li>
            <li>Imagens: Arquivo zip com imagens de venda por cliente.</li>
          </ul>
        </div>

        <div className="flex-row justify-around align-center">
          <div className="flex-row" style={{ gap: 10 }}>
            <button
              className="download-button"
              onClick={() => generateReportPdf(elRefs)}
              data-name="pdf"
            >
              PDF
            </button>

            <button
              className="download-button"
              onClick={() => generateReportImages(productList, elRefs)}
              data-name="images"
            >
              IMAGENS
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Clients;
