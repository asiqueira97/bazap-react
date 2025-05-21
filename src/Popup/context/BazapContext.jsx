import React, { useEffect, createContext, useContext, useState, useCallback } from 'react'
import { mountProductListByPerson, mountProductList, optionsProductsPage, messagesError } from '../utils/utils'
import BazapConfig from '../../../bazap.config.json'

export const BazapContext = createContext()

export default function BazapContextProvider({children}) {

  const { groupName, postDay, allowedNumbers, active, keywords } = BazapConfig

  const [port, setPort] = useState()

  const [initialPage, setInitialPage] = useState(true)

  const [hasPermission, setHasPermission] = useState(false)
  
  const [showPix, setShowPix] = useState(true)
  
  const [currentPage, setCurrentPage] = useState('clients')

  const [loadingSearch, setLoadingSearch] = useState(false)

  const [optionsProductFilter, setOptionsProductFilter] = useState(optionsProductsPage)
  const productFilterSelected = optionsProductFilter.find( option => option.active )

  const [alertMessage, setAlertMessage] = useState(false)

  const [modals, setModals] = useState([
    { name: 'report-clients', opened: false }
  ])

  const handleModal = (name, action) => {
    const newModals = modals.map( modal => {
      if( modal.name !== name ) return modal
      return {
        ...modal,
        opened: action === 'open'
      }
    } )

    setModals(newModals)
  }

  const getTabs = useCallback(async () => {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })

    if( !tabs[0].url.includes('whatsapp.com') ) {
        setAlertMessage(messagesError['invalidUrl'])
        return;
    }

    var port = chrome.tabs.connect(tabs[0].id,{name: "content"})
    port.postMessage({ message:"init" })

    setPort(port)

    port.onMessage.addListener(function(response) {
      
      if( response.message === 'jsonDataExists' ) {
        const jsonData = JSON.parse(response.jsonData)

        mountProductListByPerson(jsonData)
        mountProductList(jsonData)

        setTimeout(() => {
          setLoadingSearch(false)
          setInitialPage(false)
        }, 500 )
      }

      if(response.message === 'list') {
        if(response.domInfo.messages.length > 0) {
            mountProductListByPerson(response.domInfo)
            mountProductList(response.domInfo)
        }

        setTimeout(() => {
          setLoadingSearch(false)
          setInitialPage(false)
        }, 500 )
      }

      if(response.message === 'notFound' || response.message === 'notLogged') {
        setLoadingSearch(false)
        setAlertMessage(messagesError[response.message])
      }

      if(response.message === 'unselectedGroup') {
        setHasPermission(false)
        setLoadingSearch(false)
        setAlertMessage(messagesError[response.message])
      }

      if(response.message === 'checkPermission') {

        const { numberLogged } = response
        
        const hasPermission = allowedNumbers.includes(numberLogged) && active

        if(!hasPermission) {
          setAlertMessage(messagesError['notAllowed'])
          return
        }

        setHasPermission(true)

        const permission = {
          groupName,
          keywords
        }

        port.postMessage({ message:"permission_data", permission })
      }

      if(response.message === 'list_published_products') {
        localStorage.setItem('published-products', JSON.stringify(response.products))
      }
    })
  }, []);

  useEffect(() => {
    getTabs();
  }, [getTabs]);

  return (
    <BazapContext.Provider
      value={{
        groupName, postDay, allowedNumbers, active,
        hasPermission, setHasPermission,
        port, setPort,
        loadingSearch, setLoadingSearch,
        initialPage, setInitialPage,
        currentPage, setCurrentPage,
        alertMessage, setAlertMessage,
        optionsProductFilter, setOptionsProductFilter, productFilterSelected,
        modals, setModals, handleModal,
        showPix, setShowPix
      }}
    >
      {children}
    </BazapContext.Provider>
  )
}

export function useBazapContext() {
  const context = useContext(BazapContext)
  return context
}
