'use client'

import { useState, useEffect } from 'react'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import {
  Input,
} from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Trash2, Plus, Search, Edit, Calendar, Clock, MapPin, Briefcase, DollarSign, Users, AlertCircle, CheckCircle, XCircle, BookOpen, Award, Laptop, Smartphone, Monitor, Keyboard, Mouse, HardDrive, Wifi, Package, Shield, Key, Eye, Lock, Unlock, Check, X, FileText, FileQuestion, RotateCcw, Sun, Moon, Calculator, Upload } from 'lucide-react'
import { LoadingState } from '@/components/ui/DataStates'
import { DepartmentsContent } from './departments-content'
import { DesignationsContent } from './designations-content'
import { LeaveTypesContent } from './leave-types-content'
import { HolidaysContent } from './holidays-content'
import { ExpenseCategoriesContent } from './expense-categories-content'
import { SalaryStructuresContent } from './salary-structures-content'
import { AppraisalCyclesContent } from './appraisal-cycles-content'
import { JobOpeningsContent } from './job-openings-content'
import { TrainingContent } from './training-content'
import { AssetsContent } from './assets-content'
import { ShiftsContent } from './shifts-content'
import { DocumentsContent } from './documents-content'
import { RolesContent } from './roles-content'

export default async function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/60 mt-1">Manage your organization settings and configuration</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 gap-1">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="hr">HR Settings</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralSettingsTab />
        </TabsContent>

        <TabsContent value="organization" className="mt-6">
          <OrganizationSettingsTab />
        </TabsContent>

        <TabsContent value="hr" className="mt-6">
          <HRSettingsTab />
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <IntegrationsSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function GeneralSettingsTab() {
  const [settings, setSettings] = useState({
    companyName: '',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'INR',
    language: 'en',
    weekStart: 'monday',
    fiscalYearStart: 'april',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const res = await fetch('/api/settings/general')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (err) {
      setError('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/settings/general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error('Failed to save')
    } catch (err) {
      setError('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <LoadingState isLoading={true} skeletonCount={3} />

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure basic organization preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}>
                <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">India Standard Time (IST)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                  <SelectItem value="Asia/Dubai">Gulf Standard Time</SelectItem>
                  <SelectItem value="Asia/Singapore">Singapore Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={settings.dateFormat} onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select value={settings.timeFormat} onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 Hour</SelectItem>
                  <SelectItem value="12h">12 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                  <SelectItem value="AED">UAE Dirham (د.إ)</SelectItem>
                  <SelectItem value="SGD">Singapore Dollar (S$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                  <SelectItem value="te">Telugu</SelectItem>
                  <SelectItem value="mr">Marathi</SelectItem>
                  <SelectItem value="bn">Bengali</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekStart">Week Starts On</Label>
              <Select value={settings.weekStart} onChange={(e) => setSettings({ ...settings, weekStart: e.target.value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiscalYearStart">Fiscal Year Starts</Label>
              <Select value={settings.fiscalYearStart} onChange={(e) => setSettings({ ...settings, fiscalYearStart: e.target.value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="january">January</SelectItem>
                  <SelectItem value="april">April (India)</SelectItem>
                  <SelectItem value="july">July</SelectItem>
                  <SelectItem value="october">October</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={loadSettings}>Reset</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure email and in-app notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationSetting 
            title="Leave Requests" 
            description="Get notified when leave requests are submitted, approved, or rejected"
            enabled={true}
          />
          <NotificationSetting 
            title="Expense Claims" 
            description="Receive notifications for expense claim submissions and approvals"
            enabled={true}
          />
          <NotificationSetting 
            title="Attendance Alerts" 
            description="Get alerts for late arrivals, early departures, and missed punches"
            enabled={false}
          />
          <NotificationSetting 
            title="Payroll Notifications" 
            description="Notify when payroll is processed, approved, or paid"
            enabled={true}
          />
          <NotificationSetting 
            title="Document Expiry" 
            description="Get reminders before employee documents expire"
            enabled={true}
          />
          <NotificationSetting 
            title="Training Reminders" 
            description="Notify about upcoming and overdue training sessions"
            enabled={false}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function NotificationSetting({ title, description, enabled }: { title: string; description: string; enabled: boolean }) {
  const [isEnabled, setIsEnabled] = useState(enabled)
  return (
    <div className="flex items-center justify-between p-4 glass rounded-lg">
      <div className="space-y-1">
        <p className="font-medium text-white">{title}</p>
        <p className="text-sm text-white/60">{description}</p>
      </div>
      <Switch
        checked={isEnabled}
        onCheckedChange={setIsEnabled}
      />
    </div>
  )
}

function OrganizationSettingsTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Manage your organization profile and branding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input id="orgName" placeholder="Enter organization name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgSlug">Slug</Label>
              <Input id="orgSlug" placeholder="org-slug" disabled />
              <p className="text-sm text-white/50">Used in your organization URL</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgEmail">Contact Email</Label>
              <Input id="orgEmail" type="email" placeholder="contact@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgPhone">Contact Phone</Label>
              <Input id="orgPhone" placeholder="+91 98765 43210" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="orgAddress">Address</Label>
            <Textarea id="orgAddress" placeholder="Enter full address" rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                <span className="text-white/40">Logo</span>
              </div>
              <Button variant="outline">Upload Logo</Button>
              <p className="text-sm text-white/50">Recommended: 200x200px, PNG or SVG</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
          <CardDescription>Manage organizational departments</CardDescription>
        </CardHeader>
        <CardContent>
          <DepartmentsContent />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Designations</CardTitle>
          <CardDescription>Manage job titles and hierarchy levels</CardDescription>
        </CardHeader>
        <CardContent>
          <DesignationsContent />
        </CardContent>
      </Card>
    </div>
  )
}

function HRSettingsTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      <Tabs defaultValue="leave" className="w-full">
        <TabsList className="grid w-full grid-cols-5 gap-1">
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="expense">Expenses</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="leave" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leave Types</CardTitle>
              <CardDescription>Configure leave types, entitlements, and policies</CardDescription>
            </CardHeader>
            <CardContent>
              <LeaveTypesContent />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leave Policies</CardTitle>
              <CardDescription>Configure carry forward, encashment, and approval rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PolicySetting 
                title="Carry Forward" 
                description="Allow unused leave to carry forward to next year"
                options={['No carry forward', 'Up to 5 days', 'Up to 10 days', 'Unlimited']}
                defaultValue="Up to 5 days"
              />
              <PolicySetting 
                title="Leave Encashment" 
                description="Allow employees to encash unused leave"
                options={['Disabled', 'On separation only', 'Annually', 'Both']}
                defaultValue="On separation only"
              />
              <PolicySetting 
                title="Advance Leave" 
                description="Allow applying for leave in advance"
                options={['Up to 30 days', 'Up to 60 days', 'Up to 90 days', 'Unlimited']}
                defaultValue="Up to 60 days"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Holidays</CardTitle>
              <CardDescription>Manage company holidays</CardDescription>
            </CardHeader>
            <CardContent>
              <HolidaysContent />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shift Management</CardTitle>
              <CardDescription>Configure work shifts and timings</CardDescription>
            </CardHeader>
            <CardContent>
              <ShiftsContent />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Rules</CardTitle>
              <CardDescription>Configure attendance policies and thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Grace Period (minutes)</Label>
                  <Input type="number" defaultValue="15" />
                </div>
                <div className="space-y-2">
                  <Label>Late Threshold (minutes)</Label>
                  <Input type="number" defaultValue="30" />
                </div>
                <div className="space-y-2">
                  <Label>Half Day Threshold (minutes)</Label>
                  <Input type="number" defaultValue="240" />
                </div>
                <div className="space-y-2">
                  <Label>Early Departure Threshold (minutes)</Label>
                  <Input type="number" defaultValue="30" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Weekly Off Days</Label>
                <div className="flex flex-wrap gap-2">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <label key={day} className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded border border-gray-600 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-amber-500" defaultChecked={day === 'Sunday'} />
                      <span className="text-sm text-white">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Salary Structures</CardTitle>
              <CardDescription>Manage salary components and structures</CardDescription>
            </CardHeader>
            <CardContent>
              <SalaryStructuresContent />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statutory Components</CardTitle>
              <CardDescription>Configure PF, ESI, PT, TDS rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <StatutoryConfig title="Provident Fund" fields={[
                  { label: 'Employee Rate (%)', defaultValue: '12' },
                  { label: 'Employer Rate (%)', defaultValue: '12' },
                  { label: 'Pension Fund (%)', defaultValue: '8.33' },
                  { label: 'Admin Charges (%)', defaultValue: '0.5' },
                  { label: 'EDLI Charges (%)', defaultValue: '0.5' },
                ]} />
                <StatutoryConfig title="ESI" fields={[
                  { label: 'Applicable', type: 'checkbox', defaultChecked: false },
                  { label: 'Employee Rate (%)', defaultValue: '0.75' },
                  { label: 'Employer Rate (%)', defaultValue: '3.25' },
                ]} />
                <StatutoryConfig title="Professional Tax" fields={[
                  { label: 'Applicable', type: 'checkbox', defaultChecked: true },
                  { label: 'Monthly Amount (₹)', defaultValue: '200' },
                  { label: 'State', defaultValue: 'Maharashtra' },
                ]} />
                <StatutoryConfig title="TDS" fields={[
                  { label: 'Default Regime', options: ['New', 'Old'], defaultValue: 'New' },
                  { label: 'Section 80C Limit (₹)', defaultValue: '150000' },
                  { label: 'Standard Deduction (₹)', defaultValue: '50000' },
                ]} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>Manage expense categories and limits</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseCategoriesContent />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Policies</CardTitle>
              <CardDescription>Configure approval limits and receipt requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PolicySetting 
                title="Auto-approval Limit" 
                description="Claims below this amount are auto-approved"
                options={['₹500', '₹1,000', '₹2,000', '₹5,000', 'No auto-approval']}
                defaultValue="₹2,000"
              />
              <PolicySetting 
                title="Receipt Required Above" 
                description="Mandatory receipt upload for claims above this amount"
                options={['₹0 (Always)', '₹500', '₹1,000', '₹2,000']}
                defaultValue="₹500"
              />
              <PolicySetting 
                title="Claim Submission Deadline" 
                description="Days after expense date to submit claim"
                options={['15 days', '30 days', '45 days', '60 days', '90 days']}
                defaultValue="30 days"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appraisal Cycles</CardTitle>
              <CardDescription>Manage performance review cycles</CardDescription>
            </CardHeader>
            <CardContent>
              <AppraisalCyclesContent />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review Configuration</CardTitle>
              <CardDescription>Configure review types and rating scales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PolicySetting 
                title="Rating Scale" 
                description="Default rating scale for reviews"
                options={['5-point', '4-point', '3-point', '10-point']}
                defaultValue="5-point"
              />
              <PolicySetting 
                title="Review Types" 
                description="Enable different review types"
                options={['Self Review', 'Manager Review', 'Peer Review', '360° Review']}
                defaultValue="Self Review, Manager Review"
                multiSelect
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PolicySetting({ 
  title, 
  description, 
  options, 
  defaultValue, 
  multiSelect = false 
}: { 
  title: string
  description: string
  options: string[]
  defaultValue: string
  multiSelect?: boolean
}) {
  const [value, setValue] = useState(defaultValue)
  
  return (
    <div className="glass p-4 rounded-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium text-white">{title}</p>
          <p className="text-sm text-white/60 mt-1">{description}</p>
        </div>
        {multiSelect ? (
          <div className="flex flex-wrap gap-2">
            {options.map(opt => (
              <label key={opt} className="inline-flex items-center gap-2 px-3 py-1 glass rounded border border-gray-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-amber-500"
                  defaultChecked={value.split(', ').includes(opt)}
                  onChange={(e) => {
                    const vals = value.split(', ').filter(Boolean)
                    if (e.target.checked) vals.push(opt)
                    else vals.splice(vals.indexOf(opt), 1)
                    setValue(vals.join(', '))
                  }}
                />
                <span className="text-sm text-white">{opt}</span>
              </label>
            ))}
          </div>
        ) : (
          <Select value={value} onChange={(e) => setValue(e.target.value)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}

function StatutoryConfig({ title, fields }: { title: string; fields: any[] }) {
  return (
    <div className="glass p-4 rounded-lg">
      <h4 className="font-medium text-white mb-4">{title}</h4>
      <div className="space-y-3">
        {fields.map((field, i) => (
          <div key={i} className="space-y-1">
            <Label className="text-sm">{field.label}</Label>
            {field.type === 'checkbox' ? (
              <Switch defaultChecked={field.defaultChecked} />
            ) : field.options ? (
              <Select defaultValue={field.defaultValue}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {field.options.map((opt: string) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input defaultValue={field.defaultValue} type={field.type === 'number' ? 'number' : 'text'} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function IntegrationsSettingsTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Email Integration</CardTitle>
          <CardDescription>Configure SMTP settings for sending emails</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input id="smtpHost" placeholder="smtp.gmail.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">Port</Label>
              <Input id="smtpPort" type="number" placeholder="587" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpUser">Username</Label>
            <Input id="smtpUser" placeholder="your-email@company.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpPass">Password</Label>
            <Input id="smtpPass" type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpFrom">From Email</Label>
            <Input id="smtpFrom" placeholder="hr@company.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpFromName">From Name</Label>
            <Input id="smtpFromName" placeholder="KaramcharHR" />
          </div>
          <Button>Test Connection</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SSO / Single Sign-On</CardTitle>
          <CardDescription>Configure SAML/OIDC providers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google Workspace</SelectItem>
                <SelectItem value="microsoft">Microsoft Entra ID (Azure AD)</SelectItem>
                <SelectItem value="okta">Okta</SelectItem>
                <SelectItem value="auth0">Auth0</SelectItem>
                <SelectItem value="custom">Custom SAML/OIDC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-white/50 text-sm">SSO configuration requires admin setup. Contact support for assistance.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
          <CardDescription>Configure webhook endpoints for real-time events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <WebhookConfig />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>Manage API keys for integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ApiKeysList />
        </CardContent>
      </Card>
    </div>
  )
}

function WebhookConfig() {
  const [webhooks, setWebhooks] = useState([
    { id: '1', url: '', events: ['leave.created', 'leave.updated'], secret: '', active: false },
  ])

  return (
    <div>
      {webhooks.map((wh, i) => (
        <div key={wh.id} className="glass p-4 rounded-lg flex items-center justify-between gap-4">
          <div className="flex-1 grid gap-2 md:grid-cols-4">
            <Input placeholder="Webhook URL" value={wh.url} onChange={(e) => { const n=[...webhooks]; n[i]={...wh, url: e.target.value}; setWebhooks(n) }} />
            <Select value={wh.events.join(',')} onChange={(e) => { const n=[...webhooks]; n[i]={...wh, events: e.target.value.split(',')}; setWebhooks(n) }} multiple>
              <SelectTrigger><SelectValue placeholder="Select events" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="leave.created">Leave Created</SelectItem>
                <SelectItem value="leave.updated">Leave Updated</SelectItem>
                <SelectItem value="expense.created">Expense Created</SelectItem>
                <SelectItem value="attendance.late">Late Attendance</SelectItem>
                <SelectItem value="payroll.processed">Payroll Processed</SelectItem>
                <SelectItem value="employee.created">Employee Created</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Secret" type="password" value={wh.secret} onChange={(e) => { const n=[...webhooks]; n[i]={...wh, secret: e.target.value}; setWebhooks(n) }} />
            <div className="flex items-center gap-2">
              <Switch checked={wh.active} onCheckedChange={(c) => { const n=[...webhooks]; n[i]={...wh, active: c}; setWebhooks(n) }} />
              <span className="text-sm text-white/70">Active</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { const n=[...webhooks]; n.splice(i,1); setWebhooks(n) }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      {webhooks.length < 10 && (
        <Button variant="outline" onClick={() => setWebhooks([...webhooks, { id: Date.now().toString(), url: '', events: [], secret: '', active: false }])} className="w-full">
          + Add Webhook
        </Button>
      )}
    </div>
  )
}

function ApiKeysList() {
  const [keys, setKeys] = useState([
    { id: '1', name: 'HR Integration', key: 'khr_••••••••••••••••', created: '2024-01-15', lastUsed: '2 hours ago', active: true },
    { id: '2', name: 'Payroll Sync', key: 'khr_••••••••••••••••', created: '2024-02-20', lastUsed: '1 day ago', active: true },
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-white">API Keys</h4>
        <Button size="sm" onClick={() => alert('Generate new API key')}>Generate Key</Button>
      </div>
      <div className="space-y-2">
        {keys.map(k => (
          <div key={k.id} className="glass p-4 rounded-lg flex items-center justify-between gap-4">
            <div className="flex-1 grid gap-2 md:grid-cols-5">
              <div>
                <p className="text-xs text-white/50">Name</p>
                <p className="font-medium text-white">{k.name}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Key</p>
                <code className="text-sm text-white/70 font-mono">{k.key}</code>
              </div>
              <div>
                <p className="text-xs text-white/50">Created</p>
                <p className="text-sm text-white/70">{k.created}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Last Used</p>
                <p className="text-sm text-white/70">{k.lastUsed}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={k.active} onCheckedChange={(c) => { const n=[...keys]; const i=n.findIndex(x=>x.id===k.id); n[i]={...k, active: c}; setKeys(n) }} />
                <span className="text-sm text-white/70">Active</span>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
