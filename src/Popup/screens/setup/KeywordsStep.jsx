import React, { useRef, useState } from 'react';
import Alerts from '../../components/alerts/alerts';
import style from './styles.scss';

const WordSection = ({ title, placeholder, field, data, setData }) => {
    const [error, setError] = useState('')
    const inputRef = useRef(null);

    const handleAdd = () => {
        const value = inputRef.current.value.trim().toLowerCase();

        if (value && value.includes(' ')) {
            setError('Por favor, digite apenas uma palavra.')
            return;
        }

        if (value && !data[field]?.includes(value)) {
            setError('')
            const updatedList = [...(data[field] || []), value];
            setData({ ...data, [field]: updatedList });
            inputRef.current.value = '';
        }
    };

    const handleRemove = (word) => {
        const updatedList = (data[field] || []).filter(item => item !== word);
        setData({ ...data, [field]: updatedList });
    };

    return (
        <div className="Bazap_Configuration__content">
            <h3>{title}</h3>

            <div className="content">
                <div className="selected-groups">
                    {[...new Set(data[field] || [])].map((word) => (
                        <div key={word} className="tag">
                            {word}
                            <span onClick={() => handleRemove(word)}>&times;</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="input-wrapper">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    className={`input ${error !== '' && 'input-error'}`}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <button onClick={handleAdd} style={{ width: 95, height: 30 }}>Adicionar</button>
            </div>

            <p style={{ marginTop: 10, color: 'red' }}>{error}</p>
        </div>
    );
};

export default function KeywordsStep({ data, setData }) {
    return (
        <div className="Bazap_Configuration">
            <Alerts />

            <div className="Bazap_Configuration__content">
                <h3>Palavras chaves</h3>
                <p style={{ paddingTop: 8 }}>
                    Cadastre as palavras chaves que serão buscadas para contabilizar uma venda ou desistência de um produto.
                    O sistema buscará apenas mensagens que contenham essas palavras.
                </p>
            </div>

            <WordSection
                title="Palavras de interesse"
                placeholder="Digite a palavra"
                field="interest"
                data={data}
                setData={setData}
            />

            <WordSection
                title="Palavras de Espera"
                placeholder="Digite a palavra"
                field="wait"
                data={data}
                setData={setData}
            />

            <WordSection
                title="Palavras de desistência"
                placeholder="Digite a palavra"
                field="desist"
                data={data}
                setData={setData}
            />
        </div>
    );
}