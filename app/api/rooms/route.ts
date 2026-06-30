import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Room } from "@/types";

function generateRoomId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("photobooth");
    
    const roomId = generateRoomId();
    
    const newRoom: Room = {
      roomId,
      userA: { photoUrl: null, status: "waiting" },
      userB: { photoUrl: null, status: "waiting" },
      createdAt: new Date(),
      status: "waiting"
    };

    await db.collection("rooms").insertOne(newRoom);

    // Optional: create TTL index on createdAt if it doesn't exist
    // await db.collection("rooms").createIndex({ "createdAt": 1 }, { expireAfterSeconds: 86400 });

    return NextResponse.json({ roomId }, { status: 201 });
  } catch (error) {
    console.error("Failed to create room", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
