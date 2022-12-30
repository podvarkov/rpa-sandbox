const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/payments",
    createProxyMiddleware({
      target: "http://localhost:5002",
      changeOrigin: true,
    })
  );
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:5002",
      changeOrigin: true,
    })
  );
};
