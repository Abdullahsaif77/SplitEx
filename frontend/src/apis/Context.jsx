import { createContext } from "react";
import { useState } from "react";

export const PageContext = createContext();

export const PageProvider = ({children})=>{
    const [ActivePage , setActivePage] = useState('Home');

    return (
        <PageContext.Provider value = {{ActivePage , setActivePage}}>
            {children}
        </PageContext.Provider>
    )
}

