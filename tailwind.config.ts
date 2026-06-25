/**
 * AZMA OS - Phase 11: Sovereign Vault
 * File: tailwind.config.ts
 * * The Al-Mantahaa Sovereign Theme Configuration.
 * Defines the strict visual DNA of the OS platform UI.
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  // يضمن تطبيق الهوية على جميع مسارات النظام وحجراته
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mantahaa: {
          // الفحمي السيادي: للخلفيات الأساسية ليريح العين ويعطي عمقاً سينمائياً
          charcoal: '#121212',
          'charcoal-light': '#1E1E1E', 
          'charcoal-dark': '#0A0A0A',
          
          // الذهبي: للنصوص الهامة، التوقيعات، والإضاءات التوجيهية
          gold: '#D4AF37',
          'gold-light': '#F3E5AB',
          'gold-muted': '#AA8C2C',
          
          // البرونزي: للحدود، الأزرار الثانوية، وعناصر التفاعل
          bronze: '#CD7F32',
          'bronze-dark': '#8C5622',
        }
      },
      backgroundImage: {
        // التدرج الزجاجي: يُستخدم كخلفية شفافة للنوافذ
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
        // لمعان ذهبي خفيف للحدود
        'gold-glow': 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(18,18,18,0) 70%)',
      },
      boxShadow: {
        // ظلال الزجاج المكسو لإبراز العناصر الطافية
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        // توهج ذهبي حول النوافذ النشطة
        'glass-gold': '0 8px 32px 0 rgba(212, 175, 55, 0.1)',
      }
    },
  },
  plugins: [],
};

export default config;