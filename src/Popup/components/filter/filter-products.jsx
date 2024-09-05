import React from 'react'
import { useBazapContext } from '../../context/BazapContext'
import style from './style.scss'

function FilterProducts() {

    const {optionsProductFilter, setOptionsProductFilter} = useBazapContext()

    const handelClick = (option) => {
        const newOptions = optionsProductFilter.map(opt => {
            return {
                ...opt,
                active: opt.name === option.name
            }
        })

        setOptionsProductFilter(newOptions)
    }

    return (
        <div className="options_container">
            <h4>Escolha um filtro abaixo:</h4>
            <div className="options">
                { optionsProductFilter.map( (option, index) => {
                    return (
                        <button 
                            key={index} 
                            className={`${option.active && 'active'}`} 
                            type="button"
                            onClick={()=>handelClick(option)}
                        >
                            {option.name}
                        </button>
                    )
                } ) }
            </div>
        </div>
    )
}

export default FilterProducts
