import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/store.ts'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Conecta el store a React para que los hooks generados puedan usarlo. */}
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
