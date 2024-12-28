import app from "./app.js";
import {v2 as cloudinary} from "cloudinary"

const PORT = process.env.PORT || 5400;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Hello, World! How You Doing Anish ');
})