const uuid = require('uuid/v4');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const express = require('express');
const easydate = require('easydate');


server.listen(8080, function() {
    console.log('listening on 8080');
});

// Contenu du dossier public accessible sur le web
app.use('/', express.static(__dirname + '/public'));

var userList = [];
const newUser = 'new user';

io.on('connection', (socket) => {
    console.log('client connecté');
    io.emit('newUser', newUser);

    const user = {
        socket: socket,
        nickname: 'Set your nickName !',
        id: socket.id
    };



    socket.on('username', (userName) => {

        user.nickname = userName;


        if (userList.length === 0) {
            userList.push(user);
            console.log(userList);
            io.emit('userconnected', userName);
        } else {
            userList.forEach((userObject) => {

                if (userObject.id == user.id) {
                    return console.log('user exists');
                }

                userList.push(user);
                console.log(userList);
                io.emit('userconnected', userName);

            });
        }

    });

    socket.on('msg', (message) => {
        const usermsg = {
            id: uuid(),
            txt: message,
            userId: socket.id,
            date: easydate('h:m:s'),
            nick: user.nickname
        };
        io.emit('msg', usermsg);
    });

    socket.on('disconnect', () => {

        delete user.socket;

        io.emit('disconnected', user);

        //var newList = userList;

        userList = userList.filter((userObject) => {
          return userObject.id !== user.id;
        });

        userList.forEach((userObject) =>{
          delete userObject.socket;
        });




        console.log(userList);



        console.log(user.nickname+' est déconnecté');

    });



});
