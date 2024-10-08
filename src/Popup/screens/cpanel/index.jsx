import React from "react";
import Siderbar from "../../components/sidebar/siderbar";
import Dashboard from "./dashboard/dashboard";
import Clients from "./clients/clients";
import Products from "./products/products";
import { useBazapContext } from "../../context/BazapContext";

const Panel = () => {

    const { currentPage } = useBazapContext()

    const pages = {
        'dashboard' : {
            'title': 'Dashboard',
            'component': <Dashboard />
        },
        'clients': {
            'title': 'Clientes',
            'component': <Clients />
        },
        'products': {
            'title': 'Produtos',
            'component': <Products />
        }
    }

    return (
        <div className="Bazap_dashboard">
            <div className="Dashboard__container">
                
                <Siderbar />

                <div className="Dashboard__content">
                    <header>
                        <h3>{pages[currentPage]['title']}</h3>
                    </header>

                    <div className="Dashboard_page-content">
                        {pages[currentPage]['component']}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Panel;