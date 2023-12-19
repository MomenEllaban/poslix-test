module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar'],
  },
  fallbackLng: {
    default: ['en'],
  },
  localePath:
    typeof window === 'undefined' ? require('path').resolve('./public/locales') : '/public/locales',
  // ns: ['common'],
  fallbackNS: ['common'],
  defaultNS: ['common'],
  serializeConfig: false,
  returnNull: false,
};
