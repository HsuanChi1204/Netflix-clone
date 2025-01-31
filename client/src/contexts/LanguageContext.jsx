import React, { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import enUS from '../locales/en-US';
import zhTW from '../locales/zh-TW';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export { LanguageContext };

export const LanguageProvider = ({ children }) => {
  // 從 localStorage 獲取語言設置，默認為繁體中文
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem('language') || 'zh-TW'
  );

  // 根據當前語言獲取對應的翻譯
  const translations = currentLanguage === 'zh-TW' ? zhTW : enUS;

  // 切換語言
  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'zh-TW' ? 'en-US' : 'zh-TW';
    setCurrentLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // 提供翻譯函數
  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value[k];
      if (!value) return key;
    }
    return value;
  };

  const value = {
    currentLanguage,
    toggleLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired
}; 