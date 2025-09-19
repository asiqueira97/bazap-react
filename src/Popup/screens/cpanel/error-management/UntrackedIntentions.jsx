import React, { useEffect, useState, useMemo } from 'react'
import { IoAlertCircleOutline } from "react-icons/io5";
import { useAppStore } from '../../../../store/useAppStore';
import styles from './styles.scss'
import { normalizeLettersOnly } from '../../../utils/utils';

const CryptoJS = require('crypto-js');

function UntrackedIntentions() {

    const { lostMessages } = useAppStore()
    const [keywords, setKeywords] = useState()

    useEffect(() => {
        chrome.storage.local.get(['config'], (result) => {
            if (result.config.keywords) setKeywords(result.config.keywords)
        })
    }, [])

    const getCategory = (word) => {
        if (!keywords) return null;

        for (const category in keywords) {
            if (keywords[category].includes(word.toLowerCase())) {
                return category;
            }
        }

        return null;
    };

    const messagesByClient = useMemo(() => {
        return lostMessages.reduce((acc, product) => {
            const client = CryptoJS.MD5(product.contact.toLowerCase().replace(/\s+/g, '-')).toString();
            if (!acc[client]) acc[client] = [];
            acc[client].push(product);
            return acc;
        }, {});
    }, [lostMessages]);

    if (!keywords) return null

    return (
        <section>
            <div className="info-box">
                <h2 className="info-title">
                    <span className="info-icon">
                        <IoAlertCircleOutline />
                    </span>
                    Intenções Não Contabilizadas
                </h2>
                <p className="info-description">
                    Aqui são exibidas mensagens de clientes que demonstraram possível interesse ou desistência,
                    mas que não seguiram o padrão necessário para serem associadas automaticamente a um produto.
                    Revise-as manualmente para não perder nenhuma oportunidade.
                </p>

                <div className="legend-container">
                    <h4>Legenda</h4>
                    <div className="legend">
                        <div className="legend-item">
                            <span className="legend-color interest"></span>
                            Interesse
                        </div>
                        <div className="legend-item">
                            <span className="legend-color next"></span>
                            Fila
                        </div>
                        <div className="legend-item">
                            <span className="legend-color desist"></span>
                            Desistência
                        </div>
                    </div>
                </div>
            </div>

            {Object.entries(messagesByClient).map(([contact, msgs]) => (
                <div key={contact} className="client-group">
                    <div className="client-name">{msgs[0]?.contact.trim().toUpperCase() || 'Desconhecido'}</div>
                    {msgs.map((msg, index) => (
                        <div key={index} className={`message-card ${getCategory(normalizeLettersOnly(msg.interest)) || 'unknown'}`}>
                            <span className="keyword">{msg.interest}</span>
                            <span className="time">{msg.time}</span>
                        </div>
                    ))}
                </div>
            ))}

        </section>
    )
}

export default UntrackedIntentions
