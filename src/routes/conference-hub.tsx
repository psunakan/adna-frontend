import { createFileRoute } from '@tanstack/react-router'
import { ConferenceHubPage } from '../pages/ConferenceHubPage'

export const Route = createFileRoute('/conference-hub')({
  component: ConferenceHubPage,
})
