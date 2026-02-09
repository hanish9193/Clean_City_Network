import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Zap, BarChart3, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pt-24 pb-32">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-accent/10 text-accent border border-accent/20">
                New: AI-Powered Privacy Protection
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-display font-extrabold tracking-tight sm:text-6xl text-foreground"
            >
              Smart Waste Management for <span className="text-primary">Smarter Cities</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl"
            >
              CleanCity Network (WasteWise) uses deep learning to anonymize citizen reports and optimize collection routes in real-time.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full justify-center"
            >
              <Link href="/upload">
                <Button size="lg" className="w-full sm:w-auto text-lg h-12 px-8 shadow-lg shadow-primary/25">
                  Report Waste
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-12 px-8">
                  Collector Dashboard
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Abstract Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={ShieldCheck}
              title="Privacy First"
              description="Our multimodal AI automatically detects and redacts faces and license plates before images are stored."
            />
            <FeatureCard 
              icon={Zap}
              title="Smart Priority"
              description="Deep RL algorithms calculate collection priority based on waste volume, location, and decay factors."
            />
            <FeatureCard 
              icon={BarChart3}
              title="Route Optimization"
              description="Collectors receive optimized routes that maximize efficiency and minimize fuel consumption."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold font-display mb-4">Ready to clean up your city?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of citizens and collectors making a difference today.
          </p>
          <Link href="/upload">
            <Button size="lg" variant="secondary" className="h-12 px-8 text-lg font-bold">
              Start Reporting Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="flex flex-col items-start p-6 rounded-2xl bg-background border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 rounded-xl bg-primary/10 text-primary mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold mb-2 font-display">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
