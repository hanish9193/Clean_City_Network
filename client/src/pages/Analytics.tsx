import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from "recharts";
import { Shield, Zap, TrendingUp } from "lucide-react";

const mockPrivacyData = [
  { month: "Jan", detected: 120, redacted: 120 },
  { month: "Feb", detected: 145, redacted: 145 },
  { month: "Mar", detected: 180, redacted: 179 },
  { month: "Apr", detected: 210, redacted: 210 },
];

const mockEfficiencyData = [
  { day: "M", traditional: 45, optimized: 32 },
  { day: "T", traditional: 48, optimized: 30 },
  { day: "W", traditional: 52, optimized: 35 },
  { day: "T", traditional: 43, optimized: 28 },
  { day: "F", traditional: 55, optimized: 38 },
];

export default function Analytics() {
  return (
    <div className="space-y-6 pb-12">
      <header className="space-y-1">
        <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>
        <p className="text-xs text-muted-foreground">System performance & privacy metrics.</p>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary p-4 rounded-3xl text-primary-foreground space-y-1 shadow-lg shadow-primary/20">
          <Shield size={20} className="mb-2 opacity-80" />
          <p className="text-[10px] font-medium uppercase tracking-wider opacity-70">Privacy Rate</p>
          <p className="text-2xl font-display font-bold">99.9%</p>
        </div>
        <div className="bg-accent p-4 rounded-3xl text-accent-foreground space-y-1 shadow-lg shadow-accent/20">
          <Zap size={20} className="mb-2 opacity-80" />
          <p className="text-[10px] font-medium uppercase tracking-wider opacity-70">Efficiency</p>
          <p className="text-2xl font-display font-bold">+32%</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Privacy Chart */}
        <Card className="rounded-[32px] border-none shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Privacy Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-4 pb-6">
            <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockPrivacyData}>
                  <defs>
                    <linearGradient id="colorDetected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="redacted" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorDetected)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Efficiency Chart */}
        <Card className="rounded-[32px] border-none shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              Route Efficiency (Km)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-4 pb-6">
            <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockEfficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="day" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="traditional" fill="#e2e8f0" radius={[4, 4, 4, 4]} barSize={12} />
                  <Bar dataKey="optimized" fill="#10b981" radius={[4, 4, 4, 4]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
