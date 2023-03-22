const { google } = require('googleapis');
const readline = require('readline');
const { OAuth2Client } = require('google-auth-library');
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.compose'];
const TOKEN_PATH = 'token.json';

const fs = require('fs');

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  authorize(JSON.parse(content), checkAndSendEmails);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
     

      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function checkAndSendEmails(auth) {
    const gmail = google.gmail({version: 'v1', auth});
    
    // Get all the unread messages in the inbox
    gmail.users.messages.list({auth: auth, userId: 'me', q: 'is:unread in:inbox'}, function(err, response) {
      if (err) {
        console.error(err);
        return;
      }
  
      console.log('Response:', response);
      
      // Check each message to see if it has a prior reply
      response.messages.forEach((message) => {
        gmail.users.threads.get({auth: auth, userId: 'me', id: message.threadId}, function(err, response) {
          if (err) {
            console.error(err);
            return;
          }
          
          // If there is no reply, send a response
          if (!response.data.messages.some((msg) => msg.payload.headers.find((header) => header.name === 'From' && header.value !== 'me'))) {
            const subject = response.data.messages[0].payload.headers.find((header) => header.name === 'Subject').value;
            const threadId = response.data.id;
            const message = 'Thank you for your email. We will get back to you as soon as possible.';
            
            const raw = makeRawMessage('me', 'me', subject, message);
            
            // Send the response
            gmail.users.messages.send({
              auth: auth,
              userId: 'me',
              resource: {
                raw: raw,
                threadId: threadId
              }
            }, function(err, response) {
              if (err) {
                console.error(err);
                return;
              }
              console.log('Message sent:', response.data);
            });
          }
        });
      });
    });
  }
  
  function makeRawMessage(to, from, subject, message) {
    const str = [
      'Content-Type: text/plain; charset="UTF-8"\n',
      'MIME-Version: 1.0\n',
      `To: ${to}\n`,
      `From: ${from}\n`,
      `Subject: ${subject}\n\n`,
      message
    ].join('');
    return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  