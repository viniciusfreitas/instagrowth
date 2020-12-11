import axios from 'axios';

import { accountService } from '@/_services';

// array in local storage for accounts
const accountsKey = 'vue-facebook-login-accounts';
let accounts = JSON.parse(localStorage.getItem(accountsKey)) || [];

const baseUrl = process.env.VUE_APP_API_URL;

export function fakeBackend() {
    const methods = ['get', 'post', 'put', 'delete'];
    methods.forEach(method => {
        axios[`original${method}`] = axios[method];
        axios[method] = function (url, ...params) {
            return new Promise((resolve, reject) => {
                return handleRoute();

                function handleRoute() {
                    switch (true) {
                        case url.endsWith('/accounts/authenticate') && method === 'post':
                            return authenticate();
                        case url.endsWith('/accounts') && method === 'get':
                            return getAccounts();
                        case url.match(/\/accounts\/\d+$/) && method === 'get':
                            return getAccountById();
                        case url.match(/\/accounts\/\d+$/) && method === 'put':
                            return updateAccount();
                        case url.match(/\/accounts\/\d+$/) && method === 'delete':
                            return deleteAccount();
                        default:
                            // pass through any requests not handled above
                            return axios[`original${method}`](url, body())
                                .then(response => resolve(response))
                                .catch(error => reject(error));
                    }
                }

                // route functions

                function authenticate() {
                    const { accessToken } = body();

                    axios.get(`https://graph.facebook.com/v9.0/me?access_token=${accessToken}`).then(async response => {
                        const { data } = response;
                        if (data.error) return unauthorized(data.error.message);

                        // chama o backend
                        const backEndData = await serverAuth(accessToken)
                        // console.log(1, backEndData);

                        // ----- parte do frontend -------
                        // let account = accounts.find(x => x.facebookId === data.id);
                        // console.log('[x]', account);
                        // if (!account) {
                            // console.log(2, backEndData);
                            // create new account if first time logging in
                            accounts = {
                                id: newAccountId(),
                                facebookId: data.id,
                                name: data.name,
                                instagramData: backEndData
                            }
                            // console.log('[y]', account);
                            // accounts.push(account);
                            localStorage.setItem(accountsKey, JSON.stringify(accounts));
                        // }
                        return ok({
                            // ...account,
                            accounts,
                            token: generateJwtToken(accounts)
                        });

                    })
                }

                async function serverAuth(accessToken){
                    const backEndResponse = await axios.get(`${baseUrl}/profile/authenticate?access_token=${accessToken}`)
                    if(backEndResponse.status !== 201) {
                        return ok()
                    }
                    return backEndResponse.data
                }

                function getAccounts() {
                    if (!isLoggedIn()) return unauthorized();
                    return ok(accounts);
                }

                function getAccountById() {
                    if (!isLoggedIn()) return unauthorized();

                    let account = accounts.find(x => x.id === idFromUrl());
                    return ok(account);
                }

                function updateAccount() {
                    if (!isLoggedIn()) return unauthorized();

                    let params = body();
                    // let account = accounts.find(x => x.id === idFromUrl());

                    // update and save account
                    Object.assign(accounts, params);
                    localStorage.setItem(accountsKey, JSON.stringify(accounts));

                    return ok(accounts);
                }

                function deleteAccount() {
                    if (!isLoggedIn()) return unauthorized();

                    // delete account then save
                    // accounts = accounts.filter(x => x.id !== idFromUrl());
                    // localStorage.setItem(accountsKey, JSON.stringify(accounts));
                    localStorage.clear('vue-facebook-login-accounts');
                    return ok();
                }

                // helper functions
    
                function ok(body) {
                    // wrap in timeout to simulate server api call
                    // setTimeout(() => 
                        resolve({ status: 200, data: body })
                    // , 100);
                }

                function unauthorized() {
                    setTimeout(() => {
                        const response = { status: 401, data: { message: 'Unauthorized' } };
                        reject(response);
                        
                        // manually trigger error interceptor
                        const errorInterceptor = axios.interceptors.response.handlers[0].rejected;
                        errorInterceptor({ response });
                    }, 500);
                }

                function isLoggedIn() {
                    return accountService.accountValue;
                }

                function idFromUrl() {
                    const urlParts = url.split('/');
                    return parseInt(urlParts[urlParts.length - 1]);
                }

                function body() {
                    if (['post', 'put'].includes(method))
                        return params[0];
                }
                
                function newAccountId() {
                    return accounts.length ? Math.max(...accounts.map(x => x.id)) + 1 : 1;
                }
    
                function generateJwtToken(account) {
                    // create token that expires in 15 minutes
                    const tokenPayload = { 
                        exp: Math.round(new Date(Date.now() + 15*60*1000).getTime() / 1000),
                        id: account.id
                    }
                    return `fake-jwt-token.${btoa(JSON.stringify(tokenPayload))}`;
                }
            });
        }
    });
}
