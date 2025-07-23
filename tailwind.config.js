import PrimeUI from 'tailwindcss-primeui';

/** @type {import('tailwindcss').Config} */
module.exports = {
   content: [
     "./src/**/*.{html,ts,js}",
     "./node_modules/primeng/**/*.{html,ts,js,mjs}" 
   ],
   theme: {
     extend: {},
   },
   plugins: [
     PrimeUI
   ],
   corePlugins: {
     preflight: false, // Desabilita o reset CSS do Tailwind para não conflitar com PrimeNG
   },
};