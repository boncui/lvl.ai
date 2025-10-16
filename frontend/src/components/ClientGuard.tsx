'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ClientGuardProps {
  children: React.ReactNode
}

export default function ClientGuard({ children }: ClientGuardProps) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (loading) return
    if (isAuthenticated) return
    // Avoid redirecting from /login itself
    if (pathname === '/login') return

    const search = searchParams?.toString()
    const next = search ? `${pathname}?${search}` : pathname
    router.replace(`/login?next=${encodeURIComponent(next)}`)
  }, [isAuthenticated, loading, router, pathname, searchParams])

  if (loading || !isAuthenticated) {
    return <div className="text-center mt-12">Loading...</div>
  }
  return <>{children}</>
}
