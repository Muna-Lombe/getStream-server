const slowFunction = () => {
  let counter = 0;
  while (counter < 5000000000) {
    counter++;
  }

  return counter;
}

process.on('message', (message) => {
  if (message == 'START') {
    try {
      console.log('Child process received START message');
      let slowResult = slowFunction();
      let message = `{"totalCount":${slowResult}}`;
      process.send(message);
    } catch (error) {
      console.log('tell parent something broke!', error)
      process.send('ERROR')
    }
  }
  if(message === 'STOP'){
    console.log('looks like I\' sick now, gonna sleep')
    
  }
})
// process.stderr.on('data', function(err){
//   console.log('something broke, snitching to parent!')
//   process.send(err)
// })
