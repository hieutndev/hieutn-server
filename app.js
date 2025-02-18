const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const debug = require('debug')('hieutn-server:server');
const http = require("http");
const SocketController = require("./controllers/SocketController");
const indexRouter = require('./routes/index');


const app = express();


app.use(cors({
	origin: "*",
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
}))


// app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));


app.use('/api', indexRouter);

// catch 404 and forward to error handler
app.use(function (err, req, res, next) {
	const { error, status, message } = err;


	return res.status(status || 500).json({
		status: status?.toString().startsWith("4") ? "failure" : "error" ?? "error",
		message: message
			? message
			: error
				? `${error.name} - ${error.message}`
				: "",
	});
});

const port = (process.env.NODE_ENV === "production" ? process.env.PRODUCTION_PORT : process.env.LOCAL_PORT) || 3000
app.set('port', port);

const server = http.createServer(app);

const Socket = new SocketController(server);
Socket.start();

server.listen(port);
server.on('listening', onListening);

function onListening() {
	const addr = server.address();
	const bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	debug('Listening on ' + bind);
	console.log('Server is running on port ' + addr.port);
}
