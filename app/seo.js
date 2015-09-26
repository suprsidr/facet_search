var spawn = require('child_process').spawn;

var op = spawn('node', ['getSeoUrlParams']);

op.stdout.setEncoding('utf8');

op.stdout.on('data', function(data) {
  try {
    console.log(JSON.parse(data)[0]);
  } catch(e) {
    console.log(data);
  }
});

op.on('exit', function(code) {
  if(code > 0) {
    console.log('Oh no, there seems to be an error: ' , code);
    process.exit(1);
  } else {
    process.exit()
  }
});