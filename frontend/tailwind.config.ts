import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
  	container: {
  		center: true,
  		padding: '1rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			ilm: {
  				ink: 'var(--ilm-ink)',
  				'ink-soft': 'var(--ilm-ink-soft)',
  				paper: 'var(--ilm-paper)',
  				surface: 'var(--ilm-surface)',
  				'surface-2': 'var(--ilm-surface-2)',
  				border: 'var(--ilm-border)',
  				muted: 'var(--ilm-muted)',
  				'muted-2': 'var(--ilm-muted-2)',
  				success: 'var(--ilm-success)',
  				warning: 'var(--ilm-warning)',
  				error: 'var(--ilm-error)',
  				info: 'var(--ilm-info)',
  				'success-bg': 'var(--ilm-success-bg)',
  				'warning-bg': 'var(--ilm-warning-bg)',
  				'error-bg': 'var(--ilm-error-bg)',
  				'info-bg': 'var(--ilm-info-bg)'
  			},
  			fg: {
  				'1': 'var(--fg-1)',
  				'2': 'var(--fg-2)',
  				'3': 'var(--fg-3)',
  				inv: 'var(--fg-inv)'
  			},
  			bg: {
  				'1': 'var(--bg-1)',
  				'2': 'var(--bg-2)',
  				'3': 'var(--bg-3)',
  				inv: 'var(--bg-inv)'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-sans)'
  			],
  			sora: [
  				'var(--font-sans)'
  			]
  		},
  		fontSize: {
  			't-12': 'var(--t-12)',
  			't-14': 'var(--t-14)',
  			't-16': 'var(--t-16)',
  			't-18': 'var(--t-18)',
  			't-24': 'var(--t-24)',
  			't-32': 'var(--t-32)',
  			't-48': 'var(--t-48)',
  			't-64': 'var(--t-64)'
  		},
  		fontWeight: {
  			regular: 'var(--w-regular)',
  			medium: 'var(--w-medium)',
  			semibold: 'var(--w-semibold)',
  			bold: 'var(--w-bold)',
  			extrabold: 'var(--w-extrabold)'
  		},
  		lineHeight: {
  			tight: 'var(--lh-tight)',
  			snug: 'var(--lh-snug)',
  			normal: 'var(--lh-normal)',
  			relaxed: 'var(--lh-relaxed)'
  		},
  		letterSpacing: {
  			'ilm-tight': 'var(--tr-tight)',
  			'ilm-snug': 'var(--tr-snug)',
  			'ilm-wide': 'var(--tr-wide)'
  		},
  		spacing: {
  			'sp-1': 'var(--sp-1)',
  			'sp-2': 'var(--sp-2)',
  			'sp-3': 'var(--sp-3)',
  			'sp-4': 'var(--sp-4)',
  			'sp-5': 'var(--sp-5)',
  			'sp-6': 'var(--sp-6)',
  			'sp-8': 'var(--sp-8)',
  			'sp-10': 'var(--sp-10)',
  			'sp-12': 'var(--sp-12)',
  			'sp-16': 'var(--sp-16)',
  			'sp-20': 'var(--sp-20)',
  			control: 'var(--h-control)',
  			'control-sm': 'var(--h-control-sm)'
  		},
  		borderRadius: {
  			'ilm-sm': 'var(--r-sm)',
  			'ilm-md': 'var(--r-md)',
  			'ilm-lg': 'var(--r-lg)',
  			'ilm-xl': 'var(--r-xl)',
  			'ilm-2xl': 'var(--r-2xl)',
  			'ilm-full': 'var(--r-full)',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			'ilm-xs': 'var(--shadow-xs)',
  			'ilm-sm': 'var(--shadow-sm)',
  			'ilm-md': 'var(--shadow-md)',
  			'ilm-lg': 'var(--shadow-lg)',
  			'ilm-hover': 'var(--shadow-hover)'
  		},
  		transitionDuration: {
  			fast: 'var(--dur-fast)',
  			base: 'var(--dur-base)',
  			slow: 'var(--dur-slow)'
  		},
  		transitionTimingFunction: {
  			'ilm-out': 'var(--ease-out)',
  			'ilm-in-out': 'var(--ease-in-out)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
};

export default config;
