"use client";

import { useEffect, useState } from "react";
import { Room } from "@/types";
import { getPusherClient } from "@/lib/pusher-client";

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchInitialState = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch room");
        }
        const data = await res.json();
        if (mounted) {
          setRoom(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchInitialState();

    const pusher = getPusherClient();
    const channel = pusher.subscribe(`room-${roomId}`);

    channel.bind("room-update", (data: Room) => {
      if (mounted) {
        setRoom(data);
      }
    });

    return () => {
      mounted = false;
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [roomId]);

  const updateRoom = async (updates: Partial<Room>) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update room");
      const data = await res.json();
      setRoom(data);
    } catch (err) {
      console.error(err);
    }
  };

  return { room, loading, error, updateRoom };
}
