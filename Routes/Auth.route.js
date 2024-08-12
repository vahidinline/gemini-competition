const express = require('express');
const router = express.Router();
const User = require('../models/user.model.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const sendpulse = require('sendpulse-api');
const { route } = require('./conversation.route.js');
sendpulse.init(
  process.env.SENDPULSE_ID,
  process.env.SENDPULSE_SECRET,
  '/tmp/',
  () => {}
);

function sendEmail(
  templateId,
  subject,
  fromName,
  fromEmail,
  toName,
  toEmail,
  resetUrl
) {
  const email = {
    html: '',
    text: '',
    subject: subject,
    from: {
      name: fromName,
      email: fromEmail,
    },
    to: [
      {
        name: toName,
        email: toEmail,
      },
    ],
    template: {
      id: templateId,
      variables: {
        resetUrl: resetUrl,
      },
    },
  };

  sendpulse.smtpSendMail((data) => {
    //console.log(data);
  }, email);
}

function sendEmailNewProduct(
  templateId,
  subject,
  fromName,
  fromEmail,
  toName,
  toEmail,
  newProduct,
  expirationDate
) {
  const email = {
    html: '',
    text: '',
    subject: subject,
    from: {
      name: fromName,
      email: fromEmail,
    },
    to: [
      {
        name: toName,
        email: toEmail,
      },
    ],
    template: {
      id: templateId,
      variables: {
        newProduct: newProduct,
        expirationDate: expirationDate,
      },
    },
  };
}

router.post('/users', async (req, res) => {
  console.log(req.body);
});

router.post('/api/register', async (req, res) => {
  const {
    email,
    password: plainTextPassword,
    pushToken,
    name,
    location,
    instagram,
  } = req.body;

  console.log(req.body);

  if (!email) {
    return res.json({ status: 'error', error: 'Invalid email' });
  }

  if (!plainTextPassword || typeof plainTextPassword !== 'string') {
    return res.json({ status: 'error', error: 'Invalid password' });
  }

  if (plainTextPassword.length < 5) {
    return res.json({
      status: 'error',
      error: 'Password too small. Should be atleast 6 characters',
    });
  }
  const password = await bcrypt.hash(plainTextPassword, 10);

  try {
    const EMaIl = email.toLowerCase();
    // const customer = await stripe.customers.create({
    //   email: email,
    // });
    // res.cookie('customer', customer.id, { maxAge: 900000, httpOnly: true });

    const user = await User.create({
      email: EMaIl,
      password,
      pushToken, // this is the push token

      name,
      location,
      instagram,
    });

    const authToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        level: user.level,
        location: user.location,
        acceptTerms: user.acceptTerms,
        pushToken: user.pushToken,
        // date: user.Date,
        ExpireDate: user.ExpireDate,
      },
      process.env.JWT_SECRET
    );

    return res.json({ status: 'ok', data: authToken });
  } catch (error) {
    if (error.code === 11000) {
      // duplicate key
      return res.send({ status: 'error', error: 'Email already in use' });
    }
    throw error;
  }

  res.json({ status: 'ok' });
});

//End Sign Up

//check user exist

router.post('/api/prelogin', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');

  let { email } = req.body;
  console.log(email);
  // If email and password are within the values object, extract them

  // Ensure email exists and normalize it
  if (!email) {
    return res.json({ status: 403, error: 'Email is required' });
  }

  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).lean();

  if (!user) {
    console.log('No user found');
    return res.json({ status: 201, error: 'new email' });
  }
  if (user.isActive !== true) {
    return res.json({ status: 403, error: 'Please verify your email' });
  }
  return res.json({ status: 200, valid: true, data: user?.name });
});

//login
router.post('/api/login', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');

  let {
    email,
    userEmail: providedUserEmail,
    password,
    values,
    userLocation,
    deviceType,
    token,
    ExpireDate,
  } = req.body;

  userEmail = email || providedUserEmail;

  // If email and password are within the values object, extract them
  if (values) {
    userEmail = values.email || userEmail;
    password = values.password || password;
  }

  // Ensure email exists and normalize it
  if (!userEmail) {
    return res.json({ status: 403, error: 'Email is required' });
  }

  const normalizedEmail = userEmail.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).lean();

  if (!user) {
    console.log('No user found');
    return res.json({ status: 403, error: 'Invalid email/password' });
  }
  if (user.isActive !== true) {
    return res.json({ status: 403, error: 'Please verify your email' });
  }

  if (await bcrypt.compare(password, user.password)) {
    const lastLogin = user.lastLogin;
    console.log(lastLogin);

    await User.updateOne(
      { _id: user._id },
      { lastLogin: new Date(), pushToken: token }
    );

    await User.updateOne(
      { _id: user._id },
      {
        $push: {
          lastLogins: {
            userLocation: userLocation,
            deviceType: deviceType,
            date: new Date(),
          },
        },
      }
    );

    const authToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        level: user.level,
        location: user.location,
        acceptTerms: user.acceptTerms,
        pushToken: user.pushToken,
        date: user.Date,
        ExpireDate: user.ExpireDate,
      },
      process.env.JWT_SECRET
    );
    return res.json({ status: 200, data: authToken });
  }

  res.json({
    status: 403,
    error: 'Password did not match',
  });
});

router.post('/api/userupdate/', async (req, res) => {
  const { id, field, value } = req.query;

  res.header('Access-Control-Allow-Origin', '*');
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    user[field] = value;
    await user.save();
    console.log(`User with id ${id} updated successfully`);
  } catch (error) {
    console.error(error);
  }
});

router.get('/api/userupdate/:id', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a new token if the user's level is 4
    if (user.level === 4) {
      const newToken = jwt.sign(
        {
          id: user._id,
          email: user.email,
          name: user.name,
          isActive: user.isActive,
          level: user.level,
          location: user.location,
          pushToken: user.pushToken,
        },
        process.env.JWT_SECRET
      );
      user.token = newToken; // Assuming you have a token field in your User schema
      await user.save();
    }

    res.json(user);
    console.log('new token generated');
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/auth/forgot_password', async (req, res) => {
  {
    const { email } = req.body;
    const user = await User.findOne({ email }).lean();

    if (!user) {
      return res.json({ status: 'error', error: 'Invalid email' });
    }
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    );
    const templateId = '67787';
    sendEmail(
      templateId,
      'Reset your password',
      'Azar',
      'info@fitlinez.com',
      user.name,
      email,
      resetUrl
    );

    res.json({ status: 'ok', data: token });
  }
});

router.get('/getUsers', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  const users = await User.find();
  res.json(users);
});

//get user by id
router.get('/api/getuser/:id', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  const user = await User.find({ _id: req.params.id }).then((user) => {
    res.json(user);
    //console.log(user);
  });
});

router.put('/api/updateTermsUser/:id', async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  //update user accept terms
  const user = await User.findByIdAndUpdate(
    id,
    //create or update user accept terms by true
    { acceptTerms: req.body.acceptTerms },
    { new: true }
  );
  if (!user) {
    return res.status(404).send(`User with id ${id} not found`);
  }
  console.log('User updated:', user);
  res.status(200).send(user);
});

//temp users update for shape up

router.put('/api/product/:id', async (req, res) => {
  const { id } = req.params;
  console.log(req.body, id);

  res.header('Access-Control-Allow-Origin', '*');

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { userProduct: req.body },
      { new: true }
    );
    if (!user) {
      return res.status(404).send(`User with id ${id} not found`);
    }
    const email = user.email;

    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

// update user level from panel
router.put('/api/userLevel/:id', async (req, res) => {
  const { id } = req.params;
  const { level } = req.body;
  console.log(id, level);
  res.header('Access-Control-Allow-Origin', '*');

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { level: level },
      { new: true }
    );
    if (!user) {
      return res.status(404).send(`User with id ${id} not found`);
    }
    console.log('User Level updated to :', level);
    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});
// update user isActive from panel
router.put('/api/userActive/:id', async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  console.log(id, active);
  res.header('Access-Control-Allow-Origin', '*');

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: active },
      { new: true }
    );
    if (!user) {
      return res.status(404).send(`User with id ${id} not found`);
    }
    console.log('User Level updated to :', active);
    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

router.delete('/api/deleteUser/:id', async (req, res) => {
  const { id } = req.params;
  console.log(id);

  res.header('Access-Control-Allow-Origin', '*');

  try {
    await User.deleteOne({ _id: id });
    res.status(200).send('User deleted');
  } catch (error) {
    console.error(error);
  }
});

router.post('/api/forgot-password', async (req, res) => {
  const { email, baseUrl } = req.body;
  const mainUrl = 'https://fitlinez.com/';
  if (!email) {
    return res.json({
      status: 'error',
      message: 'ایمیل در سامانه موجود نیست.',
    });
  }

  const user = await User.findOne({ email });
  console.log(user);
  if (!user) {
    return res.json({ status: 'error', message: 'Invalid user' });
  }

  const resetToken = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );
  user.resetToken = resetToken;
  await user.save();

  const resetUrl = `${
    baseUrl ? baseUrl : mainUrl
  }reset-password?token=${resetToken}`;
  const templateId = '67787';
  sendEmail(
    templateId,
    'Reset your password',
    'Azar',
    'info@fitlinez.com',
    user.name,
    email,
    resetUrl
  );

  res.json({ status: 'ok', data: resetToken });
});

// GET /reset-password?token=<resetToken>
router.get('/reset-password', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Reset token missing');
  }

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (error) {
    return res.status(400).send('Invalid or expired reset token');
  }

  const user = await User.findById(userId);
  if (!user || user.resetToken !== token) {
    return res.status(400).send('Invalid or expired reset token');
  }

  // render password reset form
  res.render('reset-password', { token });
});

// POST /reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).send('Reset token or new password missing');
  }

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    userId = decoded.userId;
  } catch (error) {
    return res.status(400).send('Invalid or expired reset token');
  }

  const user = await User.findById(userId);
  if (!user || user.resetToken !== token) {
    return res.status(400).send('Invalid or expired reset token');
  }
  const newPassword = await bcrypt.hash(password, 10);
  user.password = newPassword;
  user.resetToken = null;
  await user.save();

  res.send('Password reset successful');
});

// Upload image endpoint
router.post('/uploadImage', async (req, res) => {
  try {
    const { id, photo } = req.body;
    // Create a new user document
    const user = await User.findByIdAndUpdate(
      id,
      { photo: photo },
      { new: true }
    );
    // Save the user to the database
    await user.save();
    // Create a token

    res.status(201).json({ message: 'Image uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/api/updateUserLevelAfterExpire/:id', async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    //update user level to 1 and isExpired to false
    const user = await User.findByIdAndUpdate(
      id,
      { level: 1, isExpired: false },
      { new: true }
    );
    if (!user) {
      return res.status(404).send(`User with id ${id} not found`);
    }
    console.log('User Level updated to :', 1);
    console.log('User isExpired updated to :', false);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

router.post('/api/addProductToUser/:id', async (req, res) => {
  const { id } = req.params;
  const { level, product } = req.body;
  console.log(id, product);
  const productString = Object.values(product).join('');

  try {
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send(`User with id ${id} not found`);
    }

    // Create a new product object and Expiredate for each product
    function createProduct(productString) {
      switch (productString) {
        case 'shapeUpShape up pro 3':
          return {
            name: productString,
            // create 3 months expiration date
            expirationDate: new Date(
              new Date().setMonth(new Date().getMonth() + 3)
            ),
          };
        case 'Shape up Academy':
          return {
            name: productString,
            // create 6 months expiration date
            expirationDate: new Date(
              new Date().setMonth(new Date().getMonth() + 24)
            ),
          };
        case 'Fitlinez app 1-month':
          return {
            name: productString,
            // create 1 month expiration date
            expirationDate: new Date(
              new Date().setMonth(new Date().getMonth() + 1)
            ),
          };
        case 'Fitlinez app 3-month':
          return {
            name: productString,
            // create 3 months expiration date
            expirationDate: new Date(
              new Date().setMonth(new Date().getMonth() + 3)
            ),
          };
        case 'Fitlinez app 12-month':
          return {
            name: productString,
            // create 12 months expiration date
            expirationDate: new Date(
              new Date().setMonth(new Date().getMonth() + 12)
            ),
          };
        default:
          return {
            name: productString,
            // create 1 month expiration date
            expirationDate: new Date(
              new Date().setMonth(new Date().getMonth() + 1)
            ),
          };
      }
    }

    const newProduct = createProduct(productString); // You can replace 'Shape up Academy' with your desired product string

    const templateId = '93017';
    sendEmail(
      templateId,
      'fitlinez - New product added to your account',
      'Fitlinez Team',
      'info@fitlinez.com',
      user.name,
      user.email,
      newProduct.name,
      newProduct.expirationDate
    );

    function sendEmail(
      templateId,
      subject,
      fromName,
      fromEmail,
      toName,
      toEmail,
      productName,
      expirationDate
    ) {
      const formattedExpirationDate = expirationDate.toLocaleDateString(
        'en-GB',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }
      );
      const email = {
        html: '',
        text: '',
        subject: subject,
        from: {
          name: fromName,
          email: fromEmail,
        },
        to: [
          {
            name: toName,
            email: toEmail,
          },
        ],
        template: {
          id: templateId,
          variables: {
            productName: productName,
            expirationDate: formattedExpirationDate,
          },
        },
      };

      sendpulse.smtpSendMail((data) => {
        console.log(data, email);
      }, email);
    }

    //add new product to ProductHistory
    const productHistory = new ProductHistory({
      productId: id,
      productName: productString,
      userId: user._id,
      action: 'add',
      data: newProduct,
    });
    await productHistory.save().then((result) => {
      console.log('Product added to the ProductHistory', result);
    });

    //update user ExpireDate
    user.ExpireDate = newProduct.expirationDate;

    // Add the new product to the user's product array
    user.userProduct.push(newProduct);

    // Optionally update the user level
    user.level = level;
    user.isExpired = false;

    // Save the changes
    await user.save();

    res.status(201).json({
      message: 'Product added successfully',
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

router.post('/api/updateUserfrompanel/:id', async (req, res) => {
  const { id } = req.params;
  const { level, product } = req.body;
  console.log(id, level, product);

  const productString = Object.values(product).join('');

  console.log(id, product, level);
  try {
    //update user level and user prodcut as an object to product array

    const user = await User.findByIdAndUpdate(
      id,
      {
        level: level,

        userProduct: {
          name: productString,
          expirationDate: '2026-06-23T14:17:42.357+00:00',
        },
      },
      { new: true }
    );
    if (!user) {
      return res.status(404).send(`User with id ${id} not found`);
    }
    console.log('User Level updated to :', level);
    console.log('User product updated to :', product);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});
router.put('/api/updateUserPaymentfrompanel/:id', async (req, res) => {
  const { id } = req.params;
  const { paymentType } = req.body;
  console.log(paymentType);

  try {
    //update user level and user prodcut as an object to product array

    const user = await User.findByIdAndUpdate(
      id,
      {
        paymentType: paymentType,
      },
      { new: true }
    );
    if (!user) {
      return res.status(404).send(`User with id ${id} not found`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

//checkNewVersion
router.get('/api/checkNewVersion', async (req, res) => {
  console.log('checkNewVersion');
  res.header('Access-Control-Allow-Origin', '*');
  const newVersion = await NewUpdateScheme.find().sort({ date: -1 }).limit(1);
  res.json(newVersion);
});

router.post('/api/newVersion', async (req, res) => {
  const { status, version } = req.body;
  console.log(req.body);
  const newVersion = new NewUpdateScheme({
    status,
    version,
  });
  await newVersion.save().then((result) => {
    res.json({
      status: 'New Version has been added to the Database',
      data: result,
    });
  });
});

module.exports = router;
