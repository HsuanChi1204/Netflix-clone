import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';

const AllTheProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </BrowserRouter>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// 重新導出所有 testing-library/react 的內容
export * from '@testing-library/react';

// 覆蓋 render 方法
export { customRender as render }; 