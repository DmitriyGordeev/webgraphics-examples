import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import Store from './store';

import App from "./App";
import './index.css'


const root = document.getElementById('app');
ReactDOM.render(
    <Provider store={Store}>
        <div style={{width: "100%", height: "100%"}}>
            <App />
        </div>
    </Provider>,
    root);