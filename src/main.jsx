import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Disable mouse wheel changing number input values globally across the entire project
document.addEventListener(
  'wheel',
  (e) => {
    if (e.target instanceof HTMLInputElement && e.target.type === 'number') {
      e.target.blur();
    } else if (document.activeElement instanceof HTMLInputElement && document.activeElement.type === 'number') {
      document.activeElement.blur();
    }
  },
  { passive: true }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
