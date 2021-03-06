let express = require('express');
let path = require('path');
const DancersController = require('./controllers/DancersController');
const DancerController = require('./controllers/DancerController');
const AccountController = require('./controllers/AccountController');
const EventsController = require('./controllers/EventsController');
let dancers = require('./handlers/dancers');
let wsdc = require('./handlers/wsdc');
let DB = require('./handlers/db');
let fDB = require('./handlers/fireDB');

let dancerDef = require('./definitions/Dancer');
let accountDef = require('./definitions/Account');
let memcache = require('./middlewares/memcache');
const handleCookies = require('./middlewares/cookies').handleCookies;
let bodyParser = require('body-parser');
let graph = require('fb-react-sdk');
let CircularJSON = require('circular-json');
const cookieParser = require('cookie-parser');
const LoggerService = require('./handlers/logger');
const environment = process.env.NODE_ENV.trim();
let logger = new LoggerService();
let app = express();
let wsdcAPI = wsdc();
let dancersAPI = dancers();
let fireDB = fDB();
var publicDir = path.resolve(__dirname, '../../public');
const port = 8888;
app.use(cookieParser());
app.use(handleCookies);
app.use(express.static(publicDir));

app.use(bodyParser.json());
// TODO: Add caching, include cache-control

app.use('/api/dancers', memcache(3600), DancersController);

app.use('/api/dancer', memcache(3600), DancerController);

app.use('/api/account', AccountController);
app.use('/api/events', EventsController);

app.get('*', function(req, res) {
	res.sendFile(publicDir + '/index.html');
});

app.listen(port, function() {
	console.log('listening to this joint on port ' + port);
});
