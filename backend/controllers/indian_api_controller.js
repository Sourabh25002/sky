import https from "https";

export const fetch52WeekHighLowData = (req, res) => {
  const options = {
    method: "GET",
    hostname: "stock.indianapi.in",
    path: "/fetch_52_week_high_low_data",
  };

  const apiReq = https.request(options, (apiRes) => {
    const chunks = [];

    apiRes.on("data", (chunk) => {
      chunks.push(chunk);
    });

    apiRes.on("end", () => {
      const body = Buffer.concat(chunks).toString();
      res.send(body);
    });
  });

  apiReq.on("error", (error) => {
    res.status(500).send({ error: error.message });
  });

  apiReq.end();
};
