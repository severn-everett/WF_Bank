import * as Process from "process"
import {App} from "./App"

let port = Number(Process.env.PORT)
if (Number.isNaN(port)) {
    port = 3300
}

console.log(`Starting the App in port ${port}`)

const app = new App(port)
app.start()

export default app