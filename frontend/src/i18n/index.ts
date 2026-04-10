import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import translations
import kkTranslation from './locales/kk/translation.json'
import ruTranslation from './locales/ru/translation.json'
import enTranslation from './locales/en/translation.json'

const resources = {
  kk: {
    translation: kkTranslation,
  },
  ru: {
    translation: ruTranslation,
  },
  en: {
    translation: enTranslation,
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'kk', // Default language
  fallbackLng: 'kk',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
