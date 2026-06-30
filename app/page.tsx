"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FullScreenLoader } from "@/components/ui/Loading";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const createRoom = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rooms", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create room");
      const data = await res.json();
      router.push(`/room/${data.roomId}/link`);
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Gagal membuat room. Silakan coba lagi.");
    }
  };

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      {loading && <FullScreenLoader text="Membuat Room..." />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 w-full max-w-md"
      >
        <div className="glass-panel p-8 sm:p-12 rounded-[2rem] flex flex-col items-center text-center">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-20 h-20 bg-gradient-to-tr from-pink-400 to-purple-400 rounded-3xl flex items-center justify-center shadow-lg mb-6"
          >
            <Camera className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-4xl font-bold text-gray-800 tracking-tight mb-4 flex items-center justify-center gap-2">
            Poto. <Sparkles className="w-6 h-6 text-yellow-400" />
          </h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Photobooth online dua arah. Ajak teman, pasangan, atau keluargamu berfoto bersama dari jarak jauh dalam satu frame.
          </p>

          <Button
            size="lg"
            onClick={createRoom}
            className="w-full text-lg shadow-pink-200 shadow-xl"
            disabled={loading}
          >
            Buat Room Baru
          </Button>
        </div>
        
        <p className="text-center text-sm text-gray-400 mt-8">
          Dibuat dengan ❤️
        </p>
      </motion.div>
    </main>
  );
}
