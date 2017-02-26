// --------- Dependencies ---------
var path = require('path');

module.exports = function(app, Event, Chance) {

  app.get('/', function(req, res) {
    return res.render('index');
  });

  app.get('/organize', function(req, res) {
    if (!req.session || req.session.game_state === null || req.session.game_state === undefined) {
      req.session.regenerate(function(err) {
        Event.random(function(err, result) {
          req.session.game_state = {
            stats: {
              rating: 50,
              sponsors: 7,
              multiplier: 1,
              money: 1000,
              hackers: 25,
              time: 0
            },
            event_item: result
          };
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
    console.log(req.body);
    if (req.body.next_step === '') {
      if (req.body.chances === '') {
        if (req.body.effects === '') {
          Event.random(function(err, result) {
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
          return res.send({ stats: req.session.game_state.stats, text: null });
        }
      }
    } else {
      Chance.findOne({ name: req.body.next_step }, function(err, chance) {
        if (err) console.log(err);

        if (chance.chances === null) {
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
