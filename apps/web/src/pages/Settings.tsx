import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Bell, 
  Shield, 
  Database, 
  Clock,
  Smartphone,
  Mail,
  Lock
} from "lucide-react";

export default function Settings() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences.</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="sync" className="gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data Sync</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal and professional details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/20">
                    DS
                  </div>
                  <div className="space-y-1">
                    <Button variant="outline" size="sm" data-testid="button-change-photo">Change Photo</Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="Dr. Sarah" data-testid="input-first-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Smith" data-testid="input-last-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="cardiology@verihealth.com" data-testid="input-email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" data-testid="input-phone" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Medical Specialty</Label>
                    <Select defaultValue="cardiology">
                      <SelectTrigger id="specialty" data-testid="select-specialty">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="endocrinology">Endocrinology</SelectItem>
                        <SelectItem value="nephrology">Nephrology</SelectItem>
                        <SelectItem value="pulmonology">Pulmonology</SelectItem>
                        <SelectItem value="general">General Practice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license">Medical License #</Label>
                    <Input id="license" defaultValue="MD-CA-123456" data-testid="input-license" />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" data-testid="button-cancel-profile">Cancel</Button>
                  <Button className="bg-primary hover:bg-primary/90" data-testid="button-save-profile">Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Alert Preferences</CardTitle>
                <CardDescription>Configure how you receive clinical alerts and notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="high-risk-alerts" className="font-medium">High Risk Alerts</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Immediate notifications for patients with risk score ≥75
                      </p>
                    </div>
                    <Switch id="high-risk-alerts" defaultChecked data-testid="switch-high-risk" />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="email-alerts" className="font-medium">Email Notifications</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Daily summary of patient status changes
                      </p>
                    </div>
                    <Switch id="email-alerts" defaultChecked data-testid="switch-email" />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="sms-alerts" className="font-medium">SMS/WhatsApp Alerts</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Critical alerts sent via MessageBird
                      </p>
                    </div>
                    <Switch id="sms-alerts" data-testid="switch-sms" />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="vitals-threshold" className="font-medium">Vital Threshold Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when vitals exceed normal ranges
                      </p>
                    </div>
                    <Switch id="vitals-threshold" defaultChecked data-testid="switch-vitals" />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sync-notifications" className="font-medium">Sync Status Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Alerts when patient devices fail to sync data
                      </p>
                    </div>
                    <Switch id="sync-notifications" data-testid="switch-sync-status" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="quiet-hours">Quiet Hours</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quiet-start" className="text-xs text-muted-foreground">Start Time</Label>
                      <Input id="quiet-start" type="time" defaultValue="22:00" data-testid="input-quiet-start" />
                    </div>
                    <div>
                      <Label htmlFor="quiet-end" className="text-xs text-muted-foreground">End Time</Label>
                      <Input id="quiet-end" type="time" defaultValue="07:00" data-testid="input-quiet-end" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Non-critical alerts will be muted during these hours
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" data-testid="button-cancel-notifications">Cancel</Button>
                  <Button className="bg-primary hover:bg-primary/90" data-testid="button-save-notifications">Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6 mt-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Security & Privacy</CardTitle>
                <CardDescription>Manage your account security and data privacy settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                      <Lock className="h-4 w-4" />
                      Change Password
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" data-testid="input-current-password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" data-testid="input-new-password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" data-testid="input-confirm-password" />
                      </div>
                      <Button variant="outline" size="sm" data-testid="button-update-password">Update Password</Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="two-factor" className="font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch id="two-factor" data-testid="switch-2fa" />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="session-timeout" className="font-medium">Auto Sign Out</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically sign out after period of inactivity
                      </p>
                    </div>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-[180px]" data-testid="select-timeout">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">HIPAA Compliance</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      All patient data is encrypted at rest and in transit. Access logs are maintained for audit purposes.
                    </p>
                    <Button variant="outline" size="sm" data-testid="button-audit-log">View Audit Log</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Sync Settings */}
          <TabsContent value="sync" className="space-y-6 mt-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Data Synchronization</CardTitle>
                <CardDescription>Configure how patient data syncs from mobile devices.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="real-time-sync" className="font-medium">Real-time Sync</Label>
                      <p className="text-sm text-muted-foreground">
                        Update dashboard immediately when new data arrives
                      </p>
                    </div>
                    <Switch id="real-time-sync" defaultChecked data-testid="switch-realtime" />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="sync-frequency">Sync Frequency</Label>
                    <Select defaultValue="30">
                      <SelectTrigger id="sync-frequency" data-testid="select-sync-frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">Every 15 seconds</SelectItem>
                        <SelectItem value="30">Every 30 seconds</SelectItem>
                        <SelectItem value="60">Every minute</SelectItem>
                        <SelectItem value="300">Every 5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      How often to check for new patient data from HealthKit/Health Connect
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="offline-mode" className="font-medium">Offline Queue</Label>
                      <p className="text-sm text-muted-foreground">
                        Store data locally when connection is unavailable
                      </p>
                    </div>
                    <Switch id="offline-mode" defaultChecked data-testid="switch-offline" />
                  </div>

                  <Separator />

                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-600" />
                      Supabase Connection Status
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium text-green-600 flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Connected
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Sync:</span>
                        <span className="font-medium">2 minutes ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Records Synced Today:</span>
                        <span className="font-medium">1,247</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" data-testid="button-cancel-sync">Cancel</Button>
                  <Button className="bg-primary hover:bg-primary/90" data-testid="button-save-sync">Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences" className="space-y-6 mt-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>Customize how the dashboard appears to you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select defaultValue="light">
                      <SelectTrigger id="theme" data-testid="select-theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light Mode</SelectItem>
                        <SelectItem value="dark">Dark Mode</SelectItem>
                        <SelectItem value="system">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="america-los-angeles">
                      <SelectTrigger id="timezone" data-testid="select-timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="america-new-york">Eastern Time (ET)</SelectItem>
                        <SelectItem value="america-chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="america-denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="america-los-angeles">Pacific Time (PT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select defaultValue="mm-dd-yyyy">
                      <SelectTrigger id="date-format" data-testid="select-date-format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="units">Measurement Units</Label>
                    <Select defaultValue="imperial">
                      <SelectTrigger id="units" data-testid="select-units">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="imperial">Imperial (lb, ft, °F)</SelectItem>
                        <SelectItem value="metric">Metric (kg, m, °C)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-mode" className="font-medium">Compact View</Label>
                      <p className="text-sm text-muted-foreground">
                        Display more information in less space
                      </p>
                    </div>
                    <Switch id="compact-mode" data-testid="switch-compact" />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" data-testid="button-cancel-preferences">Cancel</Button>
                  <Button className="bg-primary hover:bg-primary/90" data-testid="button-save-preferences">Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
