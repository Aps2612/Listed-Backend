<h2><b>Gmail Autoresponder for Listed</b></h2>
This project is a Node.js script that automates the process of sending a response email to any new email received in your Gmail inbox that hasn't been replied to yet. The script uses the Gmail API to fetch all the messages in your inbox, filter only the unread ones, and then checks each unread message to see if it has a prior reply. If there is no prior reply, the script sends a response email to the sender thanking them for their email and letting them know that their email has been received.

<h2><b>Installation</b></h2>
Clone this repository to your local machine.
Navigate to the project directory in your terminal.
Install the required dependencies by running the command npm install.

<h2><b>Configuration</b></h2>

Before you can use the script, you need to configure it with your Gmail API credentials. Follow these steps to set up your credentials:

Go to the Google Developers Console.
Create a new project and give it a name.
Click on "Enable APIs and Services" and search for "Gmail".
Enable the Gmail API for your project.
Click on "Create Credentials" and select "OAuth client ID".
Select "Desktop App" as the application type and give your client ID a name.
Download your client ID and client secret as a JSON file and save it in the project directory as credentials.json.
In the index.js file, update the TOKEN_PATH variable with the path to where you want to store your OAuth2 token.
Usage
To use the script, simply run the command node index.js in your terminal. The script will prompt you to authorize the app and then automatically check and respond to any new emails in your inbox that haven't been replied to yet.

<h2><b>Contributing</b></h2>
Contributions to this project are welcome. If you find any bugs or issues, please open an issue or submit a pull request.
