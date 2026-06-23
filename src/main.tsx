import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { TamaguiProvider } from 'tamagui';
import { ToastProvider, ToastViewport } from '@tamagui/toast';
import '@tamagui/core/reset.css';

import App from './App';
import { store } from './store';
import appConfig from './tamagui.config';
import { CurrentToast } from './components/CurrentToast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <TamaguiProvider config={appConfig} defaultTheme="light">
        <ToastProvider>
          <App />
          <CurrentToast />
          <ToastViewport
            flexDirection="column-reverse"
            top="$4"
            right="$4"
            left="auto"
            bottom="auto"
          />
        </ToastProvider>
      </TamaguiProvider>
    </ReduxProvider>
  </StrictMode>,
);
