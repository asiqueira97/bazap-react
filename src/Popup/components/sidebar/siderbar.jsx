import React from 'react'
import logo from '../../../assets/icon.png'
import { IoIosPeople } from "react-icons/io";
import { GiClothes } from "react-icons/gi";
import { MdSpaceDashboard } from "react-icons/md";
import { useBazapContext } from '../../context/BazapContext'
import style from './style.scss'

function Siderbar() {

    const { groupName, currentPage, setCurrentPage } = useBazapContext()

    const handleClick = (page) => {
        setCurrentPage(page)
    }

    return (
        <div className="Dashboard__sidebar">

            <header>
                <img src={logo} />
                <p>{groupName.toUpperCase()}</p>
            </header>

            <div className="titleMenu">Menu</div>
            <menu>
                <li>
                    <a className={`${currentPage === 'dashboard' ? 'active' : ''}`} onClick={()=>handleClick('dashboard')}>
                        <MdSpaceDashboard /> Dashboard
                    </a>
                </li>

                <li>
                    <a className={`${currentPage === 'clients' ? 'active' : ''}`} onClick={()=>handleClick('clients')}>
                        <IoIosPeople />Clientes
                    </a>
                </li>

                <li>
                    <a className={`${currentPage === 'products' ? 'active' : ''}`} onClick={()=>handleClick('products')}>
                        <GiClothes /> Produtos
                    </a>
                </li>
            </menu>

        </div>
    )
}

export default Siderbar
