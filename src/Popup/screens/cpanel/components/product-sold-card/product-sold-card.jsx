import React from 'react';
import { timeToSeconds, secondsToTime } from '../../../../utils/utils';
import style from './style.scss';
import Logo from '../../../../../assets/logo.png'

function ProductSoldCard({ product, products }) {
  const messages = products[product];

  const productName = messages[0].product;
  const image = messages[0].imageUrl;

  const usedSeconds = {};

  const getUniqueRandomSeconds = (baseTime) => {
    const baseSeconds = timeToSeconds(baseTime);

    if (!usedSeconds[baseSeconds]) usedSeconds[baseSeconds] = new Set();

    let randomSeconds;
    do {
      randomSeconds = baseSeconds + Math.floor(Math.random() * 60);
    } while (usedSeconds[baseSeconds].has(randomSeconds));

    usedSeconds[baseSeconds].add(randomSeconds);

    return randomSeconds;
  };

  const seconds = messages.map((msg) => {
    const time = msg.date.split(',')[0].trim();
    const uniqueSeconds = getUniqueRandomSeconds(time);
    return secondsToTime(uniqueSeconds);
  });

  return (
    <div className="product-sold-card">
      <div className="product-image">
        <img src={Logo} />
        <span>{productName}</span>
      </div>

      <div className="messages">
        <table>
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nome/Número</th>
              <th>Mensagem</th>
              <th>Horário</th>
            </tr>
          </thead>

          <tbody>
            {messages.map((message, index) => {
              const contact = message.name || message.number;
              let time = seconds[index];

              return (
                <tr key={index}>
                  <td>
                    {message.imageProfile ? (
                      <img className="profileImage" src={message.imageProfile} />
                    ) : (
                      <div className="profileBgCircle">{contact.length > 0 ? contact[0] : 'D'}</div>
                    )}
                  </td>
                  <td>{contact.trim()}</td>
                  <td>{message.interest}</td>
                  <td>
                    <strong>{time}</strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductSoldCard;
