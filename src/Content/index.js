import {
  getPrice,
  verificarEmoji,
  extrairNomeENumero,
  extrairInfo,
} from './utils/utils';

import { extractMentionedProductImage, extractPublishedProductImage } from './utils/image'

import { WA_CLASS_MAP } from './utils/class-map';

const CryptoJS = require('crypto-js');

const settings = { timeScrollUp: 200 };

function scrollToUp(divMessagesContainer, dates, keywords) {
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

    const mensagensMencionadas = new Map();
    const mensagensPublicadas = new Map();
    const mensagensPerdidas = new Map();

    const scrollAndSearch = async () => {

      while (!reachedPast) {

        divMessagesContainer.scrollBy(0, scrollStep);

        // Menções
        const messagesMent = getMentionedMessages(keywords)
        messagesMent.forEach(msg => {
          if (!mensagensMencionadas.has(msg.mentionId)) {
            mensagensMencionadas.set(msg.mentionId, msg);
          }
        });

        // Produtos publicados (vendedor)
        const messagesPublish = getPublishedProducts()
        messagesPublish.forEach(msg => {
          if (!mensagensPublicadas.has(msg.productId)) {
            mensagensPublicadas.set(msg.productId, msg);
          }
        });

        // Gerenciar erros
        const messagesLost = getLostMessages(keywords)
        messagesLost.forEach(msg => {
          if (!mensagensPerdidas.has(msg.messageId)) {
            mensagensPerdidas.set(msg.messageId, msg);
          }
        });

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

        const findIconLockInitialChat = document.querySelector('div[role="button"] span[data-icon="lock-small"]')

        if (hasTarget) {
          found = true;
        }

        if ((found && hasBeforeTarget) || findIconLockInitialChat) {
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

      const mensagensUnicas = Array.from(mensagensMencionadas.values());
      const produtosUnicos = Array.from(mensagensPublicadas.values());
      const mensagensPerdidasUnicas = Array.from(mensagensPerdidas.values());

      resolve({
        success: true,
        mentionedProducts: mensagensUnicas,
        publishedProducts: produtosUnicos,
        lostMessages: mensagensPerdidasUnicas
      });
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

    if (image) {
      chrome.runtime.sendMessage({
        action: "process_single_image",
        url: image,
        productId: productId
      })
    }

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

function getLostMessages(keywordsConfigured) {
  const lostMessages = [];

  const keywords = Object.values(keywordsConfigured).flat();

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
        const extractedInfo = extrairInfo(messageInfoBody?.getAttribute('data-pre-plain-text'));
        const messageId = CryptoJS.MD5(`${interest}-${extractedInfo.time}`).toString();

        const product = citacaoEl.querySelector('.quoted-mention._ao3e').innerText;
        const price = getPrice(product);

        if (!price) {
          const messageMentioned = {
            contact,
            interest,
            messageId,
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
        const mentionId = CryptoJS.MD5(`${productId}-${extractedInfo.number || contact}-${extractedInfo.time}`).toString();
        const price = getPrice(product);

        if (price > 0) {
          const messageMentioned = {
            mentionId,
            productId,
            product,
            contact,
            productImage,
            interest,
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
    scrollToUp(divMessagesContainer, dates, keywords)
      .then(resultScroll => {

        if (resultScroll.success) {
          setTimeout(() => {
            const domInfo = {
              mentionedProducts: resultScroll.mentionedProducts,
              publishedProducts: resultScroll.publishedProducts,
              lostMessages: resultScroll.lostMessages,
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