import React from 'react'
import style from './style.scss'

function Search({title, total, placeholder, onChange, origin = 'products'}) {
    return (
        <div className="search">
            <h3>{origin === 'clients' ? 'Clientes' : 'Produtos'} {title} ({total})</h3>
            <input 
                type="text" 
                placeholder={placeholder || 'Buscar'} 
                onChange={onChange}
            />
        </div>
    )
}

export default Search
