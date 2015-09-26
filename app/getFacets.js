/**
 * @author wpatterson
 */
var ibmdb = require('ibm_db'),
    path = require('path'),
    LOCALAPPDATA = path.join(process.env.LOCALAPPDATA, 'faceted_search'),
    _ = require('lodash'),
    async = require('async'),
    file = require('./file'),
    fs = require('fs');
    
function getData(cb) {
  console.log('Querying for Facets');
  ibmdb.open("DRIVER={DB2};DATABASE=STG01DB;HOSTNAME=cmp02-ws-stg-db01;UID=wcdbuser;PWD=h0r1z0n;PORT=50000;PROTOCOL=TCPIP", function (err,conn) {
    if (err) cb(err);
    var q = "select b.SRCHFIELDNAME \"ID\",av.identifier \"Name\",c.name \"Desc\" from attr a, attrdesc c, attrdictsrchconf b, attrval av , facet f where a.attr_id = b.attr_id and a.attr_id = c.attr_id and f.attr_id = c.attr_id and a.attr_id = av.attr_id and av.identifier not like '%ZZ_%' order by c.name asc with ur";
    conn.query(q, [], function (err, data) {
      if (err) cb(err);
      
      var map = {};
      _.each(data, function(a, i) {
        try {
          map[a.ID].Values.push(a.Name);
        } catch(e) {
          map[a.ID] = {};
          map[a.ID].Desc = a.Desc;
          map[a.ID].Values = [];
          map[a.ID].Values.push(a.Name);
        }
      });
      
      file.save(path.join(LOCALAPPDATA, './FacetMap.js'), 'exports.Facets = ' + JSON.stringify(map), function(err) {
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
