import {
    generateId,
    getContactNumber,
    getTime,
    getPrice,
    verificarEmoji
} from './utils/utils'

const settings = { timeScrollUp: 1 }

function scrollToUp(divMessagesContainer, period) {  

    period = period.split('|')
    
    divMessagesContainer.scrollTop = 0

    let days = [] 
    const findDays = document.querySelectorAll('.x1n2onr6.x9f619')
    
    findDays.forEach(day => days.push(day.innerText.toUpperCase()))

    const checkInclude = period.length === 1 ? 
    days.includes(period[0]) : 
    days.includes(period[0]) || days.includes(period[1])

    return checkInclude || document.querySelectorAll('span[data-icon="lock-small"]').length == 1
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
                        flag: 'foto'
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
        const images = quoteContainer.querySelectorAll('.x18d0r48')
        const emojiContainer = quoteContainer.querySelector('._am2u._ar8h')

        let sender = quoteContainer.getAttribute('data-pre-plain-text')
        let interest = quoteContainer.querySelector('._akbu')

        const allCard = quoteContainer.parentElement.parentElement.parentElement.parentElement;
        const profileImageContainer = allCard.querySelector('div[aria-label*="Abrir os dados da conversa"]')

        if(!sender && emojiContainer) {
            sender = quoteContainer.querySelector('._am2m').querySelector('span').getAttribute('aria-label') || quoteContainer.querySelector('._am2m').querySelectorAll('span')[1].text
        }

        if(product && images.length > 0 && sender && (interest || emojiContainer) ) {

            let messageValid = false

            if( interest && !emojiContainer ) {
                interest = interest.querySelector('.selectable-text').innerText
                messageValid = localStorage.getItem('EXT_KEYWORDS').split(',').some((key) => interest.toLowerCase().includes(key))
            } else {
                interest = 'Quero (emoji)'
                messageValid = verificarEmoji(emojiContainer)
            }

            if(messageValid) {
                const image = images[1] || images[0]
                const imageUrl = image.getAttribute('style').replace('background-image: url(', '').replace(');', '').replace(/[\\"]/g, '')
                const nameContainer = quoteContainer.parentElement.querySelectorAll('div')[0]

                if(imageUrl !== '' && nameContainer) {
                    const id = generateId(product.innerText)
                    const name = nameContainer.querySelector('span').innerText.trim()

                    let date = sender.split(']')[0].replace('[','') || 'QUARTA-FEIRA'
                    let time = ''
                    let number = ''

                    if(interest && !emojiContainer) {
                        time = getTime(sender)
                        number = getContactNumber(sender)
                    } else {
                        time = {
                            time: emojiContainer.querySelectorAll('div')[1].querySelector('span').text,
                            date: date
                        }
                    }

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
                        time,
                        imageProfile,
                        price,
                        number,
                        sender: sender.slice(0, -2),
                        product: product.innerText.trim(),
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

    console.log('messages', messages)

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

                const divMessagesContainer = document.querySelector('.xjbqb8w.x1ewm37j')

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