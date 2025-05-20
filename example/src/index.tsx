import React from 'react';
import ReactDOM from 'react-dom/client';
import { Web3ReactProvider } from '@web3-react/core';
import { createGlobalStyle } from 'styled-components';
import { normalize } from 'styled-normalize';
import { initGraphqlClient } from '@qubic-js/core';
import App from './App';
import wrappedConnectors from './wrappedConnectors';

initGraphqlClient({
  apiKey: process.env.REACT_APP_GRAPHQL_API_KEY || '',
  apiSecret: process.env.REACT_APP_GRAPHQL_API_SECRET || '',
  apiUri: process.env.REACT_APP_GRAPHQL_API_URI || '',
});

const GlobalStyle: any = createGlobalStyle`
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

root.render(
  <React.StrictMode>
    <Web3ReactProvider connectors={Object.values(wrappedConnectors)}>
      <GlobalStyle />
      <App />
    </Web3ReactProvider>
  </React.StrictMode>,
);
