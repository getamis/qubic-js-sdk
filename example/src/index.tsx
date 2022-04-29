import React from 'react';
import Web3 from 'web3';
import ReactDOM from 'react-dom/client';
import { Web3ReactProvider } from '@web3-react/core';
import { createGlobalStyle } from 'styled-components';
import { normalize } from 'styled-normalize';
import App from './App';

const GlobalStyle = createGlobalStyle`
  ${normalize}
  * {
    color: #fff;
  }

  body {
    background-color: #3e4b64;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Arial", sans-serif
  }

  button {
    outline: none;
    border: none;
  }
`;

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const library = (provider: any): Web3 => {
  console.log({
    'provider.isQubic': provider.isQubic,
  });
  return new Web3(provider);
};

root.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={library}>
      <GlobalStyle />
      <App />
    </Web3ReactProvider>
  </React.StrictMode>,
);
