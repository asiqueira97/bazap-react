import React, { useState, useEffect, useMemo } from 'react';
import Alerts from '../../components/alerts/alerts';
import { useAppStore } from '../../../store/useAppStore';
import { FiHelpCircle } from 'react-icons/fi';
import style from './styles.scss';

export default function GroupStep({ data, setData, origin }) {
    const { groups } = useAppStore();

    const [search, setSearch] = useState('');

    const filteredGroups = useMemo(() => {
        return groups.filter(
            (group) =>
                group.toLowerCase().includes(search.toLowerCase()) &&
                !data.includes(group)
        );
    }, [search, data]);

    const handleAdd = (group) => setData([...data, group]);

    const handleRemove = (group) => setData(data.filter((g) => g !== group));

    return (
        <div className="Bazap_Configuration">
            <Alerts />

            {origin && origin === 'default' && (
                <div className="Bazap_Configuration__content">
                    <h3>Configuração inicial</h3>
                    <p style={{ paddingTop: 8 }}>
                        Selecione abaixo os seus grupos de vendas.
                    </p>
                </div>
            )}


            <div className="Bazap_Configuration__content">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h3>Marque os grupos de vendas</h3>
                    <div className="tooltip-container">
                        <span><FiHelpCircle /></span>
                        <div className="tooltip-text">
                            Palavras que representam o interesse pelo produto.
                            O sistema buscará mensagens que contenham pelo menos uma dessas palavras.
                        </div>
                    </div>
                </div>

                <div className="selected-groups">
                    {data.map((group) => (
                        <div key={group} className="tag">
                            {group}
                            <span onClick={() => handleRemove(group)}>&times;</span>
                        </div>
                    ))}
                </div>

                <input
                    type="text"
                    placeholder="Pesquisar grupos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input"
                    style={{ marginBottom: 15 }}
                />

                <div className="options">
                    {filteredGroups.map((group) => (
                        <div
                            key={group}
                            className="option"
                            onClick={() => handleAdd(group)}
                        >
                            {group}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
