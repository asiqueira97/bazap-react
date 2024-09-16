import React from 'react'
import { randomNumber } from '../../utils/utils'
import style from './style.scss'

function ProductSoldCard({ product, products }) {
    const messages = products[product]

    const productName = messages[0].product
    const image = messages[0].imageUrl

    const seconds = []                                
    function addSecond(number) {     
        if( seconds.includes(number) || seconds.length === messages.length )	return
        
        seconds.push(number)
        
        for( let i=1;i<=messages.length;i++ ) {
            let numberRandom = randomNumber(15,40)
            addSecond(numberRandom)
        }    
    }

    addSecond(randomNumber(15,30), messages.length)

    seconds.sort( (a,b) => a - b )

    console.log('\n')
    console.log('\n')
    console.log(productName)

    return (
        <div className="product-sold-card">
            <div className="product-image">
                <img src={image} />
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
                            console.log(message)                       
                            const contact = message.name || message.number
                            const time = message.date.split(',')[0].trim()
                            let second = seconds[index]
                            second = `${ second < 10 ? `0${second}` : second }`

                            return (
                                <tr key={index}>
                                    <td>
                                        { message.imageProfile ? 
                                            <img className="profileImage" src={message.imageProfile} /> :
                                            <div className="profileBgCircle">
                                                { contact.length > 0 ? contact[0] : 'D' }
                                            </div>
                                        }
                                    </td>
                                    <td>{contact.trim()}</td>
                                    <td>{message.interest}</td>
                                    <td><strong>{time}:{second}</strong></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ProductSoldCard
