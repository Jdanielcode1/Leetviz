import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/problems/_layout')({
  component: ProblemsLayout,
})

function ProblemsLayout() {
  return <Outlet />
}
