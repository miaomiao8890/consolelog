var PORT = 9008,
    WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: PORT}),
    pool = []; 

console.log('server start,port:' + PORT);

wss.on('connection', function(ws) {
    pool.push(ws);

    console.log('已连接');

    ws.on('message', function(message) {
        
        console.log(message);

        var arg = JSON.parse(message);
        if(!arg) return;

        ws._id = arg._id;
        ws.location = arg.location;

        for(i in pool){
            //console.log(pool[i]);
            if( pool[i] == ws ) continue;

            if( (ws.location && ws.location == pool[i].location) || (ws._id && ws._id == pool[i]._id) ) {
                console.log('this is message:' + message);
                pool[i].send( message );
            }        
        }
    });

    ws.on('close', function(message) {
        var i = pool.indexOf(ws);
        i>-1 && pool.splice(i,1);
    });
});