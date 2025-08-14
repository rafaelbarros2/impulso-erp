export const environment = {
  production: true,
  apiUrl: 'https://api.impulso.com/api', // Alterar para URL de produção
  storefrontUrl: 'https://storefront.impulso.com',
  enableDevTools: false,
  enableLogging: false,
  cacheConfig: {
    stylesCache: {
      enabled: true,
      duration: 15 * 60 * 1000, // 15 minutos em produção
      maxEntries: 100
    }
  },
  // Configurações específicas do storefront
  storefront: {
    defaultTheme: 'default',
    enablePreview: false, // Desabilitado em produção por segurança
    autoLoadStyles: true,
    fallbackToLocalFiles: false // Não usar fallback em produção
  }
};