import app from "./index"
import { PORT } from "./config"

app.listen(PORT, () => {
  console.log("Listening on port: " + PORT)
})
