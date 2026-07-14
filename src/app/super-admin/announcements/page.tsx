import { getPlatformAnnouncements } from '@/lib/super-admin'
import { AnnouncementsClient } from '@/components/super-admin/AnnouncementsClient'

export default async function AnnouncementsPage() {
  const announcements = await getPlatformAnnouncements()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Announcements</h1>
        <p className="text-sm text-slate-500 mt-1">Publish platform-wide notices to all tenant users</p>
      </div>
      <AnnouncementsClient announcements={announcements} />
    </div>
  )
}
