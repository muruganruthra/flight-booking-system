import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGO_URI is not defined. Please add MONGO_URI to the server environment variables."
      );
    }

    const connection = await mongoose.connect(mongoUri);

    console.log(
      `MongoDB Connected: ${connection.connection.host}`
    );
  } catch (error) {
    console.error(
      `MongoDB Connection Error: ${error.message}`
    );

    process.exit(1);
  }
};

export default connectDB;