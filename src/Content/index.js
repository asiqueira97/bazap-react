const settings = { timeScrollUp: 1 }

function generateId(productName) {
    let formattedName = productName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    formattedName = formattedName.replace(/[/,\s.]+/g, '-');
    formattedName = formattedName.replace(/-+/g, '-');
    formattedName = formattedName.replace(/^-|-$/g, '');
  
  	return formattedName.trim()
}

function scrollToUp(divMessagesContainer, period) {  

    period = period.split('|')

    // document.querySelector('._ajyl').scrollTop = 0
    divMessagesContainer.scrollTop = 0

    let days = [] 
    const findDays = document.querySelectorAll('._amjw._amk1._aotl.focusable-list-item')
    
    findDays.forEach(day => days.push(day.innerText.toUpperCase()))

    const checkInclude = period.length === 1 ? 
    days.includes(period[0]) : 
    days.includes(period[0]) || days.includes(period[1])

    return checkInclude || document.querySelectorAll('span[data-icon="lock-small"]').length == 1
}

function getPrice(text) {
    var regex = /[0-9]+,.[0-9]+/;
    var price = text.match(regex)
    if(!price) return 0
    return parseFloat( price[0].replace(',','.') )
}

function getRowsForDay(day = 'HOJE') {
    day = day.trim().toLowerCase()

    const dates = document.querySelectorAll('.focusable-list-item')
    
    // Encontre o elemento que corresponde ao dia especificado
    let startCollecting = false
    let rows = []
    
    dates.forEach(dateElement => {
        const spanText = dateElement.querySelector('span').textContent.trim().toLowerCase()
        
        if (spanText === day) {
            startCollecting = true
        } else if (startCollecting && spanText.match(/^[A-Z]/)) {
            startCollecting = false
        }
        
        if (startCollecting) {
            // Pegar as rows após o dia correspondente
            let sibling = dateElement.nextElementSibling
            
            while (sibling && !sibling.classList.contains('focusable-list-item')) {
                if (sibling.getAttribute('role').includes('row')) {
                    rows.push(sibling)
                }

                sibling = sibling.nextElementSibling
            }
        }
    })
    
    return rows
}

function getPublishedProducts(port) {
    let products = []

    document.querySelectorAll('div[data-pre-plain-text*="Alessandra"]').forEach(el => {
        const text = el.querySelector('._ao3e.selectable-text.copyable-text').innerText

        if( getPrice(text) > 0 ) {
            const id = generateId(text)
            const isVideo = el.querySelector('span[data-icon="media-play"]') !== null

            if(isVideo) {
                const image = el.querySelector('div[style*="background-image"]')
                if(image) {
                    const imageUrl = image.getAttribute('style').replace('background-image: url(', '').replace(');', '').replace(/[\\"]/g, '').replaceAll(' ', '').replace('width:100%;','')
                    products.push({
                        id,
                        name: text,
                        urlImages: [imageUrl],
                        flag: 'video'
                    })
                }
            }  else {
                const divImages = el.querySelector('div[aria-label="Abrir imagem"]')

                if(divImages) {
                    const images = divImages.querySelectorAll('img')
                    const urlImages = Array.from(images).map( img => img.src )

                    products.push({
                        id,
                        name: text,
                        urlImages,
                        flag: 'imagem'
                    })
                }
            } 

        }
    })

    port.postMessage({message:'list_published_products', products})
}

function getMentionedMessages() {
    let quotedMessages = []

    document.querySelectorAll('div[aria-label="Mensagem citada"]').forEach( quoteMessage => {
        const quoteContainer = quoteMessage.parentElement.parentElement.parentElement
        const product = quoteContainer.querySelector('.quoted-mention')
        const sender = quoteContainer.getAttribute('data-pre-plain-text')
        const images = quoteContainer.querySelectorAll('.x18d0r48')
        let interest = quoteContainer.querySelector('._akbu')

        const allCard = quoteContainer.parentElement.parentElement.parentElement.parentElement;
        const profileImageContainer = allCard.querySelector('div[aria-label*="Abrir os dados da conversa"]')
    
        if(product && images.length > 0 && sender && interest) {

            interest = interest.querySelector('.selectable-text').innerText
            const messageValid = localStorage.getItem('EXT_KEYWORDS').split(',').some((key) => interest.toLowerCase().includes(key))

            if(messageValid) {
                const image = images[1] || images[0]
                const imageUrl = image.getAttribute('style').replace('background-image: url(', '').replace(');', '').replace(/[\\"]/g, '')
                const nameContainer = quoteContainer.parentElement.querySelector('.x78zum5')

                if(imageUrl !== '' && nameContainer) {
                    const id = generateId(product.innerText)
                    const name = nameContainer.querySelector('span').innerText.trim()

                    const date = sender.split(']')[0].replace('[','')
                    const number = sender.split(']')[1].trim()

                    const isSaved = number.toLowerCase().includes(name.toLowerCase())

                    let imageProfile = ''
                    if(profileImageContainer) {
                        const profileImageElement = profileImageContainer.querySelector('img')
                        if(profileImageElement) {
                            imageProfile = profileImageElement.src
                        }
                    }

                    const price = getPrice(product.innerText)

                    const dataDessage = {
                        id,   
                        name,
                        imageUrl,
                        interest,
                        date,
                        imageProfile,
                        price,
                        sender: sender.slice(0, -2),
                        product: product.innerText.trim(),
                        number: isSaved ? '' : number.replace(':','')
                    }

                    if(price > 0) {
                        quotedMessages.push(dataDessage)
                    }
                }
            }
        }
    } )

    return quotedMessages
}

function getMessages(port, params, groupName) {
    const messages = getMentionedMessages()

    if(messages.length > 0) {
        const domInfo = { groupName, messages, params }
        port.postMessage({message:'list', domInfo})
        document.querySelector('#app').setAttribute('json-data', JSON.stringify(domInfo))
    }else{
        port.postMessage({message:'notFound'})
    }
}

function getNameChatSelected() {
    const chatSelected =  document.querySelector('div[aria-label*="Lista de conversas"]').querySelector('div[aria-selected="true"]')

    if(!chatSelected) return ''

    return chatSelected.querySelector('div[role*="gridcell"]').querySelector('span').innerText
}

function hasElementScroll(element) {
    return element.scrollHeight > element.clientHeight;
}


function init(port, params) {
    const jsonData = document.querySelector('#app').getAttribute('json-data')
        
    const interval = setInterval(() => {
        const header = document.querySelector('#main header')

        if(header) {
            clearInterval(interval)
            
            const groupName = header.querySelector('span').innerText.toLowerCase().trim()

            if(localStorage.getItem('EXT_GROUP_NAME').toLowerCase() === groupName) {

                if(document.querySelectorAll('.message-in.focusable-list-item').length === 0) {
                    port.postMessage({message:'notFound'})
                    return;
                }

                if(jsonData) {
                    getMessages(port,params, groupName)
                    return;
                }

                const divMessagesContainer = document.querySelector('._ajyl')

                if( hasElementScroll(divMessagesContainer) ) {
                    const toUp = setInterval(function() {
                        const find = scrollToUp(divMessagesContainer, params.period)
                        if(find) {
                            clearInterval(toUp)
                            
                            setTimeout( () => {
                                getMessages(port,params,groupName)
                                getPublishedProducts(port)
                            }, 1000 )
                        }
                    }, settings.timeScrollUp)
                } else {
                    port.postMessage({message:'notFound'})
                }

            } else {
                port.postMessage({message:'notFound'})
            }
        }
    }, 1000)
}

chrome.runtime.onConnect.addListener(function(port) {
    if(port.name === "content") {
        port.onMessage.addListener(function(response) {

            if(response.message === 'init') {

                const jsonData = document.querySelector('#app').getAttribute('json-data')
                if(jsonData) {
                    port.postMessage({message:'jsonDataExists', jsonData})
                }
                
                const checkWhatsAppOpend = localStorage.getItem('me-display-name')

                if(!checkWhatsAppOpend) {
                    port.postMessage({message:'notLogged'})
                }

                let numberLogged = localStorage.getItem('last-wid-md')
                if(numberLogged) {
                    numberLogged = numberLogged.split(':')[0].replaceAll('"','')
                    port.postMessage({message:'checkPermission', numberLogged})
                }             
            }

            if(response.message === 'permission_data') {
                const chatSelected = getNameChatSelected()

                if( chatSelected.trim().toLowerCase() !== response.permission.groupName.toLowerCase()  ) {
                    port.postMessage({message:'unselectedGroup'})
                    return;
                }

                localStorage.setItem('EXT_GROUP_NAME', response.permission.groupName);
                localStorage.setItem('EXT_KEYWORDS', response.permission.keywords.join(','));
            }

            if(response.message === 'search') {
                init(port, response.params)
            }

        })
    }
})