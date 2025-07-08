import { config } from './environment';

/**
 * Feature flags configuration
 * These flags can be used to enable/disable features in the app
 */
export const FEATURE_FLAGS = {
  PAYMENT_INTEGRATION: config.features.paymentIntegration,
  ADVANCED_ANALYTICS: config.features.advancedAnalytics,
  BETA_FEATURES: config.features.betaFeatures,
};

/**
 * Check if a feature is enabled
 * @param featureName - The name of the feature to check
 * @returns true if the feature is enabled, false otherwise
 */
export const isFeatureEnabled = (featureName: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[featureName] ?? false;
}; 