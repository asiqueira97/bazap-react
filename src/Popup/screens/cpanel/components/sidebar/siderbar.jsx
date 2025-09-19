import React from 'react';
import { IoIosPeople } from 'react-icons/io';
import { GiClothes } from 'react-icons/gi';
import { BiError } from "react-icons/bi";
import { MdOutlineSettings } from "react-icons/md";
import { MdSpaceDashboard } from 'react-icons/md';
import { useAppStore } from '../../../../../store/useAppStore';
import style from './style.scss';

function Siderbar() {
  const { cpanelCurrentView, setCpanelCurrentView, currentGroup, groupImage } = useAppStore()

  return (
    <div className="Dashboard__sidebar">
      <header>
        <img src={groupImage} />
        <p>{currentGroup.toUpperCase()}</p>
      </header>

      <div className="titleMenu">Menu</div>
      <menu>
        <li>
          <a
            className={`${cpanelCurrentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCpanelCurrentView('dashboard')}
          >
            <MdSpaceDashboard /> Dashboard
          </a>
        </li>

        <li>
          <a
            className={`${cpanelCurrentView === 'clients' ? 'active' : ''}`}
            onClick={() => setCpanelCurrentView('clients')}
          >
            <IoIosPeople />
            Clientes
          </a>
        </li>

        <li>
          <a
            className={`${cpanelCurrentView === 'products' ? 'active' : ''}`}
            onClick={() => setCpanelCurrentView('products')}
          >
            <GiClothes /> Produtos
          </a>
        </li>

        <li>
          <a
            className={`${cpanelCurrentView === 'errorManagement' ? 'active' : ''}`}
            onClick={() => setCpanelCurrentView('errorManagement')}
          >
            <BiError /> Gestão de erros
          </a>
        </li>

        <li>
          <a
            className={`${cpanelCurrentView === 'settings' ? 'active' : ''}`}
            onClick={() => setCpanelCurrentView('settings')}
          >
            <MdOutlineSettings /> Configurações
          </a>
        </li>
      </menu>
    </div>
  );
}

export default Siderbar;
