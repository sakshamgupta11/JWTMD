import dotenv from "dotenv"
dotenv.config()
import express from 'express'
import cors from "cors"
import connectDB from "./config/connetDB.js"
const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL

const app = express()

// cors policy 
app.use(cors())
// connect DB
connectDB(DATABASE_URL)
// json
app.use(express.json)

app.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`)
})