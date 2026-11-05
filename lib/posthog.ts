import Constants from 'expo-constants'
import PostHog from 'posthog-react-native'

const projectToken = Constants.expoConfig?.extra?.posthogProjectToken as
  | string
  | undefined
const host = Constants.expoConfig?.extra?.posthogHost as string | undefined

function createPostHogClient() {
  if (!projectToken || !host) {
    if (__DEV__) {
      const missingVariable = !projectToken
        ? 'POSTHOG_PROJECT_TOKEN'
        : 'POSTHOG_HOST'

      throw new Error(
        `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
      )
    }

    return undefined
  }

  return new PostHog(projectToken, {
    host,
    captureAppLifecycleEvents: true,
    debug: __DEV__,
    preloadFeatureFlags: true,
    logs: {
      serviceName: 'react-native-recurrly',
    },
    errorTracking: {
      autocapture: {
        uncaughtExceptions: true,
        unhandledRejections: true,
      },
    },
  })
}

export const posthog = createPostHogClient()
