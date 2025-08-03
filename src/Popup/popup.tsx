import React from 'react';
import Initial from './screens/initial/initial';
import Panel from './screens/cpanel/index';
import Setup from './screens/setup/setup';
import { useAppStore } from '../store/useAppStore';
import LoadingImage from '../assets/loading.gif';
import { messagesError } from './utils/utils';
import Alert from './screens/alert/alert';
import './styles.scss';

type ErrorKey = keyof typeof messagesError;

const Loading = () => {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <img width="30" src={LoadingImage} alt={'Carregando...'} />
    </div>
  )
}

const Popup = () => {
  const {
    currentView,
    setCurrentView,
    setGroups,
    setAlertMessage,
    setCurrentGroup,
    setGroupImage
  } = useAppStore();

  React.useEffect(() => {
    const getAllowedGroups = () => {
      chrome.storage.local.get(['config'], (result) => {

        console.log(result)

        const allowedGroupsRaw = result?.config?.salesGroups;

        if (allowedGroupsRaw) {
          validateCurrentGroup(allowedGroupsRaw);
        } else {
          initializeSetup();
        }
      });
    };

    const validateCurrentGroup = (allowedGroupsRaw: any) => {
      chrome.runtime.sendMessage({ action: 'getCurrentGroup' }, (response) => {
        if (!response?.ok) {
          const errorKey = response?.error as string;
          setAlertMessage(messagesError[errorKey as ErrorKey]);
          setCurrentView('alert');
          return;
        }

        const { numberLogged, groupName, chats, groupImage } = response.session;
        const allowedGroups = allowedGroupsRaw.map((group: any) => group.trim().toLowerCase());
        const isGroupAllowed = allowedGroups.includes(groupName);

        if (!isGroupAllowed) {
          setAlertMessage(messagesError.invalidGroup);
          setCurrentView('alert');
          return;
        }

        chrome.storage.local.set({ whatsappGroupsList: chats }, () => {
          setGroupImage(groupImage)
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
    <div className={'Bazap__main'}>
      {currentView === 'loading' && <Loading />}
      {currentView === 'alert' && <Alert />}
      {currentView === 'setup' && <Setup />}
      {currentView === 'initial' && <Initial />}
      {currentView === 'cpanel' && <Panel />}
    </div>
  );
};

export default Popup;
