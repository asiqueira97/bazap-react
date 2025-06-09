import { toJpeg } from 'html-to-image';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as JSZip from 'jszip';

export const randomNumber = (min, max) => {
  return Math.round(Math.random() * (max - min) + min);
};

export function sortMessages(array) {
  return array.reduce(function (results, org) {
    (results[org.id] = results[org.id] || []).push(org);
    return results;
  }, {});
}

export function sortMessagesByTime(array, startTime, endTime) {
  const filteredArray = array.filter((obj) => {
    const objTime = obj.date.split(',')[0];
    const objDateTime = new Date(`2023-01-01T${objTime}`);
    const startDateTime = new Date(`2023-01-01T${startTime}`);
    const endDateTime = new Date(`2023-01-01T${endTime}`);

    return objDateTime >= startDateTime && objDateTime <= endDateTime;
  });

  return filteredArray;
}

export const timeToSeconds = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60;
};

export const secondsToTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${secs}`;
};

export function groupByClient(messages) {
  let resultado = {};

  for (const chave in messages) {
    const objeto = messages[chave];

    if (objeto) {
      let nome = objeto?.name?.trim().length > 0 ? objeto?.name : objeto?.number;
      nome = nome?.trim().replaceAll('"', '');

      if (!resultado[nome]) {
        resultado[nome] = [];
      }

      resultado[nome].push({ ...objeto });
    }
  }

  return resultado;
}

export function getMessagesOrdered(messages, times) {
  const filterByTime = times?.startTime !== '' && times?.endTime !== '';
  return filterByTime
    ? sortMessages(sortMessagesByTime(messages, times.startTime, times.endTime))
    : sortMessages(messages);
}

export const getPrice = (text) => {
  const regexComCifrao = /R\$ ?(\d{1,3}(?:\.\d{3})*),(\d{2})/g;

  let match = regexComCifrao.exec(text);
  if (match) {
    const valor = match[1].replace(/\./g, '') + '.' + match[2];
    return parseFloat(valor);
  }

  const regexComCifraoSemR = /\$?(\d{1,3}(?:\.\d{3})*),(\d{2})/g;

  let match1 = regexComCifraoSemR.exec(text);
  if (match1) {
    const valor = match1[1].replace(/\./g, '') + '.' + match1[2];
    return parseFloat(valor);
  }

  const regexSemCifrao = /(\d+(?:,\d{2})?)/g;
  match = regexSemCifrao.exec(text);

  if (match) {
    return parseFloat(match[1].replace(',', '.'));
  }

  return 0;
};

export function mountProductListByPerson(data) {
  let messagesOrdered = getMessagesOrdered(data.messages, data.params.times);

  let messagesFiltered = {};
  for (let prop in messagesOrdered) {
    const productName = messagesOrdered[prop][0].product;

    if (getPrice(productName) === 0) continue;

    const find = messagesOrdered[prop].filter((d) => d.interest.toLowerCase().trim() === 'desisto');
    if (find.length > 0) {
      find.forEach((f) => {
        messagesOrdered[prop] = messagesOrdered[prop].filter((d) => d.name !== f.name);
      });
    }

    messagesFiltered[prop] = messagesOrdered[prop][0];
  }

  const grouped = groupByClient(messagesFiltered);

  return grouped
}

export function mountProductList(data) {
  const grouped = getMessagesOrdered(data.messages, data.params.times);
  localStorage.setItem('products-mentioned', JSON.stringify(grouped));
}

const getCurrentDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Os meses começam em 0
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
};

export const messagesError = {
  unselectedGroup: 'Entre no seu grupo de vendas',
  notFound: 'Nenhuma mensagem encontrada',
  notLogged: 'Entre no whatsapp web',
  invalidUrl: 'URL inválida. Entre no Whatsapp Web.',
  notAllowed: 'Ops! Você não tem permissão para executar essa extensão.',
  invalidGroup: 'Ops! Este grupo não está configurado.',
};

export const generateProducsAvailable = async (elementRef) => {
  const input = elementRef.current;

  const productCards = input.querySelectorAll('.product-card');

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();

  for (let i = 0; i < productCards.length; i++) {
    const product = productCards[i];

    const canvas = await html2canvas(product, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const imgHeight = canvas.height;

    if (i > 0) {
      pdf.addPage();
    }

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight * 0.6);
  }

  pdf.save('Produtos_Disponiveis.pdf');
};

export const htmlToImageConvert = async (elementRef) => {
  try {
    return await toJpeg(elementRef.current, { cacheBust: false });
  } catch (e) {
    console.error('fn: htmlToImageConvert [toJpeg]', elementRef?.current);
  }
};

export const generateReportImages = async (productList, elRefs) => {
  const promiseArray = elRefs.map((element) => htmlToImageConvert(element));
  const result = await Promise.all(promiseArray);

  var zip = new JSZip();
  result.forEach((imgData, index) => {
    let clientName = productList[index];
    if (clientName) {
      clientName = clientName.trim();
      let fileName = clientName.length > 0 ? clientName : 'Desconhecido';
      fileName.replaceAll('/', '');
      zip.file(`${fileName}.jpg`, imgData.split(',')[1], { base64: true });
    }
  });

  zip.generateAsync({ type: 'base64' }).then(function (content) {
    const link = document.createElement('a');
    link.href = 'data:application/zip;base64,' + content;
    link.download = `Vendas-${getCurrentDate()}.zip`;
    link.click();
  });
};

export const createCanvas = async (elementRef) => {
  try {
    return await html2canvas(elementRef?.current);
  } catch (e) {
    console.error('fn: createCanvas [html2canvas]', elementRef?.current);
  }
};

export const generateReportPdf = async (elRefs) => {
  const promiseArray = elRefs.map((element) => htmlToImageConvert(element));
  const imagesBase64 = await Promise.all(promiseArray);

  const doc = new jsPDF();
  const imgWidth = 190;
  let yOffset = 10;

  const addImageToPDF = (base64Image) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Image;

      img.onload = () => {
        const imgHeightCalculated = (img.height * imgWidth) / img.width;
        if (yOffset + imgHeightCalculated > doc.internal.pageSize.height) {
          doc.addPage();
          yOffset = 20;
        }
        doc.addImage(base64Image, 'JPEG', 10, yOffset, imgWidth, imgHeightCalculated);
        yOffset += imgHeightCalculated + 20;
        resolve();
      };

      img.onerror = reject;
    });
  };

  for (const base64Image of imagesBase64) {
    try {
      await addImageToPDF(base64Image);
    } catch (e) {
      console.error('Error: [addImageToPDF]');
    }
  }

  doc.save(`Vendas-${getCurrentDate()}.pdf`);
};

export const getOptionsSelectInitialFilter = (postDay) => {
  const dayName = [
    'domingo',
    'segunda-feira',
    'terça-feira',
    'quarta-feira',
    'quinta-feira',
    'sexta-feira',
    'sábado',
  ];
  const scrollTo = dayName[dayName.indexOf(postDay.toLowerCase()) - 1];

  let filterDaysWeek = { HOJE: 'ONTEM' };

  filterDaysWeek[`ÚLTIMA ${postDay}`] = scrollTo.toUpperCase();

  filterDaysWeek[`ÚLTIMA SEXTA-FEIRA`] = 'QUINTA-FEIRA';

  const today = dayName[new Date().getDay()].toUpperCase();

  const options = [];
  for (var prop in filterDaysWeek) {
    options.push({
      name: prop,
      value: filterDaysWeek[prop],
      selected: postDay.toUpperCase() === today ? 'ONTEM' : scrollTo.toUpperCase(),
    });
  }

  return options;
};

export const getLastWeekdayDate = (targetDay) => {
  const dayMap = {
    domingo: 0,
    'segunda-feira': 1,
    'terça-feira': 2,
    'quarta-feira': 3,
    'quinta-feira': 4,
    'sexta-feira': 5,
    sábado: 6,
  };

  if (!(targetDay in dayMap)) return '';

  const targetDayIndex = dayMap[targetDay];
  const today = new Date();
  const todayIndex = today.getDay();

  let daysToSubtract = todayIndex - targetDayIndex;

  if (daysToSubtract < 7) {
    daysToSubtract += 7;
  }

  const lastWeekDate = new Date(today);
  lastWeekDate.setDate(today.getDate() - daysToSubtract);

  const day = String(lastWeekDate.getDate()).padStart(2, '0');
  const month = String(lastWeekDate.getMonth() + 1).padStart(2, '0'); // meses começam do 0
  const year = lastWeekDate.getFullYear();

  return `${day}/${month}/${year}`;
};

export const removerAcentos = (text) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export function groupMessagesByProduct() {
  const allInterestedPeopleInProduct = {};
  for (const msg of mensagens) {
    const { productId } = msg;

    if (!allInterestedPeopleInProduct[productId]) {
      allInterestedPeopleInProduct[productId] = [];
    }

    allInterestedPeopleInProduct[productId].push(msg);
  }

  return allInterestedPeopleInProduct;
}