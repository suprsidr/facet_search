/**
 * @author wpatterson
 */
var ibmdb = require('ibm_db'),
    async = require('async'),
    c = require('./config');

function getData(cb) {
  var db = c.stage;
  ibmdb.open("DRIVER={DB2};DATABASE="+db.name+";HOSTNAME="+db.host+";UID="+db.user+";PWD="+db.pass+";PORT="+db.port+";PROTOCOL=TCPIP", function (err,conn) {
    if (err) cb(err);
    var q = "select seourlparam from x_marketing_url where store_id = "+ c.storeId +" order by seourlparam asc with ur";
    conn.query(q, [], function (err, data) {
      if (err) cb(err);
      conn.close(function () {
        cb(null, data.map(function(a) {return a.SEOURLPARAM}));
        // test data
        //cb(null, ['wayne','barb','barbara','cats','catness','dogs','doggy']);
      });
    });
  });
}

async.series([
  getData
], function(err, res){
  if(err) {
    process.stderr.write(err);
    process.exit(1);
  }
  process.stdout.write(JSON.stringify(res));
  process.exit();
});
