// Feature Flags Configuration
export const FEATURE_FLAGS = {
  PAYMENT_INTEGRATION: true,  // Can be toggled on/off
  USER_PROFILE: true,
  DARK_MODE: false,
  BETA_FEATURES: false,
};

// Helper function to check if feature is enabled
export const isFeatureEnabled = (featureName: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[featureName];
}; 