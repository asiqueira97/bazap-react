import React, {useState} from "react";
import { useBazapContext } from "../../context/BazapContext.jsx";
import { getLastWeekdayDate, getOptionsSelectInitialFilter } from "../../utils/utils.js";
import LoadingImage from '../../../assets/loading.gif'

export const Filter = () => {

    const { loadingSearch, setLoadingSearch, port, postDay } = useBazapContext()
    
    const options = getOptionsSelectInitialFilter(postDay)

    const initialValue = options.find( opt => opt.value === opt.selected )?.value || 'ONTEM'

    const [value, setValue] = useState(initialValue)

    const handleClick = () => {
        setLoadingSearch(true)

        const lastWeekdayDate = getLastWeekdayDate(value.toLowerCase())

        const period = value !== 'ONTEM' ? `${value}|${lastWeekdayDate}` : value

        const params = {
            period,
            times: { startTime: '', endTime: '' }
        }

        port.postMessage({ 
            message:"search",
            params
        })
    }

    return (
        <div className="Bazap_initial-form">
            <form className="flex-column">
                <div className="flex-column">
                    <span>Dia</span>
                    <select value={value || ''} onChange={(e)=>setValue(e.target.value)}>
                        {options.map( option => (
                            <option key={option.name} value={option.value}>{option.name.toLowerCase()}</option>
                        ))}
                    </select>
                </div>

                <button type="button" onClick={handleClick} disabled={loadingSearch} >
                    {loadingSearch ? 'Aguarde...' : 'Gerar relatório'}
                </button>

                { loadingSearch && <img width="30" src={LoadingImage} alt={'Carregando'} style={{alignSelf: 'center'}} /> }
            </form>
        </div>
    )
}