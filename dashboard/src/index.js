import React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './components/App/App';

console.log(`
    HOUSTON DASHBOARD
    -----------------
    source: https://github.com/datasparq-ai/houston-ui
    
    
`)

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App />);
// ReactDOM.render(<App />, document.getElementById('root'));

