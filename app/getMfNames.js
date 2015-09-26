/**
 * @author wpatterson
 */
var ibmdb = require('ibm_db'),
    path = require('path'),
    LOCALAPPDATA = path.join(process.env.LOCALAPPDATA, 'faceted_search'),
    async = require('async'),
    file = require('./file');
    
function getData(cb) {
  console.log('Querying for MfNames');
  ibmdb.open("DRIVER={DB2};DATABASE=STG01DB;HOSTNAME=cmp02-ws-stg-db01;UID=wcdbuser;PWD=h0r1z0n;PORT=50000;PROTOCOL=TCPIP", function (err,conn) {
    if (err) cb(err);
    var q = "select distinct mfname from catentry where catenttype_id = 'ProductBean' and mfname not in ('Accurail','Athearn','Atlas','Atlas O Gauge','Bachmann','Bullfrog Snot','Brooklyn Peddler','Broadway Limited Imports','BLMA Models','Bowser Manufacturing','Caboose Industries','Chooch Enterprises','Mantua ','Digitrax','Estes Industries','Fox Valley','JTT Scenery Products','Kadee','Kato','Life-Like Trains','Lionel','McHenry','Model Power','Miniatronics','Model Rectifier Corporation','MODEL RECTIFIER CORP-AOSHIMA','Microscale','MTH','Mini Metals','Northcoast Engineering','Peco','Rix Products','Roundhouse','Rapido','Tru-Color Paint','Woodland Scenics','test MfName','null') and field4 not in ('ACU','ARI','ATL','ATO','BAC','BFS','BKP','BLI','BLM','BLS','BMM','BOW','CAB','CHO','CSM','DGT','FRP','FVM','IMR','JTT','KAD','KAL','KAT','LNL','MDP','MNT','MRC','MSI','MTH','MWI','NCE','PCT','PGH','PPC','RIX','RPI','TNC','TUP','UST','WOO','XUR') order by mfname asc with ur";
    conn.query(q, [], function (err, data) {
      if (err) cb(err);
      
      file.save(path.join(LOCALAPPDATA, './MfNames.js'), 'exports.MfNames = ' + JSON.stringify(data.map(function(a) {return a.MFNAME})), function(err) {
        if(err) cb(err);
        conn.close(function () {
          console.log('done');
          cb(null, 'step 1 done');
        });
      });
    });
  });
}

async.series([
  getData
], function(err, res){
  if(err) {
    console.log(err);
    process.exit(1);
  }
  process.exit();
});


Array.prototype.unique=function(){for(var r=this.concat(),t=0;t<r.length;++t)for(var n=t+1;n<r.length;++n)r[t]===r[n]&&r.splice(n--,1);return r};
