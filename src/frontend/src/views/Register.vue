<template>
  <v-app>
    <v-main>
      <!-- LOADING IF REGISTER API CALL IS BEING MADE -->
      <Loading
        blur
        :active.sync="loadingStatus"
        :color="isDarkTheme ? '#3e3fa6':'#ffffff'"
        :background-color="isDarkTheme ? '#292939':'#3e3fa6'"
        :opacity="0.1"
        :can-cancel="false"
        :is-full-page="true"
      />

      <!-- REGISTER BOX -->
      <v-layout align-center justify-center class="pt-12 mb-6">
        <v-flex xs11 sm8 md5>
          <v-card class="elevation-12">
            <!-- TITLE BOX -->
            <v-toolbar rounded dark color="#2c57c0">
              <v-toolbar-title>
                {{ $t("register.new_account") }}</v-toolbar-title
              >
            </v-toolbar>
            <v-card-text>
              <!-- NAME -->
              <v-text-field
                :label="$t('register.name')"
                :rules="[rules.required, rules.name]"
                @input="handleInput($event, 'name')"
                prepend-icon="mdi-account"
                type="text"
                color="reverse"
                :hint="$t('register.name_hint')"
              >
              </v-text-field>

              <!-- USERNAME -->
              <v-text-field
                :label="$t('register.username')"
                :rules="[rules.required, rules.name]"
                @input="handleInput($event, 'username')"
                prepend-icon="mdi-account"
                type="text"
                color="reverse"
                :hint="$t('register.name_hint')"
              >
              </v-text-field>

              <!-- EMAIL -->
              <v-text-field
                label="Email"
                :rules="[rules.required, rules.email]"
                @input="handleInput($event, 'email')"
                prepend-icon="mdi-at"
                color="reverse"
                type="text"
              >
              </v-text-field>

              <!-- BIRTHDAY -->
              <BirthdayPicker @datePicked="userLogin.birthday = $event" />

              <!-- COUNTRY -->
              <v-autocomplete
                cache-items
                flat
                hide-no-data
                hide-details
                item-text
                v-model="select_country"
                :items="c_names"
                :search-input.sync="searchCountry"
                :label="$t('register.country')"
                :rules="[rules.required]"
                @input="handleInput($event, 'country')"
                prepend-icon="mdi-flag"
                type="text"
                color="reverse"
                class="mb-5"
              >
                <!-- item selected -->
                <template v-slot:selection="{ item }">
                  
                  {{ item }}
                  <v-img
                    max-width="40px"
                    :src="
                      'https://www.countryflags.io/' +
                        getImgFlag(item) +
                        '/flat/64.png'
                    "
                    width="8%"
                    class="ml-2 mr-2"
                  />
                </template>
                <!-- all items in the list -->
                <template v-slot:item="{ item }">
                  <v-img
                    max-width="40px"
                    :src="
                      'https://www.countryflags.io/' +
                        getImgFlag(item) +
                        '/flat/64.png'
                    "
                    width="10%"
                    class="mr-2"
                  />
                  {{ item }}
                </template>
              </v-autocomplete>

              <!-- PASSWORD -->
              <v-text-field
                counter
                label="Password"
                :rules="[rules.required, rules.password]"
                :hint="$t('register.password_hint')"
                prepend-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                @click:append="showPassword = !showPassword"
                @input="handleInput($event, 'password')"
                v-on:keyup.enter="handleRegister"
                color="reverse"
                :loading="!!this.userLogin.password.length"
              >
                <template v-if="this.userLogin.password.length" v-slot:progress>
                  <v-progress-linear
                    absolute
                    :value="progress"
                    :color="color"
                    height="3"
                  ></v-progress-linear>
                </template>
              </v-text-field>
            </v-card-text>

            <v-card-actions>
              <!-- IF YOU ALREADY HAVE AN ACCOUNT -->
              <router-link to="/login">
                <v-card-text>
                  {{ $t("register.login") }}
                </v-card-text>
              </router-link>

              <v-spacer></v-spacer>

              <!-- REGISTER BUTTNO -->
              <v-btn
                depressed
                rounded
                dark
                color="#2c57c0"
                @click="handleRegister"
              >
                {{ $t("register.register") }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-main>
  </v-app>
</template>

<script>
import BirthdayPicker from "../components/BirthdayPicker.vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";

export default {
  name: "Register",

  components: {
    BirthdayPicker,
    Loading,
  },

  data() {
    return {
      userLogin: {
        name: "",
        email: "",
        birthday: new Date(),
        country: "", // not country, but code country!
        password: "",
        username: "",
      },

      showPassword: false,

      // countries
      c_names: [],
      c_siglas: [],

      // for autocomplete
      select_country: null,
      filter_countries: [],

      rules: {
        required: (value) => !!value || this.$t("login.required"),
        name: (value) =>
          (!!value && value.length >= 4) || this.$t("register.name_short"),
        email: (value) => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || this.$t("register.invalid_email");
        },
        password: (value) => {
          return (!!value && value.length >= 8) || this.$t("register.pw_short");
        },
      },
    };
  },

  mounted() {
    // get countries from json
    var json = require("../utils/countries.json");
    for (var key in json) {
      if (Object.prototype.hasOwnProperty.call(json, key)) {
        this.c_siglas.push(key);
        this.c_names.push(json[key]);
      }
    }
  },

  methods: {
    handleInput(e, m) {
      switch (m) {
        case "name": {
          this.userLogin.name = e;
          break;
        }
        case "email": {
          this.userLogin.email = e;
          break;
        }
        case "country": {
          this.userLogin.country = this.getCountryCode(e);
          break;
        }
        case "password": {
          this.userLogin.password = e;
          break;
        }
        case "username": {
          this.userLogin.username = e;
          break;
        }
      }
    },

    handleRegister() {
      if (
        this.userLogin.email &&
        this.userLogin.name &&
        this.userLogin.country &&
        this.userLogin.password &&
        this.userLogin.username
      ) {
        this.$store.dispatch("register", this.userLogin);
      } else {
        // trigger required rule.
      }
    },

    getImgFlag(item) {
      var json = require("../utils/countries.json");
      let country_code = Object.keys(json).find((key) => json[key] === item);
      return country_code.toLowerCase();
    },

    getCountryCode(countryname) {
      var json = require("../utils/countries.json");
      return Object.keys(json).find((key) => json[key] === countryname);
    },

    querySelections(v) {
      this.filter_countries = this.c_names.filter((e) => {
        return (e || "").toLowerCase().indexOf((v || "").toLowerCase()) > -1;
      });
    },
  },

  watch: {
    searchCountry(val) {
      val && val !== this.select_country && this.querySelections(val);
    },
  },

  computed: {
    progress() {
      return Math.min(100, this.userLogin.password.length * 14);
    },
    color() {
      return ["error", "warning", "success"][Math.floor(this.progress / 50)];
    },
    loadingStatus() {
      return this.$store.getters.loadingStatus;
    },
    isDarkTheme() {
      return this.$vuetify.theme.dark;//return this.$store.getters.isDarkTheme;
    }
  },
};
</script>

<style></style>
