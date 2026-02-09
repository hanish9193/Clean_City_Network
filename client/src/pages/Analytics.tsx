import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area } from "recharts";

const mockPrivacyData = [
  { month: "Jan", detected: 120, redacted: 120 },
  { month: "Feb", detected: 145, redacted: 145 },
  { month: "Mar", detected: 180, redacted: 179 },
  { month: "Apr", detected: 210, redacted: 210 },
];

const mockEfficiencyData = [
  { day: "Mon", traditional: 45, optimized: 32 },
  { day: "Tue", traditional: 48, optimized: 30 },
  { day: "Wed", traditional: 52, optimized: 35 },
  { day: "Thu", traditional: 43, optimized: 28 },
  { day: "Fri", traditional: 55, optimized: 38 },
];

export default function Analytics() {
  return (
    <div className="container py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-bold">System Analytics</h1>
        <p className="text-muted-foreground">Real-time performance metrics of the WasteWise network.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Privacy Chart */}
        <Card className="shadow-lg border-border/50">
          <CardHeader>
            <CardTitle>Privacy Protection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockPrivacyData}>
                  <defs>
                    <linearGradient id="colorDetected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="redacted" stroke="#10b981" fillOpacity={1} fill="url(#colorDetected)" name="Anonymized Faces/Plates" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              99.8% Success Rate in Automated Redaction
            </div>
          </CardContent>
        </Card>

        {/* Efficiency Chart */}
        <Card className="shadow-lg border-border/50">
          <CardHeader>
            <CardTitle>Route Efficiency (Km Traveled)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockEfficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="traditional" fill="#94a3b8" name="Traditional Routing" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="optimized" fill="#10b981" name="AI Optimized (Eq 22)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Average 32% reduction in fuel consumption per route
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
