export type UserStatus = "waiting" | "joined" | "ready";

export interface UserState {
  photoUrl: string | null;
  status: UserStatus;
}

export interface Room {
  _id?: string;
  roomId: string;
  userA: UserState;
  userB: UserState;
  createdAt: Date;
  status: "waiting" | "in-progress" | "completed";
}
