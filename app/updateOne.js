/**
 * @author wpatterson
 */
var ibmdb = require('ibm_db'),
    async = require('async'),
    c = require('./config');
    
function getData(cb) {
  var db = c[process.argv[4]];
  ibmdb.open("DRIVER={DB2};DATABASE="+db.name+";HOSTNAME="+db.host+";UID="+db.user+";PWD="+db.pass+";PORT="+db.port+";PROTOCOL=TCPIP", function (err,conn) {
    if (err) cb(err);
    
    var q = "update x_marketing_url set queryparams='" + process.argv[2] + "' where seourlparam ='" + process.argv[3] + "'";
    conn.query(q, [], function (err, data) {
      if (err) cb(err);
      conn.close(function () {
        cb(null, data);
      });
    });
  });
}

async.series([
  getData
], function(err, res){
  if(err) {
    //process.stderr.write(err);
    process.exit(1);
  }
  //process.stdout.write(JSON.stringify(res));
  process.exit();
});
