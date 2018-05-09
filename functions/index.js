const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendNotifications = functions.database
  .ref('/messages/{messageId}')
  .onWrite(change => {
    if (change.before.exists()) {
      return;
    }
    const payload = {
      notification: {
        title: `${change.after.val().author}`,
        body: `${change.after.val().msg}`,
        icon: "assets/icon.png",
        click_action: "https://chatastrophe-neil.firebaseapp.com"
      }
    };

    // sending message notifications to tokens in db
    return admin
      .database()
      .ref("fcmTokens")
      .once("value")
      .then(allTokens => {
        if (allTokens.val()) {
          const tokens = [];
          // loop through all token and if not current user, push to array of valid tokens
          for (let fcmTokenKey in allTokens.val()) {
            const fcmToken = allTokens.val()[fcmTokenKey];
            if (fcmToken.user_id !== change.after.val().user_id) {
              tokens.push(fcmToken.token);
            }
          }
          // send notifications to every device
          if (tokens.length > 0) {
            return admin
              .messaging()
              .sendToDevice(tokens, payload)
              .then(response => {
                // token cleanup
                const tokensToRemove = [];
                response.results.forEach((result, index) => {
                  const error = result.error;
                  if (error) {
                    console.log("Failure sending notification to", tokens[index], error);
                    if (error.code === "messaging/invalid-registartion-token" || 
                        error.code === "messaging/registration-token-not-registered") {
                      tokensToRemove.push(
                        allTokens.ref.child(tokens[index]).remove()
                      );
                    }
                  }
                });
                // remove() on each token entry returns a promise and we simply return
                // the resolution of all such promises.
                return Promise.all(tokensToRemove);
              });
          }
        }
        return;
      });
  });
