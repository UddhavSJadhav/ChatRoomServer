import mongoose from "mongoose";

export const connectToDB = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((res) =>
      console.log(`Connected to MongoDB : ${res.connection.host}`)
    );
};
