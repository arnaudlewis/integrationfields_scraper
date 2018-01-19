var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var favicon = require('serve-favicon');
var path = require('path');
var app = express();
var http = require("http");
var cookieParser = require('cookie-parser');

const DB = require('./db');
const Scraper = require('./scraper');

const auth = require('basic-auth')

app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')))

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('listening on port ' + port);
});

// app.use((req, res, next) => {
//   const PERMANENT_TOKEN = "jdfjiw28493ndfk2948902jsjkfjn2-9_9nef_ie"
//   const credentials = auth(req);
//   if(credentials && credentials.name === PERMANENT_TOKEN) next();
//   else res.status(401).end("Acces Denied");
// });

DB.connect((db) => {

  //limit total_size to 103 to prevent locking free algolia account
  function prismicFormat(results, total) {
    const TOTAL_SIZE = total;

    return {
      results_size: TOTAL_SIZE, //count of all items in the API
      results: results.filter(r => !r.className).map(result => {
        return {
          id: result._id,
          title: result.title || '',
          description : result.description || '',
          image_url : result.image_url || '',
          last_update : new Date(result.last_update).getTime(), //optional timestamp
          blob: result.blob
        }
      })
    };
  }

  app.get('/scrap/:fetchURL', function(req, res) {
    if(!req.params.fetchURL) res.send("Missing fetch URL");
    else {
      Scraper.run(req.params.fetchURL).then(() => {
        res.send("All good Niggaz!");
      });
    }
  })

  app.get('/api', function (req, res) {

    const PAGE_SIZE = 50;
    const page = req.query.page || 1;

    const total = db.collection(DB.Collections.Products).count(count => {
      db.collection(DB.Collections.Products)
      .find()
      .skip(PAGE_SIZE * (page - 1))
      .limit(PAGE_SIZE)
      .sort({date:-1})
      .toArray((err, results) => {
        if (err) throw err;
        res.send(prismicFormat(results, count));
      });
    });
  });

  app.get('/api/:total', function (req, res) {

    const PAGE_SIZE = 50;
    const page = req.query.page || 1;
    const total = parseInt(req.params.total);

    db.collection(DB.Collections.Products)
    .find()
    .skip(PAGE_SIZE * (page - 1))
    .limit(PAGE_SIZE)
    .sort({date:-1})
    .toArray((err, results) => {
      if (err) throw err;
      res.send(prismicFormat(results, total));
    });
  });

  app.get('/api/:pagesize/:total', function (req, res) {
    const page = req.query.page || 1;
    const total = parseInt(req.params.total);
    const PAGE_SIZE = parseInt(req.params.pagesize);

    const withLimitPageSize = (() => {
      if(page * PAGE_SIZE > total) {
        if(page === 1) return total;
        else if((page - 1) * PAGE_SIZE < total) return total % PAGE_SIZE;
      } else {
        return PAGE_SIZE;
      }
    })();

    db.collection(DB.Collections.Products)
    .find()
    .skip(PAGE_SIZE * (page - 1))
    .limit(withLimitPageSize)
    .sort({date:-1})
    .toArray((err, results) => {
      if (err) throw err;
      res.send(prismicFormat(results, total));
    });
  });

  setInterval(function() {
    http.get("http://asos-api.herokuapp.com/");
  }, 300000); // every 5 minutes (300000)
});
