<template>
  <div class="pt-15" :class="[ $vuetify.breakpoint.width < 615 ? 'divMobile': 'divDesktop']">
    <v-card style="margin: auto" class="elevation-12" width="700px">
      <!-- TABS -->
      <v-tabs
        centered
        dark
        icons-and-text
        v-model="tab"
        background-color="primary"
        @click="resetFields"
      >
        <v-tabs-slider color="white"></v-tabs-slider>
        <v-tab v-for="(tab, index) in tabs" :key="'tab' + index">
          {{ tab.name }}
          <v-icon> {{ tab.icon }}</v-icon>
        </v-tab>
      </v-tabs>

      <Loading
        :active.sync="loadingStatus"
        :color="isDarkTheme ? '#3e3fa6' : '#ffffff'"
        :background-color="isDarkTheme ? '#292939' : '#3e3fa6'"
        :opacity="0.5"
        blur
        :can-cancel="false"
        :is-full-page="true"
      />

      <!-- PHOTO + VIDEO TABS -->
      <v-tabs-items v-model="tab">
        <!-- PHOTO -->
        <v-tab-item>
          <v-container class="uploadTab">
            <v-row v-if="!img.image && !img.imageUrl">
              <v-col class="mb-5">
                <v-icon color="reverse" size="40" class="mb-2">
                  mdi-cloud-upload
                </v-icon>
                <br />
                <v-btn class="uploadBtn" @click="$refs.fileInputImg.click()">
                  {{ $t("new.upload_pic") }}
                </v-btn>
                <input
                  style="display: none"
                  type="file"
                  accept="image/*"
                  @change="onImgUpload"
                  ref="fileInputImg"
                />
              </v-col>
            </v-row>

            <v-row v-if="img.imageUrl && img.image" class="pa-5">
              <v-col cols="12" md="6" sm="6">
                <!-- PREVIEW -->
                <v-card class="elevation-2">
                  <v-img :src="img.imageUrl"></v-img>
                  <v-card-title> {{ title }}</v-card-title>

                  <v-card-subtitle class="pt-1">
                    <v-row class="pa-3">
                      <div style="max-width: 100%; overflow-wrap: break-word">
                        {{ description }}
                      </div>
                    </v-row>
                  </v-card-subtitle>

                  <!-- MORE BUTTON + ICON -->
                  <v-card-actions>
                    <v-btn color="orange lighten-2" text>
                      {{ this.$t("more") }}</v-btn
                    >
                    <v-spacer></v-spacer>
                    <v-btn icon @click="showMore = !showMore">
                      <v-icon>{{
                        showMore ? "mdi-chevron-up" : "mdi-chevron-down"
                      }}</v-icon>
                    </v-btn>
                  </v-card-actions>

                  <!-- TAGS AND DATE (WHAT MORE?) -->
                  <v-expand-transition>
                    <div v-show="showMore">
                      <v-divider></v-divider>
                      <v-card-text>
                        <span> Tags: </span>
                        <v-btn
                          rounded
                          v-for="(tag, index) in tags"
                          :key="'tag' + index"
                          :value="tag"
                          style="font-size: 13px"
                          class="ma-1 pa-3"
                        >
                          {{ tag }}
                        </v-btn>
                      </v-card-text>
                      <div class="caption grey--text pa-2">
                        {{ $t("new.posted_at") }} {{ getTodayDate() }}
                      </div>
                    </div>
                  </v-expand-transition>
                </v-card>
              </v-col>

              <v-col>
                <!-- TITLE -->
                <v-text-field
                  outlined
                  color="reverse"
                  v-model="title"
                  :rules="[rules.required]"
                  :label="$t('new.title')"
                  ref="postTitle"
                ></v-text-field>

                <!-- DESC -->
                <v-textarea
                  no-resize
                  color="reverse"
                  outlined
                  v-model="description"
                  :rules="[rules.maxSizeDesc]"
                  :label="$t('new.description')"
                ></v-textarea>

                <!-- TAGS -->
                <v-selectize
                  multiple
                  placeholder="Tags"
                  label="Tags"
                  v-model="tags"
                  :options="tags.length ? tags : []"
                  @input="showTags"
                />

                <!-- POST/CANCEL -->
                <div class="buttonsPostCancel">
                  <v-btn color="success" @click="onPost">
                    {{ $t("new.post") }}</v-btn
                  >
                  <v-btn color="error" @click="onCancelPost">
                    {{ $t("new.cancel") }}</v-btn
                  >
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-tab-item>

        <!-- VIDEO -->
        <v-tab-item>
          <v-container class="uploadTab">
            <v-row v-if="!vid.video && !vid.videoUrl">
              <v-col class="mb-5">
                <v-icon color="reverse" size="40" class="mb-2">
                  mdi-cloud-upload
                </v-icon>
                <br />
                <v-btn class="uploadBtn" @click="$refs.fileInputVideo.click()">
                  {{ $t("new.upload_vid") }}</v-btn
                >
                <input
                  style="display: none"
                  type="file"
                  accept="video/*"
                  @change="onVidUpload"
                  ref="fileInputVideo"
                />
              </v-col>
            </v-row>

            <v-row v-if="vid.videoUrl && vid.video" class="pa-5">
              <v-col cols="12" md="6" sm="6">
                <!-- PREVIEW -->
                <v-card class="elevation-2">
                  <video width="320" controls>
                    <source :src="vid.videoUrl" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  <v-card-title> {{ title }}</v-card-title>
                  <v-card-subtitle class="pt-1">
                    <v-row class="pa-3">
                      <div style="max-width: 100%; overflow-wrap: break-word">
                        {{ description }}
                      </div>
                    </v-row>
                  </v-card-subtitle>

                  <!-- MORE BUTTON + ICON -->
                  <v-card-actions>
                    <v-btn color="orange lighten-2" text>
                      {{ this.$t("more") }}</v-btn
                    >
                    <v-spacer></v-spacer>
                    <v-btn icon @click="showMore = !showMore">
                      <v-icon>{{
                        showMore ? "mdi-chevron-up" : "mdi-chevron-down"
                      }}</v-icon>
                    </v-btn>
                  </v-card-actions>

                  <!-- TAGS AND DATE (WHAT MORE?) -->
                  <v-expand-transition>
                    <div v-show="showMore">
                      <v-divider></v-divider>
                      <v-card-text>
                        <span> Tags: </span>
                        <v-btn
                          rounded
                          v-for="(tag, index) in tags"
                          :key="'tag' + index"
                          :value="tag"
                          style="font-size: 13px"
                          class="ma-1 pa-3"
                        >
                          {{ tag }}
                        </v-btn>
                      </v-card-text>
                      <div class="caption grey--text pa-2">
                        {{ $t("new.posted_at") }} {{ getTodayDate() }}
                      </div>
                    </div>
                  </v-expand-transition>
                </v-card>
              </v-col>

              <v-col>
                <!-- TITLE -->
                <v-text-field
                  outlined
                  v-model="title"
                  :rules="[rules.required]"
                  label="Title"
                  ref="postTitle"
                ></v-text-field>

                <!-- DESC -->
                <v-textarea
                  no-resize
                  outlined
                  v-model="description"
                  label="Description"
                ></v-textarea>

                <!-- TAGS -->
                <v-selectize
                  multiple
                  placeholder="Tags"
                  label="Tags"
                  v-model="tags"
                  :options="tags.length ? tags : []"
                  @input="showTags"
                />

                <!-- POST/CANCEL -->
                <div class="buttonsPostCancel">
                  <v-btn color="success" @click="onPost"> Post</v-btn>
                  <v-btn color="error" @click="onCancelPost"> Cancel</v-btn>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </div>
</template>


<script>
import "selectize/dist/css/selectize.default.css";
import VSelectize from "@isneezy/vue-selectize";

import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";

export default {
  name: "UploadPost",

  components: {
    VSelectize,
    Loading,
  },

  data() {
    return {
      title: "",
      description: "",
      tags: [],
      showMore: false,

      img: {
        image: null,
        imageUrl: null,
      },
      vid: {
        video: null,
        videoUrl: null,
      },

      tab: null,
      tabs: [
        { name: this.$t("new.photo"), icon: "mdi-camera" },
        { name: this.$t("new.video"), icon: "mdi-video" },
      ],

      rules: {
        required: (value) => !!value || this.$t("login.required"),
        maxSizeDesc: (value) => value.length <= 48 || "",
      },
    };
  },

  computed: {
    loadingStatus() {
      return this.$store.getters.loadingStatus;
    },
    isDarkTheme() {
      //return this.$store.getters.isDarkTheme;
      return this.$vuetify.theme.dark;
    },
  },

  methods: {
    resetFields() {
      this.title = "";
      this.description = "";
      this.tags = [];
      this.img.image = null;
      this.img.imageUrl = null;
      this.vid.video = null;
      this.vid.videoUrl = null;
    },

    showTags() {
      this.showMore = this.tags.length ? true : false;
    },

    onImgUpload(e) {
      const file = e.target.files[0];

      console.log(e.target);

      if (file.type !== "image/jpeg" && file.type !== "image/png") {
        this.$swal(this.$t("error"), this.$t("new.not_supported_pic"), "error");
        return;
      }

      if (file.size > 10000000) {
        this.$swal(this.$t("error"), this.$t("new.too_big"), "error");
        return;
      }

      this.img.image = file;
      this.img.imageUrl = URL.createObjectURL(file);
    },

    onVidUpload(e) {
      const file = e.target.files[0];

      if (file.type !== "video/mp4") {
        this.$swal("Error", this.$t("new.not_supported_vid"), "error");
        return;
      }

      if (file.size > 10000000) {
        this.$swal("Error", this.$t("new.too_big"), "error");
        return;
      }

      this.vid.video = file;
      this.vid.videoUrl = URL.createObjectURL(file);
    },

    async onPost() {
      if (!this.title) {
        this.errorSwal(this.$t("no_title"));
        this.$refs["postTitle"].$refs.input.focus();
        return;
      }

      this.$store.dispatch("createPost", {
        title: this.title,
        content: this.description,
        file: this.img.image || this.vid.video,
        tags: this.tags,
      });
    },

    onPostVid() {
      if (this.title) {
        // post video :)
      } else {
        this.errorSwal(this.$t("no_title"));
        this.$refs["postTitle"].$refs.input.focus();
      }

      console.log("title:" + this.title + " description: " + this.description);
    },

    errorSwal(desc) {
      this.$swal(this.$t("error"), desc, "error");
    },

    onCancelPost() {
      this.$swal
        .fire({
          title: this.$t("new.cancel_post"),
          icon: "question",
          confirmButtonText: this.$t("yes"),
          cancelButtonText: this.$t("no"),
          showCancelButton: true,
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.img.image = null;
            this.img.imageUrl = null;
            this.vid.video = null;
            this.vid.videoUrl = null;
            this.title = "";
            this.description = "";
            this.tags = "";
            this.$swal.fire(
              this.$t("new.cancelled"),
              this.$t("new.post_canceled"),
              "success"
            );
          }
        });
    },

    errorSwal(desc) {
      this.$swal(this.$t("error"), desc, "error");
    },

    getTodayDate() {
      const months = [
        this.$t("months.january"),
        this.$t("months.february"),
        this.$t("months.march"),
        this.$t("months.april"),
        this.$t("months.may"),
        this.$t("months.june"),
        this.$t("months.july"),
        this.$t("months.august"),
        this.$t("months.september"),
        this.$t("months.october"),
        this.$t("months.november"),
        this.$t("months.december"),
      ];
      const d = new Date();
      let date = d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
      console.log('date:'+date)
      return date;
    },
  },
};
</script>

<style>

.divMobile {
  height: 150%;
}

.divDesktop {
  height: 100vh;
}

.uploadTab {
  display: inline;
  text-align: center;
}

.uploadBtn:hover {
  transform: scale(1.1);
}

.buttonsPostCancel .v-btn {
  float: right;
  margin: 5px;
}

.buttonsPostCancel .v-btn:hover {
  transform: scale(1.1);
}
</style>
