import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/staffs/$staffId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/staffs/$staffId/"!</div>
}
