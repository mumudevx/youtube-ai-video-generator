import express from "express";
import mainRouter from "./routes/mainRouter.js";
import "./modules/base/consoleOverrideModule.js";
import { runAutomationWhenServerReady } from "./modules/base/serverModule.js";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use("/", mainRouter);

app.listen(port, () => {
  console.warn(`Server is running on http://localhost:${port}`);
});

runAutomationWhenServerReady();
