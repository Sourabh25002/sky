import express from "express";
import dotenv from "dotenv";


dotenv.config();
const app = express();

// Default route
app.get("/", (req, res) => {
    res.send("Hello, sky");
});

// PORT setup and server setup
const PORT = process.env.PORT;
if (!PORT) {
    console.error("Error: PORT environment variable is not defined.");
    process.exit(1); 
}
app.listen(PORT, () => {
    console.log(`Server is running on PORT:${PORT}`);
});