import {
  getPrice,
  verificarEmoji,
  extrairNomeENumero,
  extrairInfo,
} from './utils/utils';

import { extractMentionedProductImage, extractPublishedProductImage } from './utils/image'

import { WA_CLASS_MAP } from './utils/class-map';

const CryptoJS = require('crypto-js');

const settings = { timeScrollUp: 1 };

function scrollToUp(divMessagesContainer, dates) {

  const { primaryDate, previousDate } = dates

  const primaryDateSplit = primaryDate.split('|')
  const previousDateSplit = previousDate.split('|')

  divMessagesContainer.scrollTop = 0;

  let days = [];
  const findDays = document.querySelectorAll(WA_CLASS_MAP.CHAT_DATE_LABEL_CLASS);

  findDays.forEach((day) => days.push(day.innerText.toUpperCase()));

  const checkIncludePrimaryDate =
    primaryDateSplit.length === 1
      ? days.includes(primaryDateSplit[0])
      : days.includes(primaryDateSplit[0]) || days.includes(primaryDateSplit[1]);

  const checkIncludePreviousDate =
    previousDateSplit.length === 1
      ? days.includes(previousDateSplit[0])
      : days.includes(previousDateSplit[0]) || days.includes(previousDateSplit[1]);

  return checkIncludePreviousDate || document.querySelectorAll('span[data-icon="lock-small"]').length == 1;
}

function hasElementScroll(element) {
  return element.scrollHeight > element.clientHeight;
}

function getPublishedProducts() {

  const products = [];

  document.querySelectorAll('.message-in, .message-out').forEach((msg) => {
    const imageEl = msg.querySelector('[aria-label="Abrir imagem"], [aria-label="Open image"]');
    const isVideo = msg.querySelector('span[data-icon="media-play"]') !== null;

    if (!imageEl && !isVideo) return;

    const product = msg.querySelector('.selectable-text.copyable-text')?.innerText
    if (!product) return;

    const image = isVideo ? extractMentionedProductImage(msg) : extractPublishedProductImage(imageEl.querySelectorAll('img'))
    const messageInfoBody = msg.querySelector('div[data-pre-plain-text]');

    const infoMessage = extrairInfo(messageInfoBody?.getAttribute('data-pre-plain-text'))
    const productId = CryptoJS.MD5(product.toLowerCase().replace(/\s+/g, '-')).toString();
    const price = getPrice(product);

    if (!price || price === 0) return;

    products.push({
      ...infoMessage,
      price,
      productId,
      image,
      product,
      media: isVideo ? 'video' : 'foto'
    })
  })

  return products
}

function getLostMessages() {
  const lostMessages = [];

  document.querySelectorAll('.message-in, .message-out').forEach((msg) => {
    const citacaoEl = msg.querySelector('[aria-label="Mensagem citada"]');
    if (!citacaoEl) return;

    const sectionIdentification = msg.querySelector('._ahxj._ahxz');
    const messageInfoBody = msg.querySelector('div[data-pre-plain-text]');

    if (messageInfoBody) {
      const interest =
        messageInfoBody
          .querySelector('._ao3e.selectable-text.copyable-text')
          ?.innerText?.toLowerCase() || 'Uknnow';

      if (['quero', 'qr', 'fila', 'desisto', 'qro'].some((key) => interest.toLowerCase().includes(key))) {
        const contact = extrairNomeENumero(sectionIdentification);
        const productImage = extractMentionedProductImage(citacaoEl);
        const extractedInfo = extrairInfo(messageInfoBody?.getAttribute('data-pre-plain-text'));

        if (!productImage) {
          const messageMentioned = {
            contact,
            interest,
            ...extractedInfo,
          };

          console.log(messageMentioned)

          lostMessages.push(messageMentioned);
        }

      }
    }
  });

  return lostMessages;
}

function getMentionedMessages() {
  const quotedMessages = [];

  document.querySelectorAll('.message-in, .message-out').forEach((msg) => {
    const citacaoEl = msg.querySelector('[aria-label="Mensagem citada"]');
    if (!citacaoEl) return;

    const sectionIdentification = msg.querySelector('._ahxj._ahxz');
    const messageInfoBody = msg.querySelector('div[data-pre-plain-text]');

    if (messageInfoBody) {
      const interest =
        messageInfoBody
          .querySelector('._ao3e.selectable-text.copyable-text')
          ?.innerText?.toLowerCase() || 'Uknnow';

      if (['quero', 'qr', 'fila', 'desisto', 'qro'].some((key) => interest.toLowerCase().includes(key))) {
        const contact = extrairNomeENumero(sectionIdentification);
        const productImage = extractMentionedProductImage(citacaoEl);
        const extractedInfo = extrairInfo(messageInfoBody?.getAttribute('data-pre-plain-text'));

        const product = citacaoEl.querySelector('.quoted-mention._ao3e').innerText;
        const productId = CryptoJS.MD5(product.toLowerCase().replace(/\s+/g, '-')).toString();
        const price = getPrice(product);

        if (price > 0) {
          const messageMentioned = {
            product,
            contact,
            productImage,
            interest,
            productId,
            price,
            ...extractedInfo,
          };

          quotedMessages.push(messageMentioned);
        }
      }
    }
  });

  return quotedMessages;
}

function init(params, sendResponse) {
  const divMessagesContainer = document.querySelector(WA_CLASS_MAP.CHAT_SCROLL_CONTAINER);

  if (hasElementScroll(divMessagesContainer)) {
    const toUp = setInterval(function () {
      const find = scrollToUp(divMessagesContainer, params.dates);
      if (find) {
        clearInterval(toUp);

        setTimeout(() => {
          const domInfo = {
            mentionedProducts: getMentionedMessages(),
            publishedProducts: getPublishedProducts(),
            lostMessages: getLostMessages()
          }

          sendResponse({ domInfo });
        }, 1000);
      }
    }, settings.timeScrollUp);
  } else {
    console.log('NENHUMA MENSAGEM ENCONTRADA')
  }
}

function whatsappGroupsAutoClick() {
  const listGroups = document.querySelector('div[aria-label="chat-list-filters"]').querySelector('button#group-filter');

  if (listGroups && listGroups.getAttribute('aria-selected') === 'false')
    listGroups.click();
}

function getWhatsAppGroups() {
  const spans = document.querySelectorAll('div[aria-label="Lista de conversas"] div[role="gridcell"] span[title]');
  if (!spans) {
    return false
  }

  return Array.from(spans).map(span => span.getAttribute('title'))
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'checkGroup': {
      whatsappGroupsAutoClick()
      const groupNameElement = document.querySelector('#main > header .x1iyjqo2.x6ikm8r');
      const numberStorage = localStorage?.getItem('last-wid-md');

      if (!groupNameElement || !numberStorage) {
        sendResponse({ validGroup: false });
        return;
      }

      const groupName = groupNameElement.innerText.toLowerCase();
      const match = numberStorage.match(/"(\d+):/);
      const numberLogged = match ? match[1] : null;

      setTimeout(() => {
        const chats = getWhatsAppGroups()
        sendResponse({ validGroup: true, session: { numberLogged, groupName, chats } });
      }, 1000)
      return true;
    }

    case 'getListGroups': {
      whatsappGroupsAutoClick()
      setTimeout(() => {
        const chats = getWhatsAppGroups()

        if (!chats) {
          sendResponse({ validSetup: false, error: 'Nenhuma conversa encontrada' });
          return;
        }

        sendResponse({ validSetup: true, data: chats });
      }, 1000);

      return true; // canal de resposta assíncrona
    }

    case 'search': {
      const { dates, times } = request;
      init({ dates, times }, sendResponse);
      return true; // canal aberto para resposta assíncrona
    }

    default:
      console.warn('Ação não reconhecida:', request.action);
  }
});