/**
 * @author wpatterson
 */
var path = require('path');
module.exports = {
  /*stage : {
    host: 'cmp02-ws-stg-db01',
    port: 50000,
    name: 'STG01DB',
    user: 'wcdbuser',
    pass: 'h0r1z0n'
  },
  prod: {
    host: 'cmp02-ws-prd-db01',
    port: 50000,
    name: 'PRD01DB',
    user: 'wcdbuser',
    pass: 'h0r1z0n'
  },*/
  // the following are actually dev2 and qa2
  stage : {
    host: 'cmp02-ws-dev-db01',
    port: 50000,
    name: 'DEV01DB',
    user: 'wcdbuser',
    pass: 'h0r1z0n'
  },
  prod: {
    host: 'cmp02-ws-tst-db01',
    port: 50000,
    name: 'TST01DB',
    user: 'wcdbuser',
    pass: 'h0r1z0n'
  },
  storeId: 10651,
  catalogId: 10551,
  LOCALAPPDATA: path.join(process.env.LOCALAPPDATA, 'forcerc_faceted_search')
}
