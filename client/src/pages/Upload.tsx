import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCreateTask, usePrivacyCheck } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, UploadCloud, ShieldCheck, MapPin, AlertTriangle, CheckCircle } from "lucide-react";
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
        
        // Trigger privacy check immediately
        const result = await privacyCheckMutation.mutateAsync(base64);
        setPrivacyResult(result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !preview) return;

    await createTaskMutation.mutateAsync({
      imageUrl: "pending_upload", // Backend handles image storage logic for MVP
      imageBase64: preview, // Sending base64 for simplicity in prototype
      lat: 40.7128 + (Math.random() - 0.5) * 0.1, // Simulated GPS
      lng: -74.0060 + (Math.random() - 0.5) * 0.1,
      location: locationName || "Unknown Location",
      reportedPriority: priority[0],
      privacyData: privacyResult,
    });
    
    // Reset form
    setFile(null);
    setPreview(null);
    setPrivacyResult(null);
    setPriority([1]);
    setLocationName("");
  };

  const isScanning = privacyCheckMutation.isPending;

  return (
    <div className="min-h-screen bg-secondary/30 py-12 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Col: Upload & Preview */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold">Report Waste</h1>
            <p className="text-muted-foreground">Upload a photo. Our AI will anonymize it automatically.</p>
          </div>

          <Card className="overflow-hidden border-2 border-dashed border-border hover:border-primary/50 transition-colors">
            <CardContent className="p-0">
              {!preview ? (
                <div 
                  className="h-96 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <UploadCloud className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-medium text-lg">Click to Upload Photo</p>
                  <p className="text-sm text-muted-foreground mt-1">JPG, PNG up to 10MB</p>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
                </div>
              ) : (
                <div className="relative h-96 bg-black group">
                  <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                  
                  {/* Privacy Scanning Overlay */}
                  <AnimatePresence>
                    {isScanning && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-10"
                      >
                        <div className="relative w-full h-1 bg-white/20 mb-8 overflow-hidden">
                          <div className="absolute top-0 left-0 h-full w-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] scan-line" />
                        </div>
                        <div className="bg-background/90 backdrop-blur px-6 py-3 rounded-full flex items-center space-x-3 shadow-xl">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          <span className="font-mono font-bold">YOLOv8 SCANNING...</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Privacy Results Overlay */}
                  {!isScanning && privacyResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-4 left-4 right-4 flex justify-between items-end"
                    >
                      <div className="bg-white/90 backdrop-blur border border-white/20 p-4 rounded-xl shadow-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          {privacyResult.detected ? (
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          <span className="font-bold">Privacy Check Complete</span>
                        </div>
                        <div className="text-xs space-y-1 text-muted-foreground">
                          <p>Faces Detected: {privacyResult.risks.filter(r => r.type === 'face').length}</p>
                          <p>Plates Detected: {privacyResult.risks.filter(r => r.type === 'plate').length}</p>
                          <p className="text-green-600 font-bold mt-1">Anonymization Applied</p>
                        </div>
                      </div>
                      
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => { setFile(null); setPreview(null); }}
                      >
                        Change Photo
                      </Button>
                    </motion.div>
                  )}
                  
                  {/* Simulated Bounding Boxes */}
                  {!isScanning && privacyResult && privacyResult.risks.map((risk, i) => (
                    <div 
                      key={i}
                      className="absolute border-2 border-red-500 bg-red-500/20"
                      style={{
                        left: `${risk.box[0]}%`,
                        top: `${risk.box[1]}%`,
                        width: `${risk.box[2]}%`,
                        height: `${risk.box[3]}%`
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Metadata Form */}
        <div className="space-y-6 flex flex-col justify-center">
          <Card className="border-none shadow-xl">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="location">Location Description</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="location" 
                    placeholder="e.g., Corner of 5th and Main, near park entrance" 
                    className="pl-10"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Severity Level</Label>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    priority[0] >= 4 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    Level {priority[0]}
                  </span>
                </div>
                <Slider 
                  value={priority} 
                  onValueChange={setPriority} 
                  max={5} 
                  min={1} 
                  step={1} 
                  className="py-4"
                />
                <p className="text-xs text-muted-foreground">
                  1 = Small litter, 5 = Hazardous/Large dump
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-accent mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Community Guideline</p>
                  False reporting may lead to account strikes. Please ensure the photo clearly shows the waste.
                </div>
              </div>

              <Button 
                onClick={handleSubmit} 
                className="w-full text-lg h-12" 
                disabled={!file || isScanning || createTaskMutation.isPending}
              >
                {createTaskMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
