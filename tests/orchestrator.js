import retry from "async-retry";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
      onRetry: (err, attempt) => {
        console.log(
          `Attempt ${attempt} - Failed to fetch status page: ${err.message}`
        );
      }
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
    }
  }
}

export default {
  waitForAllServices
};
