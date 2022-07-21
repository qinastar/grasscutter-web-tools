import React, { createContext, useState } from 'react';

const getContentValuesFromLocalstorage = () => {
  const [navMenuCollapsed, setNavMenuCollapsed] = useState(false);
  const [wssUrl, setWssUrl] = useState('');

  return {
    global: {
      navMenuCollapsed,
      wssUrl,
      actions: {
        setWssUrl,
        setNavMenuCollapsed,
      },
    },
  };
};
export const GlobalContext = createContext({});

export function GlobalContextProvider({ children }) {
  const contextValues = getContentValuesFromLocalstorage();
  return <GlobalContext.Provider value={contextValues}>
    {children}
  </GlobalContext.Provider>;
}
