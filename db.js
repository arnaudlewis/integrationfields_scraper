var MongoClient = require('mongodb').MongoClient;
//var url = "mongodb://localhost:27017/tutoriel";

 const url = "mongodb://arnaudlewis_query:TFU5QnkEc94yrAtsC@ds263137.mlab.com:63137/asos_api";

function connect(callback, ...params) {
  MongoClient.connect(url, function(err, db) {
    if(err) console.log(err);
    else {
      if(callback) callback(db);
    }
  })
}

const Collections = {
  Products: 'products'
}

module.exports = {
  connect,
  Collections
}
