const MESSAGE_TIMEOUT = 20;
const NEXT_USER_MESSAGE_TIMEOUT = 1000;


function testBot(bot, messages) {
  let done = null;

  function callTrigger(check, bot, name, args) {
    if ("function" == typeof check[name]) {
      check[name](bot, args);
    }
  }

  return new Promise(function (resolve, reject) {
    var step = 0;
    var connector = bot.connector('console');
    done = () => {
      resolve();
    };
    function checkBotMessage(message, check, callback) {
      if ( check.bot ) {
        console.log(`BOT: >> ${message.text}`);
        if (typeof check.bot === 'function') {
          return check.bot(bot, message, callback);
        } else {
          if (check.bot) {
            let result = (check.bot.test ? check.bot.test(message.text) : message.text === check.bot);
            let error = null;
            if (!result) {
              error = `<${message.text} does not match <${check.bot}>`;
            }
            callback(error);
          } else {
            callback(`No input message in:\n${JSON.stringify(check)}`);
          }
        }
      } else if ( check.endConversation ) {
        console.log(`BOT: >> endConversation`);
        callback();
      } else if ( check.typing ) {
        console.log(`BOT: >> typing`);
        callback();
      } else {
        throw new Error(`Unknown message from bot:\n${JSON.stringify(check)}`);
      }
    }


    function proceedNextStep() {
      if (step == messages.length) {
        console.log('SCRIPT FINISHED');
        setTimeout(done, MESSAGE_TIMEOUT); // Enable message from connector to appear in current test suite
        return;
      }

      if (messages[step].user) {
        let check = messages[step];

        console.log(`Step: #${step}`);
        console.log('User: >> ' + check.user);
        step++;
        callTrigger(check, bot, 'before')
        let messagePromise = null;
        if ("function" === typeof check.user) {
          messagePromise = new Promise((resolve, reject) => {
            check.user(bot, resolve, reject);
          });
        } else {
          messagePromise = Promise.resolve(check.user);
        }
        messagePromise.then((message) => {
          if ("object" == typeof message) {
            if (!message.data.address) {
              message.address({
                channelId: 'console',
                user: {id: 'user', name: 'User1'},
                bot: {id: 'bot', name: 'Bot'},
                conversation: {id: 'Convo1'}
              });
            }
            connector.onEventHandler([message.toMessage()]);
          } else {
            connector.processMessage(message);
          }
          callTrigger(check, bot, 'after');
        }, (err) => {
          throw err;
        });
        if ( step <= messages.length && (messages[step].user) ) {
          setTimeout( function () {
            proceedNextStep();
          }, NEXT_USER_MESSAGE_TIMEOUT)

        }
      }

    }

    bot.on('send', function (message) {
      let inRange = (step > 0) && (step < messages.length);
      if (inRange) {
        var check = messages[step];
        console.log(`Step: #${step}`);
        step++;
        console.log()
        console.log(check);
        callTrigger(check, bot, 'before', message);
        checkBotMessage(message, check, (err) => {
          callTrigger(check, bot, 'after', err);
          if (err) {
            fail(err);
            done();
            return;
          } else {
            proceedNextStep();
          }
        });
      }
      else {
        console.log('Bot: >>Ignoring message');
        setTimeout(done, MESSAGE_TIMEOUT); // Enable message from connector to appear in current test suite
      }
    });
    if (messages.length) {
      proceedNextStep();
    }
  })
}

module.exports = testBot;