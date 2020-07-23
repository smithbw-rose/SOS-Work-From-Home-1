const axios = require('axios');
const debug = require('debug')('slash-command-template:ticket');
const qs = require('querystring');
const users = require('./users');

/*
 *  Send break room creation confirmation via
 *  chat.postMessage to the user who created it
 */
const sendConfirmation = (ticket) => {
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: ticket.userId,
    as_user: true,
    text: 'Break room created! Link: temp.org/',
    blocks: JSON.stringify([
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Break room created! Link: http://temp.org/'
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Title*\n${ticket.title}\n\n*Type*\nCodenames`
        }
      },
    ]),
  })).then((result) => {
    debug('sendConfirmation: %o', result.data);
  }).catch((err) => {
    debug('sendConfirmation error: %o', err);
    console.error(err);
  });
};

// Create helpdesk ticket. Call users.find to get the user's email address
// from their user ID
const create = (userId, view) => {
  let values = view.state.values
  const ticket = {};

  const fetchUserEmail = new Promise((resolve, reject) => {
    users.find(userId).then((result) => {
      debug(`Find user: ${userId}`);
      resolve(result.data.user.profile.email);
    }).catch((err) => { reject(err); });
  });

  fetchUserEmail.then((result) => {
    ticket.userId = userId;
    ticket.userEmail = result;
    ticket.title = values.title_block.title.value;
    ticket.description = values.description_block.description.value;
    ticket.urgency = values.urgency_block.urgency.selected_option.text.text;
    sendConfirmation(ticket);

    return ticket;
  }).catch((err) => { console.error(err); });
};

module.exports = { create, sendConfirmation };
