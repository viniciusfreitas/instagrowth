<template>
    <div>

        <h2>Atualização do Stories</h2>

        <select class="form-select" @change="onChange($event)"  v-model="num">
            <option selected>Selecione quantas vezes ao dia deseja atualizar</option>
            <option value="1">Uma</option>
            <option value="2">Duas</option>
            <option value="3">Três</option>
            <option value="4">Quatro</option>
            <option value="5">Cinco</option>
        </select>

    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            num: null
        }
    },
    created() {
        this.num = 1// JSON.parse(localStorage.getItem('vue-facebook-login-accounts'))
    },
    methods: {
        onChange(event) {

            const dados = JSON.parse(localStorage.getItem('vue-facebook-login-accounts'))

            const id = dados.instagramData.ig_account_id
            const access_token = dados.instagramData.access_token
            const urlUpdate  = `http://localhost:3000/profile/config?id=${id}&stories_push=${event.target.value}&access_token=${access_token}`
            
            axios.get(urlUpdate).then((resp) => {
                console.log(resp)
            }).catch(function(e) {
                console.log(e); 
            })
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