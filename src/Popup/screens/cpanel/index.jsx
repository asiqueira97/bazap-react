import React from 'react';
import Siderbar from './components/sidebar/siderbar';
import Dashboard from './dashboard/dashboard';
import Clients from './clients/clients';
import Products from './products/products';
import UntrackedIntentions from './error-management/UntrackedIntentions';
import { useAppStore } from '../../../store/useAppStore';
import Setup from '../setup/setup';

const Panel = () => {

  const { cpanelCurrentView } = useAppStore()

  const pages = {
    'dashboard': Dashboard,
    'products': Products,
    'clients': Clients,
    'errorManagement': UntrackedIntentions,
    'settings': Setup
  };

  const Component = pages[cpanelCurrentView]

  return (
    <div className="Bazap_dashboard">
      <div className="Dashboard__container">
        <Siderbar />

        <div className="Dashboard__content">
          <div className="Dashboard_page-content">
            {Component ? <Component origin="panel" /> : <div>Módulo não encontrado.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Panel;
