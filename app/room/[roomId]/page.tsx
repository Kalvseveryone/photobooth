"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { FullScreenLoader } from "@/components/ui/Loading";
import { Camera } from "@/components/Camera";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const router = useRouter();
  const { room, loading, error, updateRoom } = useRoom(roomId);

  const [role, setRole] = useState<"userA" | "userB" | null>(null);
  const [uploading, setUploading] = useState(false);

  // Assign role on mount
  useEffect(() => {
    if (!room || role) return;

    const savedRole = sessionStorage.getItem(`photobooth_${roomId}_role`) as "userA" | "userB" | null;
    
    if (savedRole) {
      setRole(savedRole);
    } else {
      let newRole: "userA" | "userB" | null = null;
      if (room.userA.status === "waiting" && !room.userA.photoUrl) {
        newRole = "userA";
      } else if (room.userB.status === "waiting" && !room.userB.photoUrl) {
        newRole = "userB";
      }

      if (newRole) {
        setRole(newRole);
        sessionStorage.setItem(`photobooth_${roomId}_role`, newRole);
        // Inform backend that this slot is now taken
        updateRoom({
          [newRole]: { photoUrl: null, status: "joined" }
        });
      } else {
        alert("Room sudah penuh!");
        router.push("/");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, role, roomId, router]);

  // Check if both are ready to redirect
  useEffect(() => {
    if (room?.userA.status === "ready" && room?.userB.status === "ready") {
      router.push(`/room/${roomId}/result`);
    }
  }, [room, roomId, router]);

  const handleCapture = async (imageSrc: string) => {
    if (!role) return;
    setUploading(true);
    
    try {
      // Upload to Vercel Blob via API using JSON payload (Base64)
      const res = await fetch(`/api/upload?filename=${roomId}-${role}-${Date.now()}.jpg`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageSrc }),
      });
      
      if (!res.ok) throw new Error("Upload failed");
      const blob = await res.json();

      // Update room state
      await updateRoom({
        [role]: {
          photoUrl: blob.url,
          status: "ready",
        },
      });
      
    } catch (err) {
      console.error(err);
      alert("Gagal mengupload foto. Silakan coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  const renderSlot = (targetRole: "userA" | "userB", targetUser: any) => {
    const isMe = role === targetRole;

    if (targetUser?.status === "ready" && targetUser?.photoUrl) {
      return (
        <div className="relative w-full h-full rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gray-100">
          <img
            src={targetUser.photoUrl}
            alt={`${targetRole} photo`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-end p-6">
            <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-full font-medium text-sm text-pink-600">
              {isMe ? "Foto Kamu" : "Partner sudah siap!"}
            </span>
          </div>
        </div>
      );
    }

    if (isMe) {
      return (
        <div className="w-full h-full min-h-[50vh]">
          <Camera onCapture={handleCapture} />
        </div>
      );
    }

    return (
      <div className="w-full h-full rounded-3xl border-4 border-dashed border-pink-200 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center shadow-inner min-h-[50vh]">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <div className="w-8 h-8 bg-pink-300 rounded-full" />
        </div>
        <p className="text-gray-500 font-medium">
          {targetUser?.status === "joined" 
            ? "Partner sedang bersiap..." 
            : "Menunggu partner masuk..."}
        </p>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 p-6 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Terjadi Kesalahan</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => router.push("/")}>Kembali ke Beranda</Button>
      </div>
    );
  }

  if (loading || !role || !room) {
    return <FullScreenLoader text="Menyiapkan kamera..." />;
  }

  return (
    <main className="min-h-[100dvh] p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-pink-50 to-white flex flex-col">
      {uploading && <FullScreenLoader text="Mengunggah foto..." />}
      
      <div className="mb-6 flex justify-between items-center bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-pink-100">
        <h1 className="text-xl font-bold text-gray-800">Room: {roomId}</h1>
        <span className="text-sm font-medium px-3 py-1 bg-pink-100 text-pink-600 rounded-full">
          Kamu adalah {role === "userA" ? "Player 1" : "Player 2"}
        </span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col h-full"
        >
          {renderSlot("userA", room?.userA)}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col h-full"
        >
          {renderSlot("userB", room?.userB)}
        </motion.div>
      </div>
    </main>
  );
}
