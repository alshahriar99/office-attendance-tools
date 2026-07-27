"use client";

import { toast } from "sonner";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { uploadProfileImageAction } from "@/lib/actions/profile";

export function ProfileImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB.");
      return;
    }

    setIsUploading(true);
    
    // Read file as base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64String = event.target?.result as string;
      
      const res = await uploadProfileImageAction(base64String);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Profile photo updated successfully!");
      }
      setIsUploading(false);
    };
    
    reader.onerror = () => {
      toast.error("Failed to read file.");
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <>
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        {isUploading ? "Uploading..." : "Upload New Photo"}
      </Button>
    </>
  );
}
