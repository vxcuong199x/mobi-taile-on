const http = require('http');

const WebServices = function () {
  this.start = function (port) {
    const server = http.createServer(function (request, response) {
      response.end("404: Not Found: " + request.url);
    });
    server.listen(port);
    console.log("Server listening.. on port " + port);
    return server;
  };
};

module.exports = WebServices;
