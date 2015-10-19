/**
 * @author wpatterson
 */
var ibmdb = require('ibm_db'),
    path = require('path'),
    c = require('./config'),
    LOCALAPPDATA = c.LOCALAPPDATA,
    _ = require('lodash'),
    async = require('async'),
    file = require('./file'),
    fs = require('fs');
    
function getData(cb) {
  console.log('Querying for Categories');
  var db = c.stage;
  ibmdb.open("DRIVER={DB2};DATABASE="+db.name+";HOSTNAME="+db.host+";UID="+db.user+";PWD="+db.pass+";PORT="+db.port+";PROTOCOL=TCPIP", function (err,conn) {
    if (err) cb(err);
    var q = "select a.mfpartnumber as \"ProdID\", trim(e.identifier) as \"CatID\", trim(d.name) as \"CatName\", e.catgroup_id as \"CatGroup\" from catentry as a inner join catgpenrel as c on a.catentry_id = c.catentry_id inner join catgrpdesc as d on c.catgroup_id = d.catgroup_id inner join catgroup as e on d.catgroup_id = e.catgroup_id where a.catenttype_id = 'ProductBean' and e.identifier not like '%ZZ_%' and c.catalog_id = '10051' order by a.mfpartnumber asc with ur";
    conn.query(q, [], function (err, data) {
      if (err) cb(err);
      
      var map = {};
      _.each(data, function(a, i) {
        map[a.CatID] = {
          id: a.CatID,
          groupID: a.CatGroup,
          name: a.CatName
        }
      })
      
      var uniq = data.map(function(item) {
        return item.CatID;
      }).unique().sort();
      
      //uniq.pop();
      
      var fin = [];
      _.each(uniq, function(a) {
        fin.push(map[a]);
      })
      
      file.save(path.join(LOCALAPPDATA, './SearchCategories.js'), 'exports.Cats = ' + JSON.stringify(fin), function(err) {
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
