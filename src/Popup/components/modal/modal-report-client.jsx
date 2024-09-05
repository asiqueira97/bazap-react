import React from 'react'
import Modal from 'react-modal';
import CloseIcon from '../../../assets/close-icon.png'
import { useBazapContext } from '../../context/BazapContext';
import style from './style.scss'

Modal.defaultStyles.overlay.backgroundColor = '#00000088';

const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };

function ModaReportClient({name, children}) {

    const { modals, handleModal, setShowPix } = useBazapContext()

    const modalIndex = modals.findIndex( m => m.name === name )
    
    const modalIsOpen = modals[modalIndex].opened

    const closeModal = () => {
        setShowPix(false)
        handleModal('report-clients','close')
    }

    return (
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
        >
            <div className="modal">
                <button className="btnCloseModal" onClick={closeModal} title="Fechar modal">
                    <img src={CloseIcon} width={25} />
                </button>

                {children}
            </div>
      </Modal>
    )

}

Modal.setAppElement('#react-app');

export default ModaReportClient
