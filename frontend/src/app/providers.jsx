import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store.js';
import { ConfirmProvider } from '../context/ConfirmContext.jsx';

export const AppProviders = ({ children }) => {
  return (
    <Provider store={store}>
      <ConfirmProvider>
        {children}
      </ConfirmProvider>
    </Provider>
  );
};

export default AppProviders;