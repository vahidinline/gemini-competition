const express = require('express');
const router = express.Router();
const AppSupportScheme = require('../models/appsupport.model.js');

require('dotenv').config();

router.get('/support', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type'
  );

  res.setHeader('Access-Control-Allow-Credentials', true);

  //get all tickets
  const tickets = await AppSupportScheme.find();
  res.json(tickets);
});
router.post('/support', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  // Request headers you wish to allow
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type'
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  const { userName, userID, userEmail, description, deviceName, path, topic } =
    req.body;

  //check if user has pending status and return 409

  // const checkUser = await AppSupportScheme.findOne({
  //   email: userEmail,
  //   status: 'pending',
  // });
  // if (checkUser) {
  //   return res.status(409).json({ message: 'You have a pending ticket' });
  // }

  // Generate ticket number
  const ticketCounter = await AppSupportScheme.countDocuments(); // Get the total number of existing tickets
  const timestamp = Date.now();
  const ticketNumber = `TICKET-${timestamp}-${ticketCounter + 1}`;

  //creating new user

  const newTicket = new AppSupportScheme({
    ticketNumber,
    userName,
    userId: userID,
    userEmail,
    description,
    deviceName,
    path,
    topic,
  });
  await newTicket.save().then((result) => {
    //send email to user
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: 'info@fitlinez.com',
            Name: 'FitLinez Team',
          },
          To: [
            {
              Email: userEmail,
              Name: userName,
            },
          ],
          Subject: 'Your ticket has been created',
          TextPart: 'Your ticket has been created',
          HTMLPart: `<h3>Dear ${userName}, welcome to Fitlinez</h3><br />Your ticket has been created. <br />Your ticket number is: ${ticketNumber}<br />We will get back to you as soon as possible.<br />Best regards,<br />FitApp Team`,
        },
      ],
      //send email to admin

      Messages: [
        {
          From: {
            Email: 'info@fitlinez.com',
            Name: 'FitLinez Team',
          },
          To: [
            {
              Email: 'afshari.vahid@gmail.com',
              Name: 'Vahid Afshari',
            },
          ],
          Subject: 'New ticket has been created',
          TextPart: 'New ticket has been created',
          HTMLPart: `<h3>Dear Vahid, new ticket has been created</h3><br />Ticket number is: ${ticketNumber}<br />User name is: ${userName}<br />User email is: ${userEmail}<br />User id is: ${userID}<br />Topic is: ${topic}<br />Description is: ${description}<br />Device name is: ${deviceName}<br />Path is: ${path}<br />Best regards,<br />FitApp Team`,
        },
      ],
    });
    // send response to front end
    res.status(201).json({
      message: 'Ticket created',
      ticketNumber: ticketNumber,
    });
  });
});

//edit route for admin
router.put('/support/:id', async (req, res) => {
  const { solved: status, reply } = req.body;
  const { id } = req.params;
  console.log(id, status, reply);
  const ticket = await AppSupportScheme.findById(id);
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  ticket.status = status ? 'solved' : 'under review';

  if (reply) {
    ticket.reply.push({ reply: reply });
  }

  await ticket.save();

  //send email to user with different content based on status

  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: 'info@fitlinez.com',

          Name: 'FitLinez Team - Do Not Reply',
        },
        To: [
          {
            Email: ticket.userEmail,
            Name: ticket.userName,
          },
        ],
        Subject: 'Your ticket has been updated',
        TextPart: 'Your ticket has been updated',

        HTMLPart: `<h3>Dear ${
          ticket.userName
        }, welcome to Fitlinez</h3><br />Your ticket has been updated. <br />Your ticket number is: ${
          ticket.ticketNumber
        }<br />Your ticket status is: ${ticket.status}<br />
         ${
           ticket.status === 'under review'
             ? 'We will get back to you as soon as possible.'
             : 'Your ticket has been solved. '
         }

        <br />Reply from support team:  ${reply}  
        <br />Thank you for your patience.

        <br />Best regards,<br />FitApp Team`,
      },
    ],
  });

  res.json({ message: 'Ticket updated' });
});

module.exports = router;
