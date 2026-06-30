const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://muhamadhaekal1140_db_user:bcb85KzMm%25UXCZ!@cluster0.5tdoziy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("photobooth");
    const result = await db.collection("rooms").insertOne({
      roomId: "test",
      userA: { photoUrl: null, status: "waiting" },
      userB: { photoUrl: null, status: "waiting" }
    });
    console.log("Insert:", result);

    const updateResult = await db.collection("rooms").findOneAndUpdate(
      { roomId: "test" },
      { $set: { "userA.status": "joined" } },
      { returnDocument: "after" }
    );
    console.log("Update:", updateResult);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
