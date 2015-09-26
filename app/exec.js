/**
 * @author wpatterson
 */
var spawn = require('child_process').spawn;

var op = spawn('node', ['app']);

op.stdout.setEncoding('utf8');

op.stdout.on('data', function(data) {
  console.log(data);
})

op.on('exit', function(code) {
  if(code > 0) {
    console.log('Oh no, there seems to be an error: ' , code);
  } else {
    console.log('Job complete.');
  }
});
