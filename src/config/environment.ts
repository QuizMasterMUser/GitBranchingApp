export type Environment = 'development' | 'staging' | 'production';

interface EnvironmentConfig {
  name: Environment;
  apiUrl: string;
  webUrl: string;
  features: {
    paymentIntegration: boolean;
    advancedAnalytics: boolean;
    betaFeatures: boolean;
  };
}

const environments: Record<Environment, EnvironmentConfig> = {
  development: {
    name: 'development',
    apiUrl: 'http://localhost:3000',
    webUrl: 'http://localhost:8080',
    features: {
      paymentIntegration: true,
      advancedAnalytics: true,
      betaFeatures: true,
    },
  },
  staging: {
    name: 'staging',
    apiUrl: 'https://staging-api.gitbranchingapp.com',
    webUrl: 'https://staging.gitbranchingapp.com',
    features: {
      paymentIntegration: true,
      advancedAnalytics: true,
      betaFeatures: true,
    },
  },
  production: {
    name: 'production',
    apiUrl: 'https://api.gitbranchingapp.com',
    webUrl: 'https://gitbranchingapp.com',
    features: {
      paymentIntegration: true,
      advancedAnalytics: false,
      betaFeatures: false,
    },
  },
};

// Default to development, can be overridden by environment variable
const currentEnvironment: Environment = (process.env.REACT_APP_ENV as Environment) || 'development';

export const config = environments[currentEnvironment];

export const getEnvironment = (): Environment => currentEnvironment;

export const isProduction = (): boolean => currentEnvironment === 'production';

export const isStaging = (): boolean => currentEnvironment === 'staging';

export const isDevelopment = (): boolean => currentEnvironment === 'development'; 