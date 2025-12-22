import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/problems')({
  component: ProblemsLayout,
})

function ProblemsLayout() {
  return <Outlet />
}
