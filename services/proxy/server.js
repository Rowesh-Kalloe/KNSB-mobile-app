const express = require('express');
const cors = require('cors');

const TARGET = "https://knsb-example-api-cmg8eabdcwejh7ee.westeurope-01.azurewebsites.net";
const app = express();

app.use(cors());
app.use(express.json());


app.use("/proxy", async (req, res) => {
  try {
    const targetPath = req.originalUrl.replace(/^\/proxy/, "");
    const targetUrl = `${TARGET}${targetPath}`;
    console.log('Proxying request to:', targetUrl, 'Method:', req.method);
    
    const fetchOptions = {
      method: req.method,
    console.log('Proxying request to:', targetUrl);
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });
    
    };
    
    if (req.method === 'POST' && req.body) {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    const r = await fetch(targetUrl, fetchOptions);
    
    
    console.log('Proxy response status:', r.status, 'Content-Type:', r.headers.get('content-type'));
    
    res.status(response.status);
    res.set("Content-Type", response.headers.get("content-type") || "application/json");
    res.send(body);
  } catch (e) {
    console.error('Proxy error:', e);
    res.status(502).json({ 
      error: "Proxy error", 
      message: e?.message || String(e) 
    });
  }
});

app.use(express.json());

const PORT = process.env.PORT || 8088;
app.listen(PORT, () => {
  console.log(`CORS proxy running on port ${PORT}`);
});