import React from "react";
import { createRoot } from 'react-dom/client';
import BazapContextProvider from './context/BazapContext'
import Popup from "./popup.jsx"
import style from './styles.scss'

const root = createRoot( document.getElementById('react-app') ); 

function App() {
    return (
        <BazapContextProvider>
            <Popup />
        </BazapContextProvider>
    )
}

root.render(<App />);