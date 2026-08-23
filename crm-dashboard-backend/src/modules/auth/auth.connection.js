import mongoose from "mongoose";

let authConnection;

export const connectAuthDB = async () => {
  authConnection = mongoose.createConnection(process.env.AUTH_MONGO_URI);
  authConnection.on("connected", () => console.log("Auth DB connected successfully"));
  authConnection.on("error", (err) => console.log("Error connecting to Auth DB", err));
  await authConnection.asPromise();
  return authConnection;
};

export const getAuthConnection = () => {
  if (!authConnection) {
    throw new Error("Auth DB connection not initialized. Call connectAuthDB() first.");
  }
  return authConnection;
};
