const User = require('./models/User');

const verifyApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(403).json({ message: 'API key is missing' });
  }

  const user = await User.findOne({ apiKey });

  if (!user) {
    return res.status(403).json({ message: 'Invalid API key' });
  }

  next();
};

module.exports = verifyApiKey;
