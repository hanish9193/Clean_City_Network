import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Zap, BarChart3, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <section className="text-center pt-4 space-y-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider"
        >
          <ShieldCheck size={12} />
          AI Privacy Protected
        </motion.div>
        
        <h1 className="text-3xl font-display font-extrabold leading-tight">
          Clean Your City <br />
          <span className="text-primary text-4xl">Smartly</span>
        </h1>
        
        <p className="text-sm text-muted-foreground px-4">
          Report waste instantly. Our AI anonymizes your photos and optimizes collection routes.
        </p>

        <div className="flex flex-col gap-3 px-4 pt-4">
          <Link href="/upload">
            <Button size="lg" className="w-full rounded-2xl h-14 text-lg font-bold shadow-xl shadow-primary/20">
              Report Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="w-full rounded-2xl h-14 text-lg">
              Live Map
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick Stats/Features */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-border shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
            <Zap size={20} />
          </div>
          <h3 className="font-bold text-sm">Smart Priority</h3>
          <p className="text-[10px] text-muted-foreground mt-1">Deep RL calculates urgency based on volume.</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-border shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-3">
            <BarChart3 size={20} />
          </div>
          <h3 className="font-bold text-sm">Eco Route</h3>
          <p className="text-[10px] text-muted-foreground mt-1">Eq 22 reduces fuel use by up to 30%.</p>
        </div>
      </section>

      {/* Recent Activity Mockup */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Local Activity</h2>
          <Button variant="ghost" size="sm" className="text-primary font-bold text-xs">View All</Button>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-border">
              <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                  <MapPin size={16} className="text-primary/40" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">Waste reported near Broadway</p>
                <p className="text-[10px] text-muted-foreground">Priority Level {4-i} • 2m ago</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
