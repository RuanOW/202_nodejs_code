<script src="http://localhost:8080/socket.io/socket.io.js"></script>
  <script>
    const socket = io('http://localhost:8080', {transports: ['websocket']});
    socket.on('test', function(msg) {
      console.log(msg);
    })

    socket.on('chat message', function(msg) {
      console.log(`This is the message that was sent: ${msg}`);
    })

    socket.on('broadcast', function(msg) {
      console.log(`This is the message that was sent: ${msg}`);
    })

    function sayHello() {
      socket.emit('chat message','Browser is saying hello')
    }

    function broadcast() {
      socket.emit('broadcast','This is a broadcast message')
    }
  </script>