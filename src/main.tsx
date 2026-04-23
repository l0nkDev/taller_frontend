import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { TamaguiProvider } from 'tamagui';

import App from './App';
import { store } from './store';
import appConfig from './tamagui.config';

import '@tamagui/core/reset.css'; 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <TamaguiProvider config={appConfig} defaultTheme="light">
        <App />
      </TamaguiProvider>
    </ReduxProvider>
  </StrictMode>,
);