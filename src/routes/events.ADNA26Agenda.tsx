import { createFileRoute } from '@tanstack/react-router'
import { EventsPage } from '../pages/EventsPage'

export const Route = createFileRoute('/events/ADNA26Agenda')({
  component: EventsPage,
})
