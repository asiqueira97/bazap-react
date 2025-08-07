import {
  getPrice,
  verificarEmoji,
  extrairNomeENumero,
  extrairInfo,
} from './utils/utils';

import { extractMentionedProductImage, extractPublishedProductImage } from './utils/image'

import { WA_CLASS_MAP } from './utils/class-map';

const CryptoJS = require('crypto-js');

const settings = { timeScrollUp: 500 };

function scrollToUp(divMessagesContainer, dates) {
  return new Promise(async (resolve) => {

    const { primaryDate } = dates

    const primaryDateSplit = primaryDate.split('|')

    const targetDate = primaryDateSplit[0] || primaryDateSplit[1];
    const scrollStep = -400;
    const delay = settings.timeScrollUp;

    if (!divMessagesContainer) {
      resolve(false);
      return;
    }

    const getAllMessages = () => Array.from(document.querySelectorAll('div[data-pre-plain-text]'));

    const extractDate = el => {
      const match = el.dataset.prePlainText?.match(/\[\d{2}:\d{2}, (\d{2}\/\d{2}\/\d{4})\]/);
      return match ? match[1] : null;
    };

    let found = false;
    let reachedPast = false;
    let scrolls = 0;

    const scrollAndSearch = async () => {
      while (!reachedPast) {

        divMessagesContainer.scrollBy(0, scrollStep);

        const btnClickMore = document.querySelector('button.x14m1o6m.x126m2zf')
        if (btnClickMore) btnClickMore.click()

        await new Promise(r => setTimeout(r, delay));

        const allMsgs = getAllMessages();
        const dates = allMsgs.map(extractDate).filter(Boolean);
        const hasTarget = dates.includes(targetDate);
        const hasBeforeTarget = dates.some(date => {
          const [d, m, y] = date.split('/').map(Number);
          const [td, tm, ty] = targetDate.split('/').map(Number);
          const current = new Date(y, m - 1, d);
          const target = new Date(ty, tm - 1, td);
          return current < target;
        });

        if (hasTarget) {
          found = true;
        }

        if (found && hasBeforeTarget) {
          reachedPast = true;
        }

        scrolls++;
      }

      const filtered = getAllMessages().filter(el => extractDate(el) === targetDate);

      if (filtered.length === 0) {
        console.warn(`⚠️ Nenhuma mensagem da data ${targetDate} encontrada.`);
        resolve(false);
        return;
      }

      resolve(true);
    };

    await scrollAndSearch();
  })
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

          lostMessages.push(messageMentioned);
        }

      }
    }
  });

  return lostMessages;
}

function getMentionedMessages(keywordsConfigured) {
  const quotedMessages = [];
  const keywords = Object.values(keywordsConfigured).flat();

  console.log('buscar por', keywords);

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

      if (keywords.some((key) => interest.toLowerCase().includes(key))) {
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
  const { dates, keywords } = params

  const divMessagesContainer = document.querySelector(WA_CLASS_MAP.CHAT_SCROLL_CONTAINER);

  if (hasElementScroll(divMessagesContainer)) {
    scrollToUp(divMessagesContainer, dates)
      .then(endScroll => {
        if (endScroll) {
          setTimeout(() => {
            const domInfo = {
              mentionedProducts: getMentionedMessages(keywords),
              publishedProducts: getPublishedProducts(),
              lostMessages: getLostMessages()
            }

            sendResponse({ domInfo });
          }, 1000);
        } else {
          console.log('❌ Data não encontrada no histórico.');
        }
      });
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
      const headerChat = document.querySelector('#main > header');
      const groupNameElement = headerChat.querySelector('.x1iyjqo2.x6ikm8r');
      const numberStorage = localStorage?.getItem('last-wid-md');

      if (!groupNameElement || !numberStorage) {
        sendResponse({ validGroup: false });
        return;
      }

      const groupImage = headerChat.querySelector('img').src;
      const groupName = groupNameElement.innerText.toLowerCase();
      const match = numberStorage.match(/"(\d+):/);
      const numberLogged = match ? match[1] : null;

      setTimeout(() => {
        const chats = getWhatsAppGroups()
        sendResponse({ validGroup: true, session: { numberLogged, groupName, groupImage, chats } });
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
      const { dates, keywords } = request;
      init({ dates, keywords }, sendResponse);
      return true;
    }

    default:
      console.warn('Ação não reconhecida:', request.action);
  }
});