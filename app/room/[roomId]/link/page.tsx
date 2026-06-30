"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { Copy, Share2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export default function RoomLinkPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const router = useRouter();
  const [roomUrl, setRoomUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRoomUrl(`${window.location.origin}/room/${roomId}`);
    }
  }, [roomId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Ayo foto bareng di Poto!",
          text: "Klik link ini untuk masuk ke photobooth online kita.",
          url: roomUrl,
        });
      } catch (err) {
        console.error("Failed to share", err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel p-8 rounded-[2rem] flex flex-col items-center text-center shadow-xl"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Room Siap! 🎉</h2>
        <p className="text-gray-600 mb-8">
          Bagikan link atau QR code ini ke partner fotomu.
        </p>

        <div className="bg-white p-4 rounded-3xl shadow-sm mb-8 border border-gray-100">
          <QRCode
            value={roomUrl}
            size={200}
            className="w-full h-auto"
            fgColor="#db2777" // pink-600
          />
        </div>

        <div className="flex w-full gap-2 mb-8">
          <Button
            variant="outline"
            className="flex-1 rounded-2xl"
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4 mr-2" />
            {copied ? "Disalin!" : "Copy Link"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-2xl"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        <Button
          size="lg"
          className="w-full shadow-lg"
          onClick={() => router.push(`/room/${roomId}`)}
        >
          Masuk ke Room
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </main>
  );
}
