// --------- Dependencies ---------
var path = require('path');

module.exports = function(app, Event) {

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

  app.get('/newgame', function(req, res) {
    req.session.destroy(function(err) {
      return res.redirect('/');
    })
  });

};
