const CronJob = require('cron').CronJob
const moment = require('moment')
const ProfileForCron = require('./models/profile')
const { fetchInstagramData, fetchStories } = require('./fb_api')

// function schedule(period) {
//     var job = new CronJob(period, function() {
//         const d = new Date()
//         const formatteddatestr = moment(d).format('MMMM Do YYYY, h:mm:ss a')
//         console.log(formatteddatestr)

//     }, null, true, 'America/Sao_Paulo')
//     job.start()
// }
// schedule('*/5 * * * * *')

async function daily() {
    var job = new CronJob('0 0 0 * * *', async function() {
 
        const profiles = await ProfileForCron.find()
        if(profiles){
            profiles.forEach(async profile => {
                let followers = await fetchInstagramData(profile.ig_account_id, profile.access_token)
                profile.followers.push({ date: Date.now(), qtt: followers.followers_count })
                await profile.save()
            })
        }

    }, null, true, 'America/Sao_Paulo')
    job.start()
}

async function userScheduled(access_token, storiesPush, ig_account_id) {
    const periodo = periodoCalc(storiesPush)

    var job = new CronJob(periodo, async function() {
        try {
            let profile = await ProfileForCron.find({ ig_account_id: ig_account_id })
            try {
                const stories = await fetchStories(ig_account_id, access_token)
                profile.stories = stories
                profile.storiesConfig = storiesPush
                try {
                    await profile.save()
                    return true
                } catch (e) {
                    console.error(1);
                    return false
                }
            } catch (e) {
                console.error(2);
                return false
            }
        } catch (e) {
            console.error(3);
            return false
        }
    }, null, true, 'America/Sao_Paulo')
    job.start()
}

function periodoCalc(num) {
    const t  = 24 / num
    return `0 */${t} * * * *`
}




module.exports = { daily, userScheduled }