/**
 * @author wpatterson
 */
var ibmdb = require('ibm_db'),
    async = require('async');
    
function getData(cb) {
  ibmdb.open("DRIVER={DB2};DATABASE=STG01DB;HOSTNAME=cmp02-ws-stg-db01;UID=wcdbuser;PWD=h0r1z0n;PORT=50000;PROTOCOL=TCPIP", function (err,conn) {
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
