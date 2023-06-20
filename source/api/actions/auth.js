'use strict';

const anxeb = require('anxeb-node');
const md5 = require('md5')
// const ObjectId = requeire('anxeb-mongoose').ObjectId

module.exports = {
    type: anxeb.Route.types.action,
    access: anxeb.Route.access.public,
    timeout: 60000,

    childs : {
        user :{
            methods: {
                post: async function (context) {
                    let credentials = context.payload;
                    console.log(credentials);
        
                    // let authType = context.query.type || 'email';
                    let email = credentials.email ? credentials.email.trim().toLowerCase() : null;
        
                    if (email === null) {
                        context.log.exception.invalid_request.throw();
                    };
        
                    let user = await getUserData({                        
                        context: context,
                        email: email,                        
                    });

        
                    if (user == null) {
                        console.log('USER NULL');
                    } else if (user != null) {
                        let login = user.login;
        
                        let validated = false;
                        let provider = 'email';
        
                        if (credentials.password != null) {
                            let password = credentials.password ? credentials.password.trim() : null;
                            let hashPassword = md5(password.trim().toLowerCase());

                            let npassValid = user.login.password === hashPassword;
                            
                            // let gpassValid = user.meta && user.meta.generated_password === mpassword
        
                            validated = password && password.length && (npassValid); // || gpassValid
                            // if (gpassValid) {
                            //     user.login.password = user.meta.generated_password;
                            //     await user.persist();
                            // }
                        }
        
                        if (!validated) {
                            context.log.exception.invalid_credentials.throw({ next: context.next, silent: true });
                            return;
                        }
                        if (login.state === 'incative') {
                            context.log.exception.inactive.user.throw();
                        }
                        if (login.state === 'removed') {
                            context.log.exception.removed.user.throw();
                        }
        
                        const response = await user.using(context).getAuthResponse({
                            changes: function (user) {
                                user.login.provider = provider;
                                if (user.login.state !== 'removed') {
                                    user.login.state = 'active';
                                }
                                user.login.data = anxeb.utils.date.utc().unix();
                                user.meta.headers = anxeb.utils.data.copy(context.req.headers);
                                // if(authType === 'social') {
                                //     user.meta.social = credentials
                                // }
                                user.markModified('meta')
                            }
                        })
        
                        context.send(response) 
        
                    }
        
        
                    await user.persist();
        
                    context.send(user.toClient());
                }
            },

        }
    }
};

const getUserData = async function (params) {
    const context = params.context;
    const query = {};

    if (params.email != null) {
        query['login.email'] = params.email.trim().toLowerCase();
    } 
    // else if (params.id != null) {
        //     query._id = params.id;
        // }
        else {
            return null
        }
    query['meta.deleted'] = { $exists: false };
    return await context.data.find.User(query); 
} 