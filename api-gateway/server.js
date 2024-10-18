const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

app.use('/airlines', createProxyMiddleware({ target: 'http://airline-company-microservice:3001', changeOrigin: true }));
app.use('/flights', createProxyMiddleware({ target: 'http://flight-microservice:3002', changeOrigin: true }));
app.use('/passengers', createProxyMiddleware({ target: 'http://passenger-microservice:3003', changeOrigin: true }));

// Start the API Gateway
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
