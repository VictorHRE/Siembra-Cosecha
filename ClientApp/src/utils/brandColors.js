// Brand Colors for Siembras & Cosechas
export const BRAND_COLORS = {
  // Primary Brand Colors
  pink: '#D946A6',
  pinkLight: '#F0A5D9',
  pinkDark: '#A8297D',
  orange: '#F59E0B',
  orangeLight: '#FCD34D',
  orangeDark: '#D97706',
  green: '#10B981',
  greenLight: '#6EE7B7',
  greenDark: '#059669',
  
  // Semantic Colors
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Neutral Colors
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Gradients
  gradientPink: 'linear-gradient(135deg, #D946A6 0%, #A8297D 100%)',
  gradientOrange: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  gradientGreen: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  gradientPinkOrange: 'linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)',
  gradientOrangePink: 'linear-gradient(135deg, #F59E0B 0%, #D946A6 100%)',
};

// Chart Colors for consistency
export const CHART_COLORS = {
  bar: {
    primary: BRAND_COLORS.pink,
    borderRadius: 8,
  },
  doughnut: {
    backgroundColor: [
      BRAND_COLORS.pink,
      BRAND_COLORS.orange,
      BRAND_COLORS.green,
      BRAND_COLORS.info,
      BRAND_COLORS.pinkDark,
      BRAND_COLORS.orangeLight,
      BRAND_COLORS.greenLight,
      '#60A5FA'
    ],
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
};

// Export default for convenience
export default BRAND_COLORS;
