import React from 'react';
import style from './style.scss';
import { useAppStore } from '../../../../../store/useAppStore';

function CardPaymentInfo() {

  const { groupImage } = useAppStore()

  const showPix = true

  return (
    <div className={showPix ? 'cardPaymentInformation flex-row' : 'hide'}>
      <img src={groupImage} width={70} />
      <div>
        <p className="pix">PIX (celular): 11971823735</p>
        <p className="congratulations">Agradecemos a preferência!</p>
      </div>
    </div>
  );
}

export default CardPaymentInfo;
