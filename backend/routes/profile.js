const express = require('express')
const router = express.Router()
const { fetchIgData } = require('../fb_api')
const Profile = require('../models/profile')
const _ = require('lodash')
const { userScheduled } = require('../schedule')

router.get('/authenticate', async(req, res) => {
    if(req.query.access_token){

        const access_token = req.query.access_token

        try {
            let dataFromFB = await fetchIgData(access_token)

            if (dataFromFB) {
                dataFromFB = formatProfileDataToDB(dataFromFB)
                // busca no bd se registro já existe
                // se sim adiciona novos dados e atualiza no bd
                let profileDB = await Profile.findOne({ ig_account_id: dataFromFB.ig_account_id })
                if(profileDB) {
                    const updatedData = updateProfile(dataFromFB, profileDB)
                    await saveProfile(updatedData, res)
                } else {
                    // salva novo registro
                    await saveProfile(dataFromFB, res) // dentro da função já retorna sucesso ou erro para o frontend
                }
            } else {
                res.status(400).json({ error: 'Não foi possível buscar todas os dados!' })
            }
        } catch (err) {
            console.error('[try no fetchIgData] ', err);
            res.status(500).json({ error: { message: err.message } })
        }
    } else {
        res.status(400).json({ error: 'Token não informado!' })
    }

})

// configuração de atualização programada dos stories 
router.get('/config', async(req, res) => {
    if(req.query.access_token && req.query.stories_push && req.query.id){
        console.log(req.query);
        const access_token = req.query.access_token
        const storiesPush = req.query.stories_push
        const ig_account_id = req.query.id

        const resp = await userScheduled(access_token, storiesPush, ig_account_id)
        if(resp){
            console.log('[Rota Config 1]')
            res.status(200).json({ message: 'ok'})
        } else {
            console.log('[Rota Config 2]')
            res.status(400).json({ error: { message: 'Ocorreu um erro'}})
        }
    } else {
        console.log('[Rota Config 2]')
        res.status(400).json({ error: { message: 'Dados não informados'}})
    }
})

// Formata os resultados da busca no FB para serem salvos no BD
function formatProfileDataToDB(data) {

    return new Profile({
        fb_page_id: data.fb.id, // test null em todas
        fb_page_name: data.fb.name,
        access_token: data.fb.access_token,
        ig_account_id: data.ig_account.id,
        ig_profile_picture: data.ig_account.profile_picture_url,
        ig_username: data.ig_account.username,
        ig_followers_count: data.ig_account.followers_count,
        followers: [{
            date: Date.now(), 
            qtt: data.ig_account.followers_count 
        }],
        stories: data.stories
    })
}

async function saveProfile(data, response) {
    try {
        const profile = await data.save()
        response.status(201).json(profile)
    } catch (err) {
        response.status(500).json({ message: err.message })
    }
}

// Atualiza o profile encontrado no DB com novos dados
function updateProfile(dataFromFB, profileDB){
    profileDB.access_token = dataFromFB.access_token
    profileDB.ig_profile_picture = dataFromFB.ig_profile_picture
    profileDB.ig_followers_count = dataFromFB.ig_followers_count
    profileDB.followers = _.union(profileDB.followers, dataFromFB.followers)
    profileDB.stories = dataFromFB.stories
    return profileDB
}

module.exports = router