import React, { useState, createRef } from 'react';
import Search from '../../../../components/search/search';
import ProductCard from '../../components/product-card/product-card';
import { generateProducsAvailable } from '../../../../utils/utils';
import { useAppStore } from '../../../../../store/useAppStore';
import "./styles.scss";

const removerAcentos = (text) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

function ProductsAvailable() {

  const { publishedProducts, buyersPerProduct } = useAppStore()

  const isSold = (product) => buyersPerProduct.filter(prod => prod.levou !== null).some((soldProduct) => soldProduct.productId === product.productId);

  const productsAvailable = publishedProducts.filter((product) => !isSold(product));

  const [search, setSearch] = useState('');

  const productList = React.useMemo(() => {
    return productsAvailable.filter(item =>
      item.product.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, productsAvailable]);

  const elRefs = Array(productList.length)
    .fill()
    .map((_, i) => createRef());

  const refTest = createRef();

  const handleClickDownload = () => {
    console.log('gerar download product');
    generateProducsAvailable(refTest);
  };

  return (
    <div className="Products__content">
      <div>
        <div className="flex-row justify-between align-center" style={{ margin: '15px 0px' }}>
          <h3>Disponíveis ({productList.length})</h3>
          <button className="download-button-rel-products" onClick={handleClickDownload}>
            Baixar
          </button>
        </div>
        <Search placeholder="Buscar produto..." onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="products" ref={refTest}>
        {productList.map((product, index) => (<ProductCard key={index} product={product} elementRef={elRefs[index]} />))}
      </div>
    </div>
  );
}

export default ProductsAvailable;
