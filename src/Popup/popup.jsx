import React from 'react';
import Initial from './screens/initial/initial';
import Panel from './screens/cpanel/index';
import Setup from './screens/setup/setup';
import { useAppStore } from '../store/useAppStore';
import LoadingImage from '../assets/loading.gif';
import { messagesError } from './utils/utils';
import Alert from './screens/alert/alert';

const Loading = () => {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <img width="30" src={LoadingImage} alt={'Carregando'} />
    </div>
  )
}

const Popup = () => {
  const { currentView, setCurrentView, setGroups, setAlertMessage, setCurrentGroup } = useAppStore();

  React.useEffect(() => {
    const getAllowedGroups = () => {
      chrome.storage.local.get(['config'], (result) => {
        const allowedGroupsRaw = result?.config?.salesGroups;

        if (allowedGroupsRaw) {
          validateCurrentGroup(allowedGroupsRaw);
        } else {
          initializeSetup();
        }
      });
    };

    const validateCurrentGroup = (allowedGroupsRaw) => {
      chrome.runtime.sendMessage({ action: 'getCurrentGroup' }, (response) => {
        if (!response?.ok) {
          setAlertMessage(messagesError[response.error]);
          setCurrentView('alert');
          return;
        }

        const { numberLogged, groupName, chats } = response.session;
        const allowedGroups = allowedGroupsRaw.map(group => group.trim().toLowerCase());
        const isGroupAllowed = allowedGroups.includes(groupName);

        if (!isGroupAllowed) {
          setAlertMessage(messagesError['invalidGroup']);
          setCurrentView('alert');
          return;
        }

        chrome.storage.local.set({ whatsappGroupsList: chats }, () => {
          setCurrentGroup(groupName)
          setGroups(chats);
          setCurrentView('initial');
        })

      });
    };

    const initializeSetup = () => {
      chrome.runtime.sendMessage({ action: 'init-setup' }, (response) => {
        if (response?.ok) {
          const whatsappGroupsList = response.data
          chrome.storage.local.set({ whatsappGroupsList }, () => {
            setGroups(response.data);
            setCurrentView('setup');
          })
        } else {
          console.error('Erro ao iniciar setup.');
        }
      });
    };

    getAllowedGroups();
  }, []);

  return (
    <div className="Bazap__main">
      {currentView === 'loading' && <Loading />}
      {currentView === 'alert' && <Alert />}
      {currentView === 'setup' && <Setup />}
      {currentView === 'initial' && <Initial />}
      {currentView === 'cpanel' && <Panel />}
    </div>
  );
};

export default Popup;
