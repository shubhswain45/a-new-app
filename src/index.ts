import { initServer } from "./app"
import { cloudinaryConfig } from "./app/config/cloudinary"

async function init() {
    const app = await initServer()
    cloudinaryConfig()
    app.listen(4000, () => console.log("server started at port: " + 4000))
}

init()