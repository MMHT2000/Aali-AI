const http = require("http");

async function runBenchmark() {
  const start = Date.now();
  let completed = 0;
  let errors = 0;
  const latencies = [];
  const totalRequests = 100;
  const concurrency = 10;

  let inFlight = 0;
  let sent = 0;

  return new Promise((resolve) => {
    function dispatch() {
      while (inFlight < concurrency && sent < totalRequests) {
        sent++;
        inFlight++;
        const reqStart = Date.now();
        const req = http.request({
          hostname: "localhost",
          port: 3001,
          path: "/api/v1/health",
          method: "GET"
        }, (res) => {
          res.on("data", () => {});
          res.on("end", () => {
            latencies.push(Date.now() - reqStart);
            completed++;
            inFlight--;
            if (completed + errors === totalRequests) finalize();
            else dispatch();
          });
        });
        req.on("error", () => {
          errors++;
          inFlight--;
          if (completed + errors === totalRequests) finalize();
          else dispatch();
        });
        req.end();
      }
    }

    function finalize() {
      latencies.sort((a, b) => a - b);
      const duration = (Date.now() - start) / 1000;
      const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
      const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
      const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
      const rps = (completed / duration).toFixed(1);
      console.log(JSON.stringify({ totalRequests, completed, errors, durationSec: duration, rps, p50Ms: p50, p95Ms: p95, p99Ms: p99 }));
      resolve();
    }

    dispatch();
  });
}

runBenchmark();
