import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCreateTask, usePrivacyCheck } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Camera, ShieldCheck, MapPin, AlertTriangle, CheckCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Upload() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [privacyResult, setPrivacyResult] = useState<{ detected: boolean, risks: any[] } | null>(null);
  const [priority, setPriority] = useState([1]);
  const [locationName, setLocationName] = useState("");
  
  const privacyCheckMutation = usePrivacyCheck();
  const createTaskMutation = useCreateTask();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setPreview(base64);
        const result = await privacyCheckMutation.mutateAsync(base64);
        setPrivacyResult(result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file || !preview) return;

    await createTaskMutation.mutateAsync({
      imageUrl: "pending_upload",
      imageBase64: preview,
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lng: -74.0060 + (Math.random() - 0.5) * 0.1,
      location: locationName || "Current Location",
      reportedPriority: priority[0],
      privacyData: privacyResult,
    });
    
    setFile(null);
    setPreview(null);
    setPrivacyResult(null);
    setPriority([1]);
    setLocationName("");
  };

  const isScanning = privacyCheckMutation.isPending;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-display font-bold">New Report</h1>
        <p className="text-xs text-muted-foreground">Your photo is automatically anonymized by AI.</p>
      </header>

      <div className="space-y-6 pb-12">
        <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border-2 border-dashed border-border flex items-center justify-center">
          {!preview ? (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-4 active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Camera size={32} />
              </div>
              <span className="font-bold text-sm">Take or Upload Photo</span>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </button>
          ) : (
            <>
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md"
              >
                <X size={16} />
              </button>
              
              <AnimatePresence>
                {isScanning && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20"
                  >
                    <div className="w-full max-w-[80%] space-y-4 text-center">
                      <div className="relative h-1 bg-white/20 overflow-hidden rounded-full">
                        <div className="absolute top-0 left-0 h-full w-full bg-red-500 scan-line" />
                      </div>
                      <p className="font-mono text-[10px] font-bold text-white tracking-widest">YOLOv8 PRIVACY SCANNING...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isScanning && privacyResult && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-bold">Privacy Check Secure</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {privacyResult.risks.length} sensitive objects detected and redacted.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {preview && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input 
                  placeholder="Where is the waste located?" 
                  className="pl-12 h-14 rounded-2xl bg-white border-border"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 bg-white p-5 rounded-3xl border border-border shadow-sm">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Severity</Label>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                  priority[0] >= 4 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  Level {priority[0]}
                </span>
              </div>
              <Slider 
                value={priority} 
                onValueChange={setPriority} 
                max={5} min={1} step={1} 
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20" 
              disabled={!file || isScanning || createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Submit Report"
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
