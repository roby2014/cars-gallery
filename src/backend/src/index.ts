import express from "express"
import morgan from "morgan"
import cors from "cors"
import helmet from "helmet"
import swaggerUi from "swagger-ui-express"
import swaggerFile from "./assets/swagger_output.json"
import routes from "./routes"
import { NODE_ENV } from "./config"

const app = express()

if (NODE_ENV && NODE_ENV !== "test")
  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms")
  )

app.use(cors())
app.use(helmet())
app.use(express.json())

app.use(routes)
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile))

export default app
