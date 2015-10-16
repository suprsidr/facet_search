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
    //console.log(process.argv[2]);
    var q = "insert into x_marketing_url (store_id,catalog_id,seourlparam,queryparams,optcounter) values(10151,10051,'" + process.argv[2] + "','" + process.argv[3] + "',0)";
    //console.log(q);
    conn.query(q, [], function (err, data) {
      if (err) cb(err);
      conn.close(function () {
        //console.log('response: ', data);
        cb();
      });
    });
  });
}

async.series([
  getData
], function(err, res){
  if(err) {
    //console.log('db error: ', err);
    //process.stderr.write(err);
    process.exit(1);
  }
  //process.stdout.write(JSON.stringify(res));
  process.exit();
});
