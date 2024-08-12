const BusinessUserSchema = require('./models/BusinessUser');
const Usage = require('./models/Usage');

const countUsage = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const user = await BusinessUserSchema.findOne({ apiKey });

  if (user) {
    let usage = await Usage.findOne({ user: user._id });

    if (!usage) {
      usage = new Usage({ user: user._id });
    }

    if (usage.remainingUsage <= 0) {
      return res.status(429).json({ message: 'Usage limit exceeded' });
    }

    usage.requestsMade += 1;
    usage.remainingUsage -= 1;
    await usage.save();
  }

  next();
};

module.exports = countUsage;
