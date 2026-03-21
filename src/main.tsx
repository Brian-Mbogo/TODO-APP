import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App.tsx'
import './index.css'
import { store } from './store/store.ts'
import '../style.css'

// ReactDOM mounts the React app into the <div id="root"></div> in index.html.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Provider makes the Redux store available to all components via hooks like useSelector/useDispatch. */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
