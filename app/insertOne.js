/**
 * @author wpatterson
 */
var ibmdb = require('ibm_db'),
    async = require('async');
    
function getData(cb) {
  ibmdb.open("DRIVER={DB2};DATABASE=STG01DB;HOSTNAME=cmp02-ws-stg-db01;UID=wcdbuser;PWD=h0r1z0n;PORT=50000;PROTOCOL=TCPIP", function (err,conn) {
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
