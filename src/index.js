import React from 'react'
import ReactDOM from "react-dom/client"
import { render } from "react-dom/client"
import { legacy_createStore as createStore, applyMiddleware, compose, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import authReducer from './store/reducers/authReducer'
import mainReducer from './store/reducers/mainReducer'
import thunk from 'redux-thunk'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const rootReducer = combineReducers({
    auth: authReducer,
    main: mainReducer
})

const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(thunk))
)

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<Provider store={store}><HashRouter><App /></HashRouter></Provider>)
registerServiceWorker()