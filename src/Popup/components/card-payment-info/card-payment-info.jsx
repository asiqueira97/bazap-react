import React from 'react'
import logo from '../../../assets/icon.png'
import { useBazapContext } from '../../context/BazapContext'
import style from './style.scss'

function CardPaymentInfo() {

    const { showPix } = useBazapContext()

    return (
        <div className={showPix ? 'cardPaymentInformation flex-row' : 'hide'}>
            <img src={logo} width={70} />
            <div>
                <p className="pix">PIX (celular): 11971823735</p>
                <p className="congratulations">Agradecemos a preferência!</p>
            </div>
        </div>
    )
}

export default CardPaymentInfo
