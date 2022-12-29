import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import Store from './store';

import AppExp from "./AppExp";
import './index.css'


const root = document.getElementById('app');
ReactDOM.render(
    <Provider store={Store}>
        <div>
            <AppExp />
        </div>
    </Provider>,
    root);