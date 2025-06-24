import mongoose from "mongoose";


const connectDB = async () => {
    try {
        const dbInstance = await mongoose.connect(process.env.MONGO_URI || 8000, {});
        console.log(`MongoDB connected on ${dbInstance.connection.host}`);

    } catch (error) {
        console.log('err connecting db: ', error);
        process.exit(1);
    }
}


export default connectDB;
