// --------- Dependencies ---------
var path = require('path');

module.exports = function(app, Event, Chance) {

  function getRandomKey(obj) {
      var temp_key, keys = [];
      for(temp_key in obj) {
         if(obj.hasOwnProperty(temp_key)) {
             keys.push(temp_key);
         }
      }
      return keys[Math.floor(Math.random() * keys.length)];
  }

  var sponsors = {
    "BAE Systems": "http://lmgtfy.com/?q=BAE+systems+careers",
    "Citi": "http://lmgtfy.com/?q=Citi+careers",
    "Viacom": "http://lmgtfy.com/?q=Viacom+careers",
    "Vanguard": "http://lmgtfy.com/?q=Vanguard+careers",
    "Hudson River Trading": "http://lmgtfy.com/?q=Hudson+River+Trading+careers",
    "AIS": "http://lmgtfy.com/?q=Assured+Information+Security+careers",
    "Bloomberg": "http://lmgtfy.com/?q=Bloomberg+careers",
    "Lockheed Martin": "http://lmgtfy.com/?q=Lockheed+Martin+careers",
    "GE": "http://lmgtfy.com/?q=GE+careers",
    "PWC": "http://lmgtfy.com/?q=PWC+careers",
    "76West": "http://lmgtfy.com/?q=NYS+76West+careers",
    "Rubenstein Technology Group": "http://lmgtfy.com/?q=Rubenstein+Tech+careers"
  };

  app.get('/', function(req, res) {
    return res.render('index');
  });

  app.get('/organize', function(req, res) {
    if (!req.session || req.session.game_state === null || req.session.game_state === undefined) {
      req.session.regenerate(function(err) {
        Event.random(function(err, result) {
          req.session.game_state = {};
          if (result.name == 'Sponsor') {
            var sponsor = getRandomKey(sponsors);
            result.message += (' ' + sponsor + ' is looking to join your growing list of sponsors!');
            req.session.game_state.sponsor = sponsor;
          } else {
            delete req.session.game_state.sponsor;
          }
          req.session.game_state.stats = {
              rating: 50,
              sponsors: 7,
              multiplier: 1,
              money: 1000,
              hackers: 25,
              time: 0
          };
          req.session.game_state.event_item = result;
          req.session.save(function(err) {
            return res.render('game', {
              state: req.session.game_state
            });
          });
        });
      });
    } else {
      return res.render('game', {
        state: req.session.game_state
      });
    }
  });

  app.post('/organize', function(req, res) {
    if (req.body.next_step === '') {
      if (req.body.chances === '') {
        if (req.body.effects === '') {
          Event.random(function(err, result) {
            if (result.name == 'Sponsor') {
              var sponsor = getRandomKey(sponsors);
              result.message += (' ' + sponsor + ' is looking to join your growing list of sponsors!');
              req.session.game_state.sponsor = sponsor;
            } else {
              delete req.session.game_state.sponsor;
            }
            req.session.game_state.event_item = result;
            req.session.save(function(err) {
              return res.send({
                refresh: true
              });
            });
          });
        } else {
          for (var key in req.body.effects) {
            req.session.game_state.stats[key] += parseInt(req.body.effects[key]);
          }
          Event.random(function(err, result) {
            if (result.name == 'Sponsor') {
              var sponsor = getRandomKey(sponsors);
              result.message += (' ' + sponsor + ' is looking to join your growing list of sponsors!');
              req.session.game_state.sponsor = sponsor;
            } else {
              delete req.session.game_state.sponsor;
            }
            req.session.game_state.event_item = result;
            req.session.save(function(err) {
              return res.send({
                refresh: true
              });
            });
          });
        }
      }
    } else {
      Chance.findOne({ name: req.body.next_step }, function(err, chance) {
        if (err) console.log(err);

        if (chance.chances === null) {
          if (chance.choices && chance.choices[0].effects.url) {
            chance.choices[0].effects.url = sponsors[req.session.game_state.sponsor];
          }
          return res.send({ text: chance.message, image: chance.image, choices: chance.choices });
        } else {
          var threshold = Math.floor(Math.random() * 101);
          var minItem;
          var minItemThreshold;
          for (var i = 0; i < chance.chances.length; i++) {
            if (threshold <= chance.chances[i].threshold) {
              minItem = chance.chances[i];
              minItemThreshold = chance.chances[i].threshold;
              break;
            }
          }
          if (minItem.effects !== null) {
            for (var key in minItem.effects) {
              req.session.game_state.stats[key] += parseInt(minItem.effects[key]);
            }
          }
          return res.send({ stats: req.session.game_state.stats, text: chance.message + minItem.text });
        }
      });
    }
  });

  app.get('/newgame', function(req, res) {
    req.session.destroy(function(err) {
      return res.redirect('/');
    })
  });

};
