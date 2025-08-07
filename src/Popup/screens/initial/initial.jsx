import React, { useState, useEffect } from 'react';
import Alerts from '../../components/alerts/alerts';
import { useAppStore } from '../../../store/useAppStore';
import { getWeekdayIfWithin7Days, formatDateWithRelativeDay, subtractOneDay, filtrarPorData } from '../../utils/date';
import { defineBuyersPerProduct } from '../../utils/product';
import LoadingImage from '../../../assets/loading.gif';
import { getOptionsSelectInitialFilter } from '../../utils/utils';
import style from './style.scss';

const Filter = () => {

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

  const [loadingSearch, setLoadingSearch] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState('');

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

    chrome.storage.local.get(['config'], (result) => {
      const keywords = result?.config?.keywords;

      const formattedDate = date.split('-').reverse().join('/');
      const relativeLabel = formatDateWithRelativeDay(formattedDate);
      const isRecent = ['HOJE', 'ONTEM'].includes(relativeLabel.split('|')[1]);

      const baseDate = isRecent ? formattedDate : getWeekdayIfWithin7Days(formattedDate);

      const params = {
        dates: {
          primaryDate: formatDateWithRelativeDay(baseDate.split('|')[0]),
          previousDate: formatDateWithRelativeDay(subtractOneDay(baseDate.split('|')[0])),
        },
        keywords
      };

      search(params)
    });
  };

  const disabledButton = (
    date.trim().length === 0
  ) || loadingSearch

  return (
    <div className="Bazap_initial-form">
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
  const { groupImage } = useAppStore()
  return (
    <div className="Bazap_initial">
      <Alerts />
      <div className="Bazap_initial-form__content">
        <div className="Bazap_initial-form__logo">
          <img src={groupImage || ''} width={70} />
        </div>
        <Filter />
      </div>
    </div>
  );
};

export default Initial;