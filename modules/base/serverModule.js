import net from "net";
import { clearAuthFolder } from "./inputOutputModule.js";

function _isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once("error", () => {
        resolve(true);
      })
      .once("listening", () => {
        tester.close();
        resolve(false);
      })
      .listen(port);
  });
}

export async function runAutomationWhenServerReady() {
  try {
    console.log("Checking if Express server is running...");
    const port = 3000;
    const isServerRunning = await _isPortAvailable(port);

    if (isServerRunning) {
      console.log(
        `Express server detected on port ${port}, starting automation...`
      );

      await clearAuthFolder();
      (await import("./automationModule.js")).runAutomation();
      
    } else {
      console.log(`Waiting for Express server on port ${port}...`);
      // Retry after 5 seconds
      setTimeout(runAutomationWhenServerReady, 5000);
    }
  } catch (error) {
    console.error("Error checking server status:", error);
  }
}
