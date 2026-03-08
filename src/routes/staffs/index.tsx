import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/staffs/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/staffs/"!</div>
}
