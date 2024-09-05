import React from 'react'
import st from './style.scss'
import { useBazapContext } from '../../context/BazapContext'

function Alerts() {

    const {alertMessage} = useBazapContext()

    if(!alertMessage) return null

    return (
        <div className="alerts">
            <p>{alertMessage}</p>
        </div>
    )
}

export default Alerts
