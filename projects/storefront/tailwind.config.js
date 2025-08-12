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
   safelist: [
    { pattern: /^(w|h|min-h|max-w|max-h)-\[.*\]$/ },   // ex: h-[50vh]
    { pattern: /^(grid|flex|items-|justify-|gap-).+/ },
    { pattern: /^(bg|text|border)-(primary|red|gray)-\d+$/ },
    { pattern: /^md:.+$/ }, { pattern: /^lg:.+$/ }, { pattern: /^xl:.+$/ },
    { pattern: /^(rounded|shadow|transform|rotate-).+/ },
    { pattern: /^(group|group-hover):.+$/ }
  ]
};