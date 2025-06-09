import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { messagesError } from '../../utils/utils';
import GroupStep from './groupStep';
import KeywordsStep from './KeywordsStep';
import style from './styles.scss';

const steps = [
  {
    key: 'salesGroups',
    title: 'Cadastro de Grupos',
    Component: GroupStep
  },
  {
    key: 'keywords',
    title: 'Palavras de Interesse',
    Component: KeywordsStep
  },
];

function Setup({ origin = 'default' }) {

  const { setCurrentView, setAlertMessage } = useAppStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    chrome.storage.local.get(['config'], (result) => {
      if (result?.config) {
        setFormData(result?.config)
      }
    })

  }, [])

  const updateStepData = (key, data) => {
    setFormData((prev) => {
      const updated = { ...prev, [key]: data };
      return updated;
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      const config = {
        ...formData
      }

      chrome.storage.local.set({ config }, () => {
        chrome.runtime.sendMessage({ action: 'getCurrentGroup' }, (response) => {
          if (response?.ok) {
            const { session: { numberLogged, groupName } } = response

            const allowedGroups = config.salesGroups.map(grp => grp.trim().toLowerCase())
            const validGroup = allowedGroups.includes(groupName)

            if (!validGroup) {
              setAlertMessage(messagesError['invalidGroup'])
              setCurrentView('alert')
              return;
            }

            if (origin === 'panel') {
              setCurrentStep(0)
              return;
            }

            setCurrentView('initial')

          } else {
            console.log('ERROR [getCurrentGroup]', messagesError[response.error]);
            setAlertMessage(messagesError[response.error])
            setCurrentView('alert')
          }
        })
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const { key, Component, title } = steps[currentStep];
  const stepData = formData[key] || [];

  return (
    <div>
      <Component origin={origin} data={stepData} setData={(data) => updateStepData(key, data)} />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        {currentStep > 0 && (
          <button onClick={prevStep} style={{ width: 90, height: 25 }}>
            Anterior
          </button>
        )}

        <button onClick={nextStep} style={{ width: 90, height: 25 }}>
          {currentStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
        </button>
      </div>
    </div>
  );

}

export default Setup;
