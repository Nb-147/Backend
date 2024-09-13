import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb+srv://Nico:49809075@cluster0.kqthm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
            { dbName: "Storage" });
        console.log(`MongoDB Connected!`)
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1);
    }
};

export default connectDB;