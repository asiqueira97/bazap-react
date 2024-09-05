import React from "react";
import Initial from "./screens/initial/initial";
import Panel from "./screens/cpanel/index";
import { useBazapContext } from "./context/BazapContext";

const Popup = () => {

    const { initialPage } = useBazapContext()

    return (
        <div className="Bazap__main">
            {initialPage ? <Initial /> : <Panel />}
        </div>
    )
}

export default Popup