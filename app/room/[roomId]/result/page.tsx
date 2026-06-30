"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { FullScreenLoader } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { Download, Share2, Heart, RefreshCcw } from "lucide-react";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";

const THEMES = [
  { id: "classic", name: "Classic White", bg: "bg-white", border: "border-gray-200" },
  { id: "pink", name: "Soft Pink", bg: "bg-pink-100", border: "border-pink-300" },
  { id: "polaroid", name: "Vintage Polaroid", bg: "bg-[#f4f0e6]", border: "border-[#e0d9c8]" },
  { id: "film", name: "Film Strip", bg: "bg-black text-white", border: "border-gray-800" },
];

export default function ResultPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const router = useRouter();
  const { room, loading } = useRoom(roomId);
  const stripRef = useRef<HTMLDivElement>(null);
  
  const [theme, setTheme] = useState(THEMES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    }));
  }, []);

  const downloadImage = async (format: "png" | "jpeg") => {
    if (!stripRef.current) return;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(stripRef.current, {
        scale: 3, // High quality
        useCORS: true,
        backgroundColor: null,
      });

      const dataUrl = canvas.toDataURL(`image/${format}`, 1.0);
      const link = document.createElement("a");
      link.download = `poto-${roomId}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Gagal men-download gambar.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!stripRef.current) return;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(stripRef.current, {
        scale: 2,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Failed to create blob");
        const file = new File([blob], `poto-${roomId}.png`, { type: "image/png" });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Photostrip Kami!",
            text: "Lihat hasil foto kami dari Poto.",
            files: [file],
          });
        } else {
          alert("Browser Anda tidak mendukung fitur share file.");
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading || !room) {
    return <FullScreenLoader text="Memuat hasil foto..." />;
  }

  if (room.userA.status !== "ready" || room.userB.status !== "ready") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Foto belum lengkap!</h2>
        <Button onClick={() => router.push(`/room/${roomId}`)}>Kembali ke Room</Button>
      </div>
    );
  }

  return (
    <main className="min-h-[100dvh] flex flex-col lg:flex-row bg-gray-50">
      {isGenerating && <FullScreenLoader text="Memproses gambar resolusi tinggi..." />}

      {/* Left: Preview */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-100 overflow-y-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative drop-shadow-2xl transition-all duration-300"
        >
          {/* Photostrip Container */}
          <div
            ref={stripRef}
            className={`w-[300px] p-6 flex flex-col items-center gap-4 border ${theme.bg} ${theme.border} transition-colors duration-300 relative`}
          >
            {/* Photos */}
            <div className="w-full aspect-[3/4] bg-gray-200 overflow-hidden relative shadow-inner">
              {/* Using native img with crossOrigin for html2canvas */}
              <img src={room.userA.photoUrl!} alt="User A" crossOrigin="anonymous" className="w-full h-full object-cover" />
            </div>
            <div className="w-full aspect-[3/4] bg-gray-200 overflow-hidden relative shadow-inner">
              <img src={room.userB.photoUrl!} alt="User B" crossOrigin="anonymous" className="w-full h-full object-cover" />
            </div>

            {/* Footer / Branding */}
            <div className="mt-4 flex flex-col items-center justify-center gap-1">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-widest text-lg">POTO</span>
                <Heart className={`w-4 h-4 ${theme.id === 'film' ? 'text-white' : 'text-pink-500'} fill-current`} />
              </div>
              <span className={`text-xs opacity-60 font-mono ${theme.id === 'film' ? 'text-gray-400' : 'text-gray-500'}`}>
                {dateStr}
              </span>
            </div>

            {/* Film strip holes if theme is film */}
            {theme.id === "film" && (
              <>
                <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-evenly">
                  {[...Array(10)].map((_, i) => (
                    <div key={`l-${i}`} className="w-2 h-4 bg-gray-100 rounded-sm" />
                  ))}
                </div>
                <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-evenly">
                  {[...Array(10)].map((_, i) => (
                    <div key={`r-${i}`} className="w-2 h-4 bg-gray-100 rounded-sm" />
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Right: Controls */}
      <div className="w-full lg:w-96 bg-white border-l border-gray-200 p-6 flex flex-col h-full z-10 shadow-xl">
        <h2 className="text-2xl font-bold mb-6">Sesuaikan Photostrip</h2>
        
        <div className="mb-8">
          <label className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 block">
            Pilih Tema
          </label>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t)}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  theme.id === t.id
                    ? "border-pink-500 bg-pink-50 text-pink-700"
                    : "border-gray-200 hover:border-pink-300 text-gray-600"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <Button
            size="lg"
            className="w-full shadow-md rounded-2xl"
            onClick={() => downloadImage("png")}
          >
            <Download className="w-5 h-5 mr-2" />
            Download (High Quality)
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="w-full rounded-2xl"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5 mr-2" />
            Bagikan ke Teman
          </Button>

          <Button
            variant="ghost"
            className="w-full rounded-2xl mt-4"
            onClick={() => {
              if (confirm("Mulai ulang sesi ini? Foto sebelumnya tidak akan dihapus dari server tapi status akan direset.")) {
                router.push(`/`);
              }
            }}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Buat Room Baru
          </Button>
        </div>
      </div>
    </main>
  );
}
