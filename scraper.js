var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var path = require('path');
var app = express();
var moment = require("moment");
var tz = require('moment-timezone');

const DB = require('./db');

moment.locale('fr');

function run(baseFetchURL) {
  return new Promise((resolve) => {
    DB.connect((db) => {
      scrap(db, baseFetchURL, /* page */ 1, resolve)
      resolve();
    })
  });
}

function _toPrismicObject($product) {
  const title = $product.find('> a span[data-auto-id="productTilePrice"]').text();
  const description = $product.find('> a div[data-auto-id="productTileDescription"] p').text();
  const image_url = $product.find('> a img[data-auto-id="productTileImage"]').attr('src');

  return {
    title,
    description,
    image_url,
    last_update : Math.round(new Date().getTime() / 1000),
    blob: { title, description, image_url }
  }
}

function _save(db, entries) {
  db.collection(DB.Collections.Products).insert(entries, null, function (error, results) {
    console.log(`Inserted ${entries.length} products`);
  });
}

function scrap(db, baseFetchURL, page, resolve) {
  request(`${baseFetchURL}&page=${page}`, function (error, response, html) {
    if (!error && response.statusCode == 200) {

      var $ = cheerio.load(html);
      var parsedResults = [];

      const products = $('section article[data-auto-id="productTile"]').toArray();
      const results = products.map(product => {
        return _toPrismicObject($(product))
      });

      _save(db, results);

      //next page
      scrap(db, baseFetchURL, page + 1, resolve);
    } else {
      resolve();
    }
  })
}

module.exports = {
  run
};
