export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  storefrontUrl: 'http://localhost:4200',
  enableDevTools: true,
  enableLogging: true,
  cacheConfig: {
    stylesCache: {
      enabled: true,
      duration: 5 * 60 * 1000, // 5 minutos
      maxEntries: 50
    }
  },
  // Configurações específicas do storefront
  storefront: {
    defaultTheme: 'demo',
    enablePreview: true,
    autoLoadStyles: true,
    fallbackToLocalFiles: true
  }
};
