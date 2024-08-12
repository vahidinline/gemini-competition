const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieSession = require('cookie-session');
const app = express();

var Bugsnag = require('@bugsnag/js');

// Body parser middleware
app.use(bodyParser.json());

var middleware = Bugsnag.getPlugin('express');
const Reminder = require('./Routes/ReminderRoute.js');
const Push = require('./Routes/push.js');
const SinglePush = require('./Routes/singlePush.js');
const Gemini = require('./Routes/Gemini.route.js');
const GeminifoodData = require('./Routes/vertex.js');
const NutritionExtractor = require('./Routes/nutritionExtractor.route.js');
const CustomLLM = require('./Routes/customModel.route.js');
const MealSelection = require('./Routes/Meal.route.js');
const transcribe = require('./Routes/Voice.route.js');
const DailyCalories = require('./Routes/DailyCalories.route.js');
const dailyCaloriesDetails = require('./Routes/dailyCaloriesDetails.route.js');
const FoodData = require('./Routes/foodData.route.js');
const Patient = require('./Routes/Patient.route.js');
var cron = require('node-cron');

require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(
  cors({
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
  })
);

app.use(express.json());
app.use(
  cookieSession({
    name: 'fitlinez-session',
    secret: 'COOKIE_SECRET',
    httpOnly: true,
  })
);

//console.log(process.env);
const db = require('./models/index.js');
const { GenerativeModel } = require('@google-cloud/vertexai');

// db.mongoose
//   .connect(
//     `mongodb+srv://vahid_:${process.env.PASS}@cluster0.minxf.mongodb.net/${process.env.DB}`,
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     }
//   )
//   .then(() => {
//     console.log('Successfully connect to MongoDB.');
//   })
//   .catch((err) => {
//     console.error('Connection error', err);
//     process.exit();
//   });

app.get('/', (req, res) => {
  res.json({ message: 'Post Recovery AI BackEnd' });
});

app.use('/reminder', Reminder);
app.use('/push', Push);
app.use('/singlepush', SinglePush);

app.use('/gemini', Gemini);
app.use('/query', GeminifoodData);
app.use('/nutritionextractor', NutritionExtractor);
app.use('/patient', Patient);
app.use('/vertex', CustomLLM);
app.use('/mealselection', MealSelection);
app.use('/transcribe', transcribe);
app.use('/calories', DailyCalories);
app.use('/dailyCaloriesDetails', dailyCaloriesDetails);
app.use('/foodData', FoodData);

const PORT = process.env.PORT || 8091;
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
