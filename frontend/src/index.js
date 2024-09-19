import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux";
import { applyMiddleware, compose } from "redux";
import { configureStore } from '@reduxjs/toolkit'
import { thunk } from "redux-thunk";
import reducers from "./reducers";




import App from './App'

const store = configureStore({reducer:reducers}, compose(applyMiddleware(thunk)));

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
    <Provider store={store}>
        <App/>
    </Provider>);