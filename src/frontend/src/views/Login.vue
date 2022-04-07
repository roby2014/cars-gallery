<template>
  <v-app id="inspire">
    <v-main>
      <!-- LOADING BOX IF API REQUEST IS BEING MADE -->
      <Loading
        :active.sync="loadingStatus"
        :color="isDarkTheme ? '#3e3fa6':'#ffffff'"
        :background-color="isDarkTheme ? '#292939':'#3e3fa6'"
        :opacity="0.5"
        blur
        :can-cancel="false"
        :is-full-page="true"
      />

      <!-- LOGIN BOX -->
      <v-layout
        align-center
        justify-center
        class="pt-12"
      >
        <v-flex
          xs9
          sm6
          md3
        >
          <v-card class="elevation-12">
            <v-toolbar
              rounded
              dark
              color="#2c57c0"
            >
              <v-toolbar-title>Login</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <!-- EMAIL -->
              <v-text-field
                label="Email"
                :rules="[rules.required]"
                prepend-icon="mdi-account"
                type="text"
                @input="handleInput($event, 'email')"
              />

              <!-- PASSWORD -->
              <v-text-field
                label="Password"
                :rules="[rules.required]"
                prepend-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                @keyup.enter="handleLogin"
                @input="handleInput($event, 'password')"
                @click:append="showPassword = !showPassword"
              />
            </v-card-text>
            <v-card-actions>
              <!-- NO ACCOUNT? BUTTON -->
              <router-link to="/register">
                <v-card-text>
                  {{ $t('login.register') }}
                </v-card-text>
              </router-link>

              <v-spacer />

              <!-- LOGIN BUTTON -->
              <v-btn
                depressed
                rounded
                dark
                right
                color="#2c57c0"
                @click="handleLogin()"
              >
                Login
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-main>
  </v-app>
</template>


<script>
import Loading from "vue-loading-overlay"
import "vue-loading-overlay/dist/vue-loading.css"

export default {
  name: 'Login',
  components: {Loading},

  data() {
    return {
      userLogin: {
        email: '',
        password: '',
      },

      showPassword: false,

      rules: {
        required: value => !!value || this.$t('login.required'),
      }
    }
  },

  computed: {
    loadingStatus() {
      return this.$store.getters.loadingStatus;
    },
    isDarkTheme() {
      //return this.$store.getters.isDarkTheme;
      return this.$vuetify.theme.dark;
    }
  },

  methods: {
    handleInput(e, m) {
      switch (m) {
        case 'email': {
          this.userLogin.email = e;
          break;
        }
        case 'password': {
          this.userLogin.password = e;
          break;
        }
      }
    },

    handleLogin() {
      if (this.userLogin.email && this.userLogin.password) {
        this.$store.dispatch('login', this.userLogin);
      } else {
        // trigger required rule.
      }
    },
  }

};
</script>

<style></style>
