export function getPrice(text) {
  const match = text.match(/(?:R\$|\$)\s?(\d{1,3}(?:[\.\,]?\d{3})*[\.,]?\d{0,2})/);
  if (!match) return 0;

  const value = match[1].replace(/\./g, '').replace(',', '.');

  return parseFloat(value);
}

export function verificarEmoji(element) {
  if (!element) return;

  const emoji = element.querySelector('img').getAttribute('alt');

  if (emoji) {
    const handEmojiRegex = /^🙋/;
    return handEmojiRegex.test(emoji);
  }

  return false;
}

///////// NOVAS

export function extrairInfo(dataText) {
  if (!dataText) return null;

  const regex = /^\[(\d{1,2}:\d{2}), (\d{1,2})\/(\d{1,2})\/(\d{4})\] (.+?):/;
  const match = dataText.match(regex);

  if (!match) return null;

  const [, time, day, month, year, sender] = match;
  const dayFormatted = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;

  const isNumber = /^\+\d{2} \d{2} \d{5}-\d{4}$/.test(sender);

  return {
    day: dayFormatted,
    time,
    ...(isNumber ? { number: sender.replace(/[^\d+]/g, '') } : { name: sender }),
  };
}

export function extrairNomeENumero(div) {
  const spanComNome = div.querySelector('span[dir="auto"]');
  const spanComNumero = div.querySelector('span._ahx_');

  function limparNome(texto) {
    // Mantém apenas letras latinas, espaços e acentos
    return texto
      .normalize('NFD') // Separa acentos
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z\s-]/g, '') // Remove símbolos não latinos
      .replace(/\s+/g, ' ') // Reduz múltiplos espaços
      .trim();
  }

  function limparNumero(texto) {
    // Remove tudo exceto + e números
    return texto.replace(/[^\d+]/g, '');
  }

  if (spanComNome && spanComNumero) {
    // Extrair apenas os textos (ignorando emojis)
    const nomeBruto = [...spanComNome.childNodes]
      .filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '')
      .map((node) => node.textContent)
      .join('')
      .trim();

    const nome = limparNome(nomeBruto);
    const numero = limparNumero(spanComNumero.textContent.trim());

    if (!nome) {
      return numero;
    }

    return `${nome} (${numero})`;
  }

  if (spanComNumero) {
    return limparNumero(spanComNumero.textContent.trim());
  }

  if (spanComNome) {
    const nomeBruto = spanComNome.textContent.trim();
    const nome = limparNome(nomeBruto);
    return nome
  }

  return null
}
