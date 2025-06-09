import React, { useState, useEffect } from 'react';
import logo from '../../../assets/icon.png';
import Alerts from '../../components/alerts/alerts';
import { useAppStore } from '../../../store/useAppStore';
import { getWeekdayIfWithin7Days, formatDateWithRelativeDay, subtractOneDay, filtrarPorData } from '../../utils/date';
import { defineBuyersPerProduct } from '../../utils/product';
import LoadingImage from '../../../assets/loading.gif';
import { getOptionsSelectInitialFilter } from '../../utils/utils';
import style from './style.scss';

const Filter = () => {
  const postDayOfWeek = 'QUARTA-FEIRA'

  const {
    setMentionedProducts,
    setCurrentView,
    setCpanelCurrentView,
    setAlertMessage,
    setPublishedProducts,
    setBuyersPerProduct,
    setDateSearched,
    setLostMessages
  } = useAppStore()

  const options = getOptionsSelectInitialFilter(postDayOfWeek);
  const initialValue = options.find((opt) => opt.value === opt.selected)?.value || 'ONTEM';

  const [loadingSearch, setLoadingSearch] = useState(false);

  const [searchType, setSearchType] = useState('date');

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState('');

  const [weekday, setWeekday] = useState(initialValue);

  useEffect(() => {
    const inverterFormato = (dataBR) => {
      const [dia, mes, ano] = dataBR.split('/');
      return `${ano}-${mes}-${dia}`;
    }

    const getLastDateSearched = () => {
      chrome.storage.local.get(['targetDate'], (result) => {
        setDate(inverterFormato(result.targetDate))
      })
    }

    getLastDateSearched()
  }, [])

  const search = (params) => {
    const errorMessage = 'Nenhuma mensagem encontrada.'
    chrome.runtime.sendMessage({ action: 'search', params }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Runtime error:', chrome.runtime.lastError.message);
        setAlertMessage(errorMessage);
        return;
      }

      if (!response?.ok) {
        setAlertMessage(errorMessage);
        return;
      }

      const { mentionedProducts, publishedProducts, lostMessages } = response.result;

      const targetDate = params.dates.primaryDate.split('|')[0];
      chrome.storage.local.set({ targetDate }, () => {
        setDateSearched(targetDate)
      })

      const mentionedProductsFiltered = filtrarPorData(mentionedProducts, targetDate);
      setMentionedProducts(mentionedProductsFiltered)
      setBuyersPerProduct(defineBuyersPerProduct(mentionedProductsFiltered))

      const publishedProductsFiltered = filtrarPorData(publishedProducts, targetDate);
      setPublishedProducts(publishedProductsFiltered)

      setLostMessages(lostMessages)

      setLoadingSearch(false);
      setCurrentView('cpanel');
      setCpanelCurrentView('dashboard');
    });
  }

  const handleSearch = () => {
    setLoadingSearch(true);

    if (searchType !== 'date') {
      console.log('BUSCAR POR DIA DA SEMANA (últimos 7 dias)');
      return;
    }

    const formattedDate = date.split('-').reverse().join('/');
    const relativeLabel = formatDateWithRelativeDay(formattedDate);
    const isRecent = ['HOJE', 'ONTEM'].includes(relativeLabel.split('|')[1]);

    const baseDate = isRecent ? formattedDate : getWeekdayIfWithin7Days(formattedDate);

    const params = {
      dates: {
        primaryDate: formatDateWithRelativeDay(baseDate.split('|')[0]),
        previousDate: formatDateWithRelativeDay(subtractOneDay(baseDate.split('|')[0])),
      }
    };

    search(params)
  };

  const disabledButton = (
    date.trim().length === 0 &&
    weekday.trim().length === 0
  ) || loadingSearch

  return (
    <div className="Bazap_initial-form">
      <div>
        <label htmlFor="searchType">Tipo de busca</label>
        <select
          id="searchType"
          value={searchType}
          onChange={(e) => {
            setLoadingSearch(false)
            setSearchType(e.target.value)
            setDate('')
            setWeekday('')
          }}
        >
          <option value="date">Buscar por data</option>
          <option value="diaSemana">Buscar por dia da semana</option>
        </select>
      </div>

      {searchType === 'date' ? (
        <div>
          <label htmlFor="date">Escolha a data</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today}
          />
        </div>
      ) : (
        <div>
          <label htmlFor="weekday">Escolha o dia da semana</label>
          <select
            id="weekday"
            value={weekday}
            onChange={(e) => setWeekday(e.target.value)}
          >
            <option value="">Selecione...</option>
            <option value="SEGUNDA-FEIRA">Segunda-feira</option>
            <option value="TERÇA-FEIRA">Terça-feira</option>
            <option value="QUARTA-FEIRA">Quarta-feira</option>
            <option value="QUINTA-FEIRA">Quinta-feira</option>
            <option value="SEXTA-FEIRA">Sexta-feira</option>
            <option value="SÁBADO">Sábado</option>
            <option value="DOMINGO">Domingo</option>
          </select>
        </div>
      )}

      <div className="action-button">
        <button disabled={disabledButton} onClick={handleSearch}>
          {loadingSearch ? 'Aguarde...' : 'Gerar relatório'}
        </button>
      </div>

      {loadingSearch &&
        <img width="30" src={LoadingImage} alt={'Carregando'} style={{ alignSelf: 'center' }} />
      }
    </div>
  );
};

const Initial = () => {
  return (
    <div className="Bazap_initial">
      <Alerts />
      <div className="Bazap_initial-form__content">
        <div className="Bazap_initial-form__logo">
          <img src={logo} width={70} />
        </div>
        <Filter />
      </div>
    </div>
  );
};

export default Initial;