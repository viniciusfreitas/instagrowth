// fonte: https://developers.facebook.com/docs/instagram-api/getting-started

const axios = require('axios');
const { response } = require('express');

async function fetchIgData(access_token){
    const fb_page = await fetchFbPages(access_token)
    // console.log('fb_page', fb_page)

    if(fb_page.id){
        const instagram_account = await fetchInstagramAccount(fb_page.id, access_token)
        // console.log('instagram_account', instagram_account)

        if(instagram_account.instagram_business_account.id){
            const instagram_data = await fetchInstagramData(instagram_account.instagram_business_account.id, access_token)
            // console.log('instagram_data', instagram_data)

            const stories = await fetchStories(instagram_account.instagram_business_account.id, access_token)
    
            // salvar no mongodb e responder com dados encontrados
            const data = { 
                'fb': fb_page,
                'ig_account': instagram_data,
                'stories': stories
            }
            return data
        }
    }
}

async function fetchFbPages(access_token){

    const url = `https://graph.facebook.com/v9.0/me/accounts?access_token=${access_token}`
    const resp = await makeFbApiRequest(url)
    if (resp.data.length) {
        return resp.data[0]
    } else {
        return null
    }
}

async function fetchInstagramAccount(fb_page_id, access_token) {

    const url = `https://graph.facebook.com/v9.0/${fb_page_id}?fields=instagram_business_account&access_token=${access_token}`
    const resp = await makeFbApiRequest(url)
    return (resp) ? resp : null

}

async function fetchInstagramData(ig_account_id, access_token) {

    // nome e foto de perfil da conta do instagram
    const url1 = `https://graph.facebook.com/v9.0/${ig_account_id}?fields=profile_picture_url,username&access_token=${access_token}`
    const resp1 = await makeFbApiRequest(url1)
    if(!resp1) return null

    const url = `https://graph.facebook.com/v9.0/${ig_account_id}?fields=business_discovery.username(${resp1.username}){followers_count,media_count,media}&access_token=${access_token}`
    const resp = await makeFbApiRequest(url)
    if(!resp) return null

    return Object.assign({}, resp1, resp.business_discovery)
}

// teste buscando stories
async function fetchStories(ig_account_id, access_token){

    const url = `https://graph.facebook.com/v9.0/${ig_account_id}/?fields=stories&access_token=${access_token}`
    let resp = await makeFbApiRequest(url)

    if(resp.stories.data) {
        resp = resp.stories.data
    } else {
        resp = [resp]
    }

    let arrayStoriesData = []

    if(resp.length > 0){
        var promiseArray = []
        resp.forEach(story => {
            console.log(story);
            promiseArray.push(new Promise(async (resolve, reject) => {
                return resolve( await fetchStoryUrl(story.id, access_token))
            }))
        })
        arrayStoriesData = await Promise.all(promiseArray)
    }
    return arrayStoriesData
}

// busca url de stories
async function fetchStoryUrl(media_id, access_token){

    const url = `https://graph.facebook.com/${media_id}?fields=media_url,permalink,media_type&access_token=${access_token}`
    const resp = await makeFbApiRequest(url)
    return (resp) ? resp : null

}

async function makeFbApiRequest(url) {
    try {
        const response = await axios.get(url)
        if(response.status == 200){
            return response.data
        }
    } catch(error) {
        console.error(JSON.stringify(error))
        return null
    }
}

module.exports = { fetchIgData, fetchInstagramData, fetchStories }