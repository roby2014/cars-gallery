<template>
  <div style="height: 100vh">
    <div v-if="!user">
      <Loading
        :active.sync="loadingStatus"
        :color="isDarkTheme ? '#3e3fa6':'#ffffff'"
        :background-color="this.$vuetify.theme.dark ? '#292939' : '#3e3fa6'"
        :opacity="1"
        blur
        :can-cancel="false"
        :is-full-page="true"
      />
    </div>
    <div v-else>
      <Loading
        :active.sync="loadingStatus"
        :color="isDarkTheme ? '#3e3fa6' : '#ffffff'"
        :background-color="isDarkTheme ? '#292939' : '#3e3fa6'"
        :opacity="1"
        blur
        :can-cancel="false"
        :is-full-page="true"
      />
      <div>
        <v-row class="pt-15 pb-15">
          <v-card
            class="mx-auto"
            :width="getWidth()"
          >
            <!-- HEADER (TITLE) -->
            <v-toolbar flat color="primary" dark>
              <v-toolbar-title> {{ tabs[selectedTab].name }}</v-toolbar-title>
            </v-toolbar>

            <v-tabs :vertical="$vuetify.breakpoint.width >= 1250">
              <!-- TABS (LEFT) -->
              <v-tab
                class="my-1"
                v-for="(tab, index) in tabs"
                v-model="selectedTab"
                :key="'tab' + index"
                @click="selectedTab = index"
              >
                <v-icon left>{{ tab.icon }}</v-icon>
                {{ tab.name }}
              </v-tab>

              <!-- v-tab-item deteta automaticamente que tab é que estamos, logo n vale a pena fazer ifs, é so meter na ordem correta -->

              <!-- IF SELECTED TAB == GENERAL SETTINGS -->
              <v-tab-item>
                <v-container
                  style="width: 98%"
                  class="rounded-card ma-2 grey lighten-4"
                >
                  <v-card flat class="transparent px-3">
                    <!-- LANGUAGE -->
                    <v-row>
                      <v-col md="4">
                        <div class="caption grey--text">
                          {{ $t("language") }}
                        </div>
                        <div>
                          <v-select
                            :items="langs"
                            solo
                            outlined
                            item-text="name"
                            style="width: 100vw"
                            :value="
                              this.$i18n.locale === 'pt'
                                ? 'Português'
                                : 'English'
                            "
                            @change="handleLanguage"
                          >
                            <template v-slot:item="slot">
                              <i :class="['mr-2', 'em', slot.item.emoji]"></i>
                              {{ slot.item.name }}
                            </template>
                          </v-select>
                        </div>
                      </v-col>
                    </v-row>

                    <!-- THEME -->
                    <v-row wrap>
                      <v-col md="4">
                        <div class="caption grey--text">{{ $t("theme") }}</div>
                        <v-text-field
                          outlined
                          solo
                          readonly
                          :value="
                            isDarkTheme
                              ? this.$t('themes.dark')
                              : this.$t('themes.light')
                          "
                          style="width: 100vw"
                          :append-icon="
                            isDarkTheme
                              ? 'mdi-lightbulb-outline'
                              : 'mdi-lightbulb'
                          "
                          @click:append="toggleTheme()"
                          @click="toggleTheme()"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-container>
              </v-tab-item>

              <!-- IF SELECTED TAB == PROFILE SETTINGS -->
              <v-tab-item>
                <v-container
                  style="width: 98%"
                  class="rounded-card ma-2 grey lighten-4"
                >
                  <v-card flat class="transparent px-3">
                    <v-row>
                      <!-- CHANGE AVATAR? -->
                      <v-col>
                        <v-flex class="mb-4">
                          <div class="caption grey--text pb-2">Avatar</div>
                          <v-avatar size="96" class="mr-4">
                            <v-img
                              :src="authorAvatar"
                              :lazy-src="authorAvatar"
                              alt="avatar"
                            />
                          </v-avatar>

                          <v-btn @click="$refs.fileInputImg.click()">
                            {{ $t("change_avatar") }}
                          </v-btn>
                          <input
                            style="display: none"
                            type="file"
                            accept="image/*"
                            @change="onImgUpload"
                            ref="fileInputImg"
                          />
                        </v-flex>
                      </v-col>

                      <!-- BIO -->
                      <v-col cols="12" md="6">
                        <div class="caption grey--text pb-2">Bio</div>
                        <v-textarea
                          solo
                          no-resize
                          v-model="newBio"
                          :label="user.bio !== null ? user.bio : this.$t('profile_settings.bio_desc')"
                          @input="bioInput"
                        ></v-textarea>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-expand-transition>
                      <div v-if="smtChanged" class="pa-3 ">
                        <v-btn class="mr-5" color="success" @click="handleBioAvatar">
                          {{ $t("save_changes") }}</v-btn
                        >
                        <v-btn color="error" @click="cancelBioAvatar">
                          {{ $t("cancel") }}</v-btn
                        >
                      </div></v-expand-transition>
                    </v-row>
                  </v-card>
                </v-container>
              </v-tab-item>

              <!-- IF SELECTED TAB == ACCOUNT SETTINGS -->
              <v-tab-item>
                <v-container
                  style="width: 98%"
                  class="rounded-card ma-2 grey lighten-4"
                >
                  <v-card flat class="transparent px-3">
                    <!--- DIALOG IF USER WANTS TO CHANGE SOME FIELD -->
                    <v-dialog @click:outside="cleanInput" v-model="changeFieldDialog" width="auto ">
                      <v-card
                        width="400px"
                        :height="
                          changeFieldType !== 'password' ? '250px' : '320px'
                        "
                      >
                        <v-card-title> {{ this.insertPhrase }}</v-card-title>
                        <template v-if="changeFieldType !== 'password'">
                          <v-text-field
                            v-model="newFieldInput"
                            outlined
                            :label="
                              $t('profile_settings.new') + ' ' + changeFieldType
                            "
                            class="pa-4"
                          >
                          </v-text-field>
                        </template>
                        <template v-else>
                          <!-- CURRENT PASSWORD -->
                          <v-text-field
                            v-model="currentPassword"
                            outlined
                            @click:append="
                              showCurrentPassword = !showCurrentPassword
                            "
                            :append-icon="
                              showCurrentPassword ? 'mdi-eye' : 'mdi-eye-off'
                            "
                            :type="showCurrentPassword ? 'text' : 'password'"
                            :label="$t('profile_settings.current_password')"
                            class="pr-4 pl-4 pt-4"
                          >
                          </v-text-field>

                          <!-- NEW PASSWORD -->
                          <v-text-field
                          v-model="newPassword"
                            @click:append="showNewPassword = !showNewPassword"
                            :rules="[rules.password]"
                            :append-icon="
                              showNewPassword ? 'mdi-eye' : 'mdi-eye-off'
                            "
                            :type="showNewPassword ? 'text' : 'password'"
                            outlined
                            :label="$t('profile_settings.new_password')"
                            class="pr-4 pl-4"
                          >
                          </v-text-field>
                        </template>

                        <!-- BUTTONS DONE OR CANCEL -->
                        <div>
                          <v-row justify="center" style="width: 100%">
                            <v-col cols="4">
                              <v-btn color="success" @click="handleDone">
                                {{ $t("change") }}</v-btn
                              ></v-col
                            >
                            <v-col cols="4">
                              <v-btn
                                color="error"
                                @click="cleanInput"
                              >
                                {{ $t("new.cancel") }}</v-btn
                              >
                            </v-col>
                          </v-row>
                        </div>
                      </v-card>
                    </v-dialog>

                    <!-- NAME -->
                    <v-row wrap>
                      <v-col>
                        <div class="caption grey--text">
                          {{ $t("register.name") }}
                        </div>
                        <div style="color: black">{{ this.user.name }}</div>
                      </v-col>
                      <v-col class="pt-4">
                        <v-btn
                          tile
                          @click="
                            handleChangeField(
                              $event,
                              $t('profile_settings.name')
                            )
                          "
                        >
                          {{ $t("profile_settings.change_name") }}
                        </v-btn>
                      </v-col>
                    </v-row>

                    <!-- USERNAME -->
                    <v-row wrap>
                      <v-col>
                        <div class="caption grey--text">Username</div>
                        <div style="color: black">{{ this.user.username }}</div>
                      </v-col>
                      <v-col class="pt-4">
                        <v-btn
                          tile
                          @click="
                            handleChangeField(
                              $event,
                              $t('profile_settings.username')
                            )
                          "
                        >
                          {{ $t("profile_settings.change_username") }}
                        </v-btn>
                      </v-col>
                    </v-row>

                    <!-- EMAIL -->
                    <v-row wrap>
                      <v-col>
                        <div class="caption grey--text">Email</div>
                        <div style="color: black">{{ this.user.email }}</div>
                      </v-col>
                      <v-col class="pt-4">
                        <v-btn
                          tile
                          @click="
                            handleChangeField(
                              $event,
                              $t('profile_settings.email')
                            )
                          "
                        >
                          {{ $t("profile_settings.change_email") }}
                        </v-btn>
                      </v-col>
                    </v-row>

                    <!-- PASSWORD -->
                    <v-row wrap>
                      <v-col>
                        <div class="caption grey--text">Password</div>
                        <div style="color: black">*******</div>
                      </v-col>
                      <v-col class="pt-4">
                        <v-btn
                          tile
                          @click="
                            handleChangeField(
                              $event,
                              $t('profile_settings.password')
                            )
                          "
                        >
                          {{ $t("profile_settings.change_password") }}
                        </v-btn>
                      </v-col>
                    </v-row>

                    <!-- DELETE ACCOUNT? -->
                    <v-row wrap class="pt-7 pb-4">
                      <v-col>
                        <v-btn @click="onDeleteAccount" color="error">
                          {{ $t("profile_settings.delete_account") }}
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-container>
              </v-tab-item>
            </v-tabs>
          </v-card>
        </v-row>
      </div>
    </div>
  </div>
</template>

<script>
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";

export default {
  name: "ProfileSettings",

  components: {
    Loading,
  },

  data() {
    return {
      user: null,
      smtChanged: false,
      newBio: "",
      authorAvatar: "",
      img: {
        image: null, 
        imageUrl: null, 
      },
      changeFieldDialog: false,
      changeFieldType: "",
      insertPhrase: "",
      showNewPassword: false,
      showCurrentPassword: false,
      newFieldInput: "", // will be user new email or username or name
      currentPassword: "",
      newPassword: "",
      rules: {
        password: (value) => {
          return (!!value && value.length >= 8) || this.$t("register.pw_short");
        },
      },
      tabs: [
        { name: this.$t("profile_settings.general_sett"), icon: "mdi-cog" }, // General settings
        { name: this.$t("profile_settings.profile_sett"), icon: "mdi-account" }, // Profile settings
        { name: this.$t("profile_settings.account_sett"), icon: "mdi-lock" }, // Account settings
      ],
      langs: [
        { name: "English", code: "en", emoji: "em-flag-gb", flag: "uk.svg" },
        { name: "Português", code: "pt", emoji: "em-flag-pt", flag: "pt.svg" },
      ],
      themes: [
        { name: this.$t("themes.light") },
        { name: this.$t("themes.dark") },
      ],
      selectedTab: 0,
    };
  },

  async mounted() {
    this.user = await this.$store.dispatch("getUser", this.$store.state.user.id);
    console.dir(this.user)
    this.authorAvatar = await this.$store.dispatch("getUserAvatar", this.$store.state.user.id);
  },

  methods: {
    handleLanguage(e) {
      let newLanguage = e === "Português" ? "pt" : "en";
      this.$i18n.locale = newLanguage;
      localStorage.setItem("lang", newLanguage);
      this.$router.go(); //refresh page
    },

    handleChangeField(e, field) {
      this.changeFieldDialog = true;
      this.changeFieldType = field;
      let _insertphrase = "profile_settings.insert_";

      // very horrible fix (to fix name translation and title)
      if (field === "name" || field === "nome")
        _insertphrase = _insertphrase + "name";
      else _insertphrase = _insertphrase + this.changeFieldType;
      this.insertPhrase = this.$t(_insertphrase);
    },

    onImgUpload(e) {
      const file = e.target.files[0];

      if (file.type !== "image/jpeg" && file.type !== "image/png") {
        this.$swal(this.$t("error"), this.$t("new.not_supported_pic"), "error");
        return;
      }

      if (file.size > 300000) {
        this.$swal(this.$t("error"), this.$t("new.too_big"), "error");
        return;
      }

      this.img.image = file;
      this.img.imageUrl = URL.createObjectURL(file);
      this.authorAvatar = this.img.imageUrl;
      this.smtChanged = true;
    },

    getWidth() {
      switch(this.$vuetify.breakpoint.name) {
        case 'md': return '55%'; break;
        case 'xl': return '55%'; break;
        case 'sm': return '95%'; break;
        case 'lg': return '80%'; break;
        case 'xs': return '99%'; break;
      }
    },

    async cancelBioAvatar() {
      this.smtChanged = false;
      this.newBio = ''; 
      this.img.image = null; 
      this.img.imageUrl = null; // TODO USER IMAGE NOT null
      this.authorAvatar = await this.$store.dispatch("getUserAvatar", this.$store.state.user.id);
    },

    bioInput() {
      this.smtChanged = true;
    },

    handleBioAvatar() {
      if (!this.smtChanged) {
        return;
      }

      if (this.newBio) {
        this.$store.dispatch("updateUserProfile", { bio: this.newBio });
      }

      if (this.img.image) {
        this.$store.dispatch("updateUserAvatar", this.img.image);
      }

      this.smtChanged = false 
    },

    cleanInput() {
      this.newFieldInput = ''
      this.currentPassword = ''
      this.newPassword = ''
      this.changeFieldDialog = false
    },

    async handleDone() {
      if (this.changeFieldType !== "password" && !this.newFieldInput) {
        this.errorSwal(this.$t("profile_settings.no_input"));
        return;
      }

      switch (this.changeFieldType) {
        case "nome":
        case "name": {
          if (this.newFieldInput.length < 4) {
            this.errorSwal(this.$t("register.name_short"));
            return;
          }
          this.user = await this.$store.dispatch("updateUserProfile", { name: this.newFieldInput });
          break;
        }
        case "email": {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (!pattern.test(this.newFieldInput)) {
            this.errorSwal(this.$t("register.invalid_email"));
            return;
          }

          this.user = await this.$store.dispatch("updateUserProfile", { email: this.newFieldInput })
          break;
        }
        case "username": {
          if (this.newFieldInput.length < 4) {
            this.errorSwal(this.$t("register.name_short"));
            return;
          } else if (this.newFieldInput === this.$store.state.user.username) {
            return; // same nick name
          }

          this.user = await this.$store.dispatch("updateUserProfile", { username: this.newFieldInput });
          break;
        }
        case "senha":
        case "password": {
          if (!this.currentPassword) return;
          if (this.newPassword.length < 8 || !this.newPassword) {
            this.errorSwal(this.$t("register.pw_short"));
            return;
          }
          this.user = await this.$store.dispatch("updateUserProfile", { newPassword: this.newPassword, oldPassword: this.currentPassword })
          break;
        }
      }
      this.changeFieldDialog = false
    },

    errorSwal(desc) {
      this.$swal(this.$t("error"), desc, "error");
    },

    toggleTheme() { 
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      this.$store.commit('SET_DARK_THEME', this.$vuetify.theme.dark);
    },

    onDeleteAccount() {
      this.$swal
        .fire({
          title: this.$t("profile_settings.delete_acc"),
          icon: "question",
          confirmButtonText: this.$t("yes"),
          cancelButtonText: this.$t("no"),
          showCancelButton: true,
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.$store.dispatch("deleteUser");
          }
        });
    },
  },

  computed: {
    loadingStatus() {
      return this.$store.getters.loadingStatus;
    },
    isDarkTheme() {
      return this.$vuetify.theme.dark;//return this.$store.getters.isDarkTheme;
    }
  },
};
</script>

<style scoped>
.rounded-card {
  border-radius: 20px;
}
</style>
