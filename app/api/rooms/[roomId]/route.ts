import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { pusherServer } from "@/lib/pusher";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const client = await clientPromise;
    const db = client.db("photobooth");

    const room = await db.collection("rooms").findOne({ roomId });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("Failed to fetch room", error);
    return NextResponse.json({ error: "Failed to fetch room" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await req.json();
    const { userA, userB, status } = body;

    const client = await clientPromise;
    const db = client.db("photobooth");

    const updateDoc: any = {};
    if (userA) updateDoc.userA = userA;
    if (userB) updateDoc.userB = userB;
    if (status) updateDoc.status = status;

    const result = await db.collection("rooms").findOneAndUpdate(
      { roomId },
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Trigger Pusher event
    await pusherServer.trigger(`room-${roomId}`, "room-update", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update room", error);
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
  }
}
