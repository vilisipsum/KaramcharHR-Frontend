import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { SettingsContent } from './settings-content'

export default async function SettingsPage() {
  return (
    <DashboardLayout>
      <SettingsContent />
    </DashboardLayout>
  )
}