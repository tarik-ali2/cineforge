import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

if (window.location.pathname.startsWith('/admin')) {
  import('./admin/Admin.jsx').then(({ default: Admin }) => {
    createRoot(document.getElementById('root')).render(
      <StrictMode><Admin /></StrictMode>
    )
  })
} else {
  import('./App.jsx').then(({ default: App }) => {
    createRoot(document.getElementById('root')).render(
      <StrictMode><App /></StrictMode>
    )
  })
}
