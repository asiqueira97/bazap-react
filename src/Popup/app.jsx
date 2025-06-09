import React from 'react';
import { createRoot } from 'react-dom/client';
import Popup from './popup.jsx';
import style from './styles.scss';

const root = createRoot(document.getElementById('react-app'));

function App() {
  return (
    <>
      <Popup />
    </>
  );
}

root.render(<App />);
