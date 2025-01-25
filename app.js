const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');

const indexRouter = require('./routes/index');

const app = express();

// app.use(cors({
// 	"origin": "*",
// 	"methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
// 	"preflightContinue": false,
// }))
app.use(cors());

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

	console.log(err);


	return res.status(status || 500).json({
		status: status?.toString().startsWith("4") ? "failure" : "error" ?? "error",
		message: message
			? message
			: error
				? `${error.name} - ${error.message}`
				: "",
	});
});
module.exports = app;
