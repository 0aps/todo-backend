'use strict';

const anxeb = require('anxeb-node');
 const md5 = require("md5");


module.exports = {
    type : anxeb.Route.types.action,
    access : anxeb.Route.access.public,
    timeout : 60000,
    childs : {
        user: {
            methods : {
                post: async function(context) {
                    let prospect = context.payload; //saque el prospect de aqui para no tener q escribirlo en postman
                    let validPassword = false

                    let registered_user = await context.data.find.User({'login.email' : prospect.email.trim().toLowerCase()});
                    if (registered_user && registered_user.login.state !== 'unconfirmed') {
                        context.log.exception.prospect_account_registered.args(prospect.email).throw(context);
                    }

                    if (!prospect.password || !prospect.confirmPassword) {
                        context.log.exception.invalid_password.args(prospect.password).throw(context);
                    }

                    if (prospect.password === prospect.confirmPassword) {
                        validPassword = true
                    }else {
                        context.log.exception.diferent_passwords.args(prospect.password).throw(context);
                    }

                    let hashPassword= md5(prospect.password.toLowerCase());

                    let user;
                    if(registered_user) {
                        user= registered_user;
                        user.login.password = hashPassword;
                        user.login.date = anxeb.utils.date.utc().unix();
                        user.meta.headers = anxeb.utils.data.copy(context.req.headers);
                        delete user.meta.deleted;
                        user.markModified('meta');
                    } else if(validPassword){
                        user = context.data.create.User({
                            first_names : prospect.first_names,
                            last_names : prospect.last_names,
                            password : md5(prospect.password.toLowerCase()),
                            role : prospect.role,//no entiendo xq el harcodea cliente
                            login : {
                                provider : 'email',
                                email : prospect.email.trim().toLowerCase(),
                                password : md5(prospect.password.toLowerCase()),
                                state : 'unconfirmed',
                                date : anxeb.utils.date.utc().unix(),
                                token : null,
                            },
                            info : {},
                            meta : {
                                created : anxeb.utils.date.utc().unix(),
                                headers : anxeb.utils.data.copy(context.req.headers)
                            }
                        })
                    }

                    let fullName = user.first_names + ' ' + user.last_names;

                    try {
                        await context.smtp({
                            to: fullName +'<'+ user.login.email + '>',
                            subject : 'Registro To-do',
                            html : 'Hola' + fullName  + 'contraseña :' + user.login.password
                        }). send();

                    } catch (err) {
                        context.log.exception.smtp_error.args(err).throw(context);
                    }
                    await user.persist();
                    context.send(user.toClient())
                }
            }
        }
    }
}