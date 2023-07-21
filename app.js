/**
 * Created by cuongvx on 26/12/19.
 */

'use strict';

const config = require('./config/config');
const app = require('./lib/utils/express-singleton');
const connector = require('./common/connector');
const WebServices = require('./lib/libServices/webServices');

app.set('db', connector.mongo);
const webServer = new WebServices();
const server = webServer.start(config.portGlobal);

const env = process.env.NODE_ENV === 'production' ? 'production' : 'local';

console.log('--------env--', env);

const Sms9029 = require('./lib/mainServices/sms9029');
const serverContent = new Sms9029();
serverContent.startServer(server, env);

// const ViettelMoListener = require('./lib/mainServices/moListener');
// const MoSubscriber = new ViettelMoListener();
// MoSubscriber.startServer(server, env);
