# botbuilder-unit
## Glossary
- **script** - an array of messages describing flow of conversation with a bot;

This Library allows to apply unit testing to Microsoft Bot Framework Chatbots. 
The Library simulates conversation between bot and the end user. 

As input the Library requires a bot and a script

# Script 

The Script is just an array with simple objects (at this version) where every item represents a message in conversation between user and the bot. The Library supposes that first message **always be** from user.

If the message is from the user, than message object should look like this:

```javascript
{
    "user" : "Hey there!"
}
```

In case, if the message is from the bot, than:
 
```javascript
{
    "bot" : "Hello world!"
}
```
 
## Example of the Script

```javascript
[
    {
        "user" : "Hi"
    },
    {
        "bot" : "Welcome back!"
    },
    {
        "bot" : "Hey, now early morning"
    }
    {
        "bot" : "Should I prepare a double of coffee for you?"
    }
]
```

Unfortunately, development just started and documentation is not ready. So, 
please study tests specifications. 

  

# Quick Start

## Install library

`npm install --save-dev botbuilder-unit`
## Install jasmine libraries
`npm install --save-dev jasmine`
`npm install --save-dev jasmine-terminal-reporter`

## Create Test Specification

File **"spec/botSpec.js"**:
```javascript
const unit = require('botbuilder-unit');
const builder = require('botbuilder');

describe('Simple test for a bot', () => {
  let bot = null;
  beforeEach( () => {
    let connector = new builder.ConsoleConnector().listen();
    bot = new builder.UniversalBot(connector);
    bot.dialog('/', [
      session => builder.Prompts.text(session,'How should I call you?'),
      (session, response) => session.endDialog(`Nice to meet you, ${JSON.stringify(response.response)}!`)
    ]);
  });
  it('Test welcome flow', (done) => {
    let messages = require('./hiScript');
    unit(bot,messages).then( function () {
        done();
    });
  });
});
```

## Create Jasmine Infrastructure Files

File **"spec/support/jasmine.json"**:
```javascript
{
  "spec_dir": "spec",
  "spec_files": [
    "**/*[sS]pec.js"
  ],
  "helpers": [
    "helpers/**/*.js"
  ],
  "stopSpecOnExpectationFailure": false,
  "random": false
}
```

Create file **"spec/runner.js"**:
```javascript
process.on('uncaughtException', function (exception) {
  console.log(exception);
});
process.on('unhandledRejection', (reason, p) => {
  console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});

var Jasmine = require('jasmine');
var jasmine = new Jasmine();
jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;
jasmine.loadConfigFile('./spec/support/jasmine.json');
jasmine.configureDefaultReporter({
  showColors: true
});


var Reporter = require('jasmine-terminal-reporter');
var reporter = new Reporter({
  isVerbose : true,
  includeStackTrace : true,

})
jasmine.addReporter( reporter );
jasmine.execute();
```

## Prepare Conversation Script
 
Create file **"spec/hiScript.js"**:  
```javascript
module.exports = [
  {
    "user" : "hi"
  },
  {
    "bot" :"How should I call you?"
  },
  {
    "user" : "Timmy"
  },
  {
    "bot" : "Nice to meet you, \"Timmy\"!"
  }
]
```

#  Installation

`npm install --save-dev botbuilder-unit`

# Change log
- 0.2.3 - fixed error with case then multiple messages from users awaited
- 0.2.2 - updated error messages in case if current message in script does not matching pattern for a bot's message
- 0.2.0 - removed ambiguity with user and bot messages, using "user" and "bot" instead of "out" and "in"
- 0.1.0 - initial version
