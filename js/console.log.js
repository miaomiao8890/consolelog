!function(){
    var thisFunc = arguments.callee;

    var mySrc = document.scripts[document.scripts.length-1].src;

    var myLocation = document.createElement('a');
            myLocation.href = mySrc;
    var msg = {
            _id : myLocation.search.replace('?','').split('=')[1],
            location: location.href
    }

    var socket =  new WebSocket('ws://172.18.100.71:9008');

    socket.tasks = [];
    socket.onopen = function(){
        //console.log('已连接', true);
        while(socket.tasks.length) socket.tasks.pop()();
    }

    socket.onmessage = function(msg){
        var data = JSON.parse(msg.data).data;
        console.log( data );
    }

    socket.onclose = function(){
        console.log('已断开', true);
        setTimeout(function(){
            socket =  new WebSocket('ws://172.18.100.71:9008');
        }.bind(thisFunc),1000);
    }

    //下面是变量输出的方法
    function var_dump(command, context, parents, n) {
        if(!command || (typeof command == 'string' && command.length == 0)) return command;
        var context = context || window;
        var parents = parents || '';
        var n = (n==0?0:n) || 1;

        var startTime = new Date();
        var line_count = 0;
        var thisFunction = arguments.callee;
        var text = '';
        var obj = null;
        var isVisited = false;
        var fullname = '';

        try {
            obj = line_count == 0 ? eval.call(context, command) : command;
        } catch (e) {
            return e
        }

        line_count == 0 && (thisFunction.historyArguments = []);
        thisFunction.historyArguments.push(obj);

        if (typeof obj == 'string') return '\"' + obj + '\"';
        if (typeof obj != 'object') return obj;

        if (obj && isArray(obj)) {
            text = '[' + function () {
                if (obj.length >= 2) {
                    return obj.reduce(function (preVal, curVal) {
                        return function () {
                            if (typeof preVal != 'object') return preVal;
                            return thisFunction(preVal, obj, '', 0)
                        }() + ',' + function () {
                            if (typeof curVal == 'string') return '\"' + curVal + '\"';
                            if (typeof curVal != 'object') return curVal;
                            return thisFunction(curVal, obj, '', 0)
                        }()
                    });
                } else if (obj.length == 1) {
                    return thisFunction(obj[0], obj, '', 0)
                } else {
                    return ''
                }
            }() + ']';
            line_count++;
            return text
        }

        if (obj && (typeof obj == 'object')) {
            if (n <= 0) return obj;
            for (i in obj) {
                isVisited = thisFunction.historyArguments.indexOf(obj[i]) != -1;
                fullname = (parents != '' ? parents + '.' : '') + i;

                text += (fullname + ': ' + function () {
                    if (typeof obj[i] == 'string') return '\"' + obj[i] + '\"';
                    if (typeof obj[i] != 'object') return obj[i];
                    if (n <= 1) return obj[i];
                    if (isVisited) return obj[i];
                    return '\n' + thisFunction(obj[i], obj, fullname, n - 1)
                }() + '\n');

                line_count++;
            }
            return text
        }
    };

    function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    //下面开始重写 console.log
    window.originalConsole = window.console;
    window.console = {};
    window.console.log = function (data, isString) {
        if (arguments.length == 0) return;
        msg.data = function(){
            if(!isString) data = var_dump(data);
            return typeof data == 'string' ? data.replace(/\n([^\s])/g,'\n  $1') : data
        }();

        if(socket.readyState==1){
            socket.send( JSON.stringify(msg) );
        }else{
            socket.tasks.push(function(){
                    socket.send( JSON.stringify(msg) );
            });
        }
        originalConsole.log(data);
    };

    window.addEventListener('error', function (e) {
        console.log( e );
    })
}()