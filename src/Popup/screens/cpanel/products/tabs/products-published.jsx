import React, { useState, useMemo } from 'react';
import Search from '../../../../components/search/search';
import ProductCard from '../../components/product-card/product-card';
import { removerAcentos } from '../../../../utils/utils';
import { useAppStore } from '../../../../../store/useAppStore';

function ProductsPublished() {

  const { publishedProducts } = useAppStore()

  const [search, setSearch] = useState('');

  const productList = React.useMemo(() => {
    return publishedProducts.filter(item =>
      item.product.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, publishedProducts]);

  return (
    <div className="Products__content">
      <div>
        <div className="flex-row justify-between align-center" style={{ margin: '15px 0px' }}>
          <h3>Publicados ({productList.length})</h3>
        </div>
        <Search placeholder="Buscar produto..." onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="products">
        {productList && productList.map((prod, idx) => <ProductCard key={idx} product={prod} />)}
      </div>
    </div>
  );
}

export default ProductsPublished;
