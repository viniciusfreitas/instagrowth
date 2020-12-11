<template>
    <div>

        <h2>{{userData.instagramData.ig_username}}</h2>
        <img :src=profile_picture_url alt="" id="profilePhoto">

        <h3>Total de seguidores <span class="badge rounded-pill bg-primary">{{userData.instagramData.ig_followers_count}}</span></h3>

        <ChartContainer />

        <Config />

        <br>
        <h3>Stories</h3>
        <div id="stories" v-if="userData.instagramData.stories">
            <img :src="story.media_url" class="storyImg" v-for="(story, index) in userData.instagramData.stories" :key="index" />
        </div>
        <div v-else>
            <p>Nenhum Story recente</p>
        </div>

        <button @click="deleteAccount(userData.id)" class="btn btn-sm btn-danger btn-delete-account" :disabled="userData.isDeleting">
            <span v-if="userData.isDeleting" class="spinner-border spinner-border-sm"></span>
            <span v-else>Sair</span>
        </button>

    </div>
</template>

<script>
import { accountService } from '@/_services';
import ChartContainer from '../components/ChartContainer'
import Config from '../components/Config'

export default {
    components: {
        ChartContainer,
        Config
    },
    data() {
        return {
            userData: null,
            profile_picture_url: null
        }
    },
    created() {
        this.userData = JSON.parse(localStorage.getItem('vue-facebook-login-accounts')),
        this.profile_picture_url = this.userData.instagramData.ig_profile_picture
    },
    methods: {
        deleteAccount(id) {
            console.log(id),
            localStorage.clear('vue-facebook-login-accounts')
            accountService.logout()
        }
    }
}
</script>

<style>
    #profilePhoto {
        border-radius: 50%;
        width: 100px;
        height: auto;
    }
    .storyImg {
        border: 2px solid #FFF;
        width: calc(100% / 4 - 8px);
        height: auto;
    }
</style>