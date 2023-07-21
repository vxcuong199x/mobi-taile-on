const soap = require('soap');

const SoapServices = function () {
  
  this.start = function (server, service, wsdl, path) {
    console.log('Log: ', wsdl, path);
    const xml = require('fs')
      .readFileSync(wsdl, 'utf8');
    
    const soapServer = soap.listen(server, path, service, xml);
    soapServer.log = function (event, msg) {
      console.log('SOAP123: ', event, msg);
    };
    console.log("SOAP service listening..." + path);
  };
};

module.exports = SoapServices;
