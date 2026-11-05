import { posthog } from '@/lib/posthog'

export const posthogLog = {
  accountCreated: () => posthog?.logger.info('account_created'),
  userSignedIn: () => posthog?.logger.info('user_signed_in'),
  subscriptionDetailsOpened: (subscriptionId: string) =>
    posthog?.logger.info('subscription_details_opened', { subscription_id: subscriptionId }),
  userSignedOut: () => posthog?.logger.info('user_signed_out'),
}
