import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import store from './vuex';

Vue.use(Vuetify);

/*
dark mode primary - 292939
darkmode2 - 313145
darkmode3 - 3a3150
lightmode primary - f2f3f6
lightmode 2 - e6e6ec
lightmode 3 - dadae3
blue logo primary - 2c57c0
blue 2 - 3e3fa6
blue 3 - 1E3B85
*/

export default new Vuetify({
    theme: {
        options: { customProperties: true },
        themes: {
            light: {
                primary: "#2c57c0",
                secondary: "#3e3fa6",
                background: "#eeeeee",
                reverse: "#313145",
                buttons: "#2c57c0",

                white: "#f2f3f6",
            },
            dark: {
                primary: "#2c57c0",
                secondary: "#3e3fa6",
                background: "#ffffff",
                reverse: "#e6e6ec",
                buttons: "#2c57c0",

                white: "#f2f3f6",
            },
        },
    },
});
