import React from 'react';
import ReactDOM from 'react-dom';
import { IoIosCloseCircleOutline } from "react-icons/io";
import styles from './styles.scss'

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div onClick={onClose} className="modal-overlay">
            <div onClick={(e) => e.stopPropagation()} className="modal-content">
                <div className="modal">
                    <button className="btnCloseModal" onClick={onClose} title="Fechar modal">
                        <IoIosCloseCircleOutline />
                    </button>

                    {children}
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default Modal;
