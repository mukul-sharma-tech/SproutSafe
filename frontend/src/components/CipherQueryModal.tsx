import { useState, useRef, useCallback } from "react";
import { X, Send, CheckCircle2, Loader2, Upload, FileText, Camera, RotateCcw } from "lucide-react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";

interface CipherQueryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    isMandatory?: boolean;
}

export const CipherQueryModal = ({ isOpen, onClose, onSuccess, isMandatory }: CipherQueryModalProps) => {
    const [step, setStep] = useState<"form" | "sending" | "success">("form");
    const [formData, setFormData] = useState({
        aadhar: "",
        phone: "",
        age: "",
        imageProof: null as File | null,
        idProof: null as File | null,
        livePhoto: null as string | null,
    });

    const webcamRef = useRef<Webcam>(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setFormData(prev => ({ ...prev, livePhoto: imageSrc }));
        }
    }, [webcamRef]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep("sending");

        // Simulate sending animation
        setTimeout(() => {
            setStep("success");
        }, 2000);
    };

    const handleClose = () => {
        setStep("form");
        setFormData({ aadhar: "", phone: "", age: "", imageProof: null, idProof: null, livePhoto: null });
        onClose();
    };

    const handleSuccess = () => {
        setStep("form");
        setFormData({ aadhar: "", phone: "", age: "", imageProof: null, idProof: null, livePhoto: null });
        if (onSuccess) onSuccess();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-xl w-full max-w-md overflow-hidden relative shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">SproutSafe Verification</h2>
                        {!isMandatory && (
                            <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        )}
                    </div>

                    {step === "form" && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Aadhar Number</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="12-digit Aadhar No"
                                    className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                                    value={formData.aadhar}
                                    onChange={(e) => setFormData({ ...formData, aadhar: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
                                <input
                                    required
                                    type="tel"
                                    placeholder="Your phone number"
                                    className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Age</label>
                                <input
                                    required
                                    type="number"
                                    placeholder="Enter age"
                                    className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-400">Image Proof</label>
                                    <label className="flex flex-col items-center justify-center w-full h-24 bg-muted border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-6 h-6 text-gray-500 mb-1" />
                                            <p className="text-[10px] text-gray-500">
                                                {formData.imageProof ? formData.imageProof.name : "Upload Image"}
                                            </p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setFormData({ ...formData, imageProof: e.target.files ? e.target.files[0] : null })} />
                                    </label>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-400">ID Proof</label>
                                    <label className="flex flex-col items-center justify-center w-full h-24 bg-muted border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FileText className="w-6 h-6 text-gray-500 mb-1" />
                                            <p className="text-[10px] text-gray-500">
                                                {formData.idProof ? formData.idProof.name : "Upload ID"}
                                            </p>
                                        </div>
                                        <input type="file" className="hidden" onChange={(e) => setFormData({ ...formData, idProof: e.target.files ? e.target.files[0] : null })} />
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-1 mt-2">
                                <label className="block text-xs font-medium text-gray-400">Live Photo Capture</label>
                                <div className="relative bg-muted border-2 border-border rounded-lg overflow-hidden group min-h-[160px] flex items-center justify-center">
                                    {!formData.livePhoto ? (
                                        <div className="relative w-full h-full min-h-[160px]">
                                            <Webcam
                                                audio={false}
                                                ref={webcamRef}
                                                screenshotFormat="image/jpeg"
                                                className="w-full h-40 object-cover"
                                                videoConstraints={{ facingMode: "user" }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                                <button
                                                    type="button"
                                                    onClick={capture}
                                                    className="bg-primary p-3 rounded-full text-white shadow-lg transform hover:scale-110 transition-transform"
                                                >
                                                    <Camera size={24} />
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={capture}
                                                className="absolute bottom-3 right-3 bg-primary/80 backdrop-blur-md p-2 rounded-lg text-white md:hidden"
                                            >
                                                <Camera size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-full min-h-[160px]">
                                            <img src={formData.livePhoto} alt="Captured" className="w-full h-40 object-cover" />
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, livePhoto: null })}
                                                    className="bg-red-500/80 hover:bg-red-500 p-2 rounded-lg text-white backdrop-blur-md transition-colors shadow-lg"
                                                    title="Retake"
                                                >
                                                    <RotateCcw size={18} />
                                                </button>
                                            </div>
                                            <div className="absolute bottom-0 inset-x-0 bg-green-500/20 py-1 text-center border-t border-green-500/30 backdrop-blur-sm">
                                                <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Image Secured</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {!formData.livePhoto && (
                                    <p className="text-[10px] text-gray-500 text-center mt-1 italic">Click camera or hover to capture live photo</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full mt-4 h-12 gap-2">
                                <Send size={18} className="flex-shrink-0" />
                                Send Query
                            </Button>
                        </form>
                    )}

                    {step === "sending" && (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                            <p className="text-lg font-medium">Verifying your identity...</p>
                            <p className="text-sm text-muted-foreground mt-2">Connecting to secure servers</p>
                        </div>
                    )}

                    {step === "success" && (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="h-12 w-12 text-green-500 animate-in zoom-in duration-500" />
                            </div>
                            <p className="text-xl font-bold mb-2">Query Sent!</p>
                            <p className="text-muted-foreground mb-8 max-w-[250px] mx-auto">Your request has been successfully submitted to SproutSafe.</p>
                            <Button onClick={handleSuccess} variant="outline">Close</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
