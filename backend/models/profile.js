const Mongoose = require('mongoose')

const profileSchema = new Mongoose.Schema({
    fb_page_id: {
        type: String,
        require: true
    },
    fb_page_name:  {
        type: String,
        require: true
    },
    access_token:  {
        type: String,
        require: true
    },
    ig_account_id:  {
        type: String,
        unique: true,
        require: true
    },
    ig_profile_picture: String,
    ig_username: String,
    ig_followers_count: Number,
    followers: [{ date: Date, qtt: Number }],
    stories: [{ id: String, media_url: String, media_type: String }],
    storiesConfig: {
        type: Number,
        defaul: 0
    }
})

module.exports = Mongoose.model('Profile', profileSchema)
