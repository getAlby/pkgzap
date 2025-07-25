import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/fonts/HostGrotesk/hostgrotesk.css'
import App from './App.tsx'
import { UserContextProvider } from './context/index.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserContextProvider>
      <App />
    </UserContextProvider>
  </StrictMode>,
)
