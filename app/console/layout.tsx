import { Metadata } from 'next'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Admin Dashboard - LiteFi',
  description: 'Manage loan applications and track performance',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Toaster position="top-right" richColors />
    </>
  )
}
