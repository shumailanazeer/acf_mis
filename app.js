require('dotenv').config();
const
  express = require('express'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  passportConf = require('./config/passport'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  logger = require('morgan'),
  session = require('express-session'),
  MongoStore = require('connect-mongo')(session),
  ejs = require('ejs'),
  flash = require('connect-flash'),
  expressValidator = require('express-validator'),
  engine = require('ejs-mate');

  var app = express();
app.use(express.static(__dirname+'/public'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(logger('dev'));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SECRETE_KEY,
  store: new MongoStore({url: process.env.MONGO_DB, autoReconnect: true, autoRemove: 'native'})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next)=>{
  app.locals.user = req.user;
  app.locals.messages = require('express-messages')(req, res);
  app.locals.url = req.path;
  next();
});
// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Routes

require('./routes/users')(app, passport);

mongoose.connect(process.env.MONGO_DB, (err)=>{
  if(err) throw new Error(err);
  console.log('Db Connected');
});

app.listen(process.env.PORT, (err)=>{
  if(err) throw new Error(err);
  console.log('server started on port :'+process.env.PORT);
});
