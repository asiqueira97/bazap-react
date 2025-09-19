import React from 'react';
import st from './style.scss';
import { useAppStore } from '../../../store/useAppStore';


function Alerts() {
  const { alertMessage } = useAppStore();

  if (!alertMessage) return null;

  return (
    <div className="alerts">
      <p>{alertMessage}</p>
    </div>
  );
}

export default Alerts;
