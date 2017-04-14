const uuid = require('uuid/v4');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const express = require('express');
const easydate = require('easydate');
const settings = require('./settings');


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
                nickname: 'Set your nickname ! ',
                id: socket.id,
                icon : settings.defaultIcons[Math.floor(Math.random() * settings.defaultIcons.length)]
            };

            if (userList.length === 0) {
                userList.push(user);
                console.log(userList);
                io.emit('chatliste', userList);
            } else {
                userList.forEach((userObject) => {
                        if (userObject.id == user.id) {
                            return console.log('user exists');
                        } else {

                            //delete userObject.socket;
                            userList.push(user);

                            //console.log(userList);
                            io.emit('chatliste', userList);
                            console.log(userList);
                            //io.emit('chatliste', userList);
                        }
                    });
                }


                socket.once('username', (userName) => {

                    console.log(user.id);
                    user.nickname = userName;
                    io.emit('userconnected', userName);
                    console.log(userList);
                    io.emit('chatliste', userList);

                });

                socket.on('nick', (nickname) => {
                  user.nickname = nickname;
                  io.emit('userconnected', nickname);
                  io.emit('chatliste', userList);
                });


                socket.on('msg', (message) => {
                    const usermsg = {
                        id: uuid(),
                        txt: message,
                        userId: socket.id,
                        date: easydate('h:m:s'),
                        nick: user.nickname,
                        icon : user.icon
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
                    io.emit('discolist', userList);
                    console.log(userList);



                    console.log(user.nickname + ' est déconnecté');

                });



            });
