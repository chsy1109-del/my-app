import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css'; // 이 줄이 있어야 픽셀 배경이 보입니다!

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}