export function generateId(productName) {
    let formattedName = productName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    formattedName = formattedName.replace(/[/,\s.]+/g, '-');
    formattedName = formattedName.replace(/-+/g, '-');
    formattedName = formattedName.replace(/^-|-$/g, '');
  
  	return formattedName.trim()
}

export function getContactNumber(str) {
    const regex = /(\+55 \d{2} \d{5}-\d{4})/g;
    const numeros = str.match(regex);
    return numeros ? numeros[0] : [];
}
  
export function getTime(str) {
    const regex = /\[(\d{2}:\d{2}), (\d{2}\/\d{2}\/\d{4})\]/;
    const match = str.match(regex);
    if (match) {
        return {
        time: match[1],
        date: match[2]
        };
    } else {
        return null;
    }
}

export function getPrice(text){
	const regexComCifrao = /R\$ ?(\d{1,3}(?:\.\d{3})*),(\d{2})/g
    
    let match = regexComCifrao.exec(text)
    if (match) {
        const valor = match[1].replace(/\./g, '') + '.' + match[2]
        return parseFloat(valor)
    }
    
    const regexComCifraoSemR = /\$?(\d{1,3}(?:\.\d{3})*),(\d{2})/g
    
    let match1 = regexComCifraoSemR.exec(text)
    if (match1) {
        const valor = match1[1].replace(/\./g, '') + '.' + match1[2]
        return parseFloat(valor)
    }
    
    const regexSemCifrao = /(\d+(?:,\d{2})?)/g
    match = regexSemCifrao.exec(text)

    if (match) {
        return parseFloat(match[1].replace(',', '.'))
    }
    
    return 0
}

export function verificarEmoji(element) {
    if(!element) return;

    const emoji = element.querySelector('img').getAttribute('alt')
 
    if(emoji) {
        const handEmojiRegex = /^🙋/;
        return handEmojiRegex.test(emoji)
    }

    return false
}