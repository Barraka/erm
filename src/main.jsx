import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './App.css';
import { ToastProvider } from "./components/ToastProvider";

createRoot(document.getElementById('root')).render(
  <ToastProvider>
    <App />
  </ToastProvider>
)
