module.exports = {
  'portGlobal': 8002,
  'getContent': {
    // "path": "/MyService/services/vasapi",
    'path': '/services',
    'wsdl': {
      'production': 'wsdl/production/sms9029.wsdl',
      'local': 'wsdl/local/sms9029.wsdl'
    },
    'port': {
      'production': 8002,
      'local': 8002
    }
  }
}

