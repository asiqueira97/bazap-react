import { processAndSaveSingleImage } from "../Content/utils/imageProcessor";

function enviarParaAbaWhatsapp(action, payload = {}, callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];

    if (tab.url.includes('web.whatsapp.com')) {
      chrome.tabs.sendMessage(tab.id, { action, ...payload }, callback);
    } else {
      console.warn('Extensão ativada fora do WhatsApp Web.');
      if (callback) callback({ error: 'invalidUrl' });
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // INICIAR CONFIGURACOES
  if (request.action === 'init-setup') {
    enviarParaAbaWhatsapp('getListGroups', {}, (response) => {
      if (response?.error) {
        sendResponse({ ok: false, error: response?.error });
        return;
      }

      if (response?.validSetup) {
        sendResponse({ ok: true, type: 'setup-list-groups', data: response?.data });
      } else {
        console.log('erro feio')
      }
    })

    return true;
  }

  // VERIFICAR GRUPO SELECIONADO
  if (request.action === 'getCurrentGroup') {
    enviarParaAbaWhatsapp('checkGroup', {}, (response) => {
      if (response?.error) {
        sendResponse({ ok: false, error: response?.error });
        return;
      }

      if (!response?.validGroup) {
        sendResponse({ ok: false, error: 'unselectedGroup' });
        return;
      }

      sendResponse({ ok: true, session: response?.session });
    });

    return true
  }

  // MANDAR O SEARCH
  if (request.action === 'search') {
    enviarParaAbaWhatsapp('search', request.params, (res) => {
      if (res?.domInfo) {
        sendResponse({ ok: true, result: res.domInfo });
      } else {
        sendResponse({ ok: false, error: 'notFound' });
      }
    });

    return true
  }

  if (request.action === "process_single_image") {
    const { url, productId, mentionId } = request;
    processAndSaveSingleImage(url, productId, mentionId);
    sendResponse({ status: "done" });
    return true; // Retorna true para manter a porta de mensagem aberta para a resposta assíncrona
  }
});
