/** @type {import('tailwindcss').Config} */
module.exports = {
   content: [
     "./src/**/*.{html,ts,js}",
     "./projects/**/*.{html,ts,js}",
     "./node_modules/primeng/**/*.{html,ts,js,mjs}" 
   ],
   theme: {
     extend: {},
   },
   plugins: [],
   corePlugins: {
     preflight: false, // Desabilita o reset CSS do Tailwind para não conflitar com PrimeNG
   },
   safelist: [
    { pattern: /^(grid|flex|items-|justify-|gap-).+/ },
    { pattern: /^(bg|text|border)-(primary|red|gray)-\d+$/ },
    { pattern: /^(rounded|shadow|transform|rotate-).+/ }
  ]
};