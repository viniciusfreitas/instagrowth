import { accountService } from '@/_services';

const facebookAppId = process.env.VUE_APP_FACEBOOK_APP_ID;

export function initFacebookSdk() {
    return new Promise(resolve => {
        // wait for facebook sdk to initialize before starting the vue app
        window.fbAsyncInit = function () {
            FB.init({
                appId: facebookAppId,
                cookie: true,
                xfbml: true,
                version: 'v9.0'
            });

            // auto authenticate with the api if already logged in with facebook
            FB.getLoginStatus(({ authResponse }) => {
                if (authResponse) {
                    accountService.apiAuthenticate(authResponse.accessToken).then(resolve);
                } else {
                    resolve();
                }
            });
        };

        // load facebook sdk script
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/pt_BR/sdk.js#xfbml=1&version=v9.0";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));    
    });
}