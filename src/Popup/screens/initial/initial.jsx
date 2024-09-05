import React from "react";
import logo from '../../../assets/icon.png';
import { Filter } from "../../components/filter/initial-filter.jsx";
import Alerts from "../../components/alerts/alerts";
import { useBazapContext } from "../../context/BazapContext";
import style from './style.scss'

const Initial = () => {

    const { hasPermission } = useBazapContext()

    return (
        <div className="Bazap_initial">
            <Alerts />
            
            {hasPermission && (
                <div className="Bazap_initial-form__content">
                    <div className="Bazap_initial-form__logo">
                        <img src={logo} width={70} />
                    </div>
                    <Filter />
                </div>
            )}
        </div>
    )
}

export default Initial;