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
                    let prospect = context.payload.prospect;

                    let registered_user = await context.data.find.User({'login.email' : prospect.email.trim().toLowerCase()});
                    if (registered_user && registered_user.login.state !== 'unconfirmed') {
                        context.log.exception.prospect_account_registered.args(prospect.email).throw(context);
                    }

                    let gpassword= context.utils.security.getRandomPassword();
                    let mpassword= md5(gpassword.toLowerCase());

                    let user;
                    if(registered_user) {
                        user= registered_user;
                        user.login.password = mpassword;
                        user.login.date = anxeb.utils.date.utc().unix();
                        user.meta.headers = anxeb.utils.date.copy(context.req.headers);
                        delete user.meta.deleted;
                        user.markModified('meta');
                    } else {
                        user = context.data.create.User({
                            first_names : prospect.first_names,
                            last_names : prospect.last_names,
                            role : prospect.role,//no entiendo xq el harcodea cliente
                            login : {
                                provider : 'email',
                                email : prospect.email.trim().toLowerCase(),
                                password : mpassword,
                              //  confirmPassword : fields.string({required: true}),
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
                            html : 'Hola' + fullName
                        }). send();

                    } catch (error) {
                        context.log.exception.smtp.error.args(error).throw(context);
                    }
                    context.send(user.toClient())
                }
            }
        }
    }
}