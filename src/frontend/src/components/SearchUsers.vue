<template>
  <div>
    <!-- DESKTOP -->
    <template>
      <v-autocomplete
        filled
        rounded
        dense
        solo
        color="reverse"
        v-model="model"
        :items="users"
        :loading="isLoading"
        :search-input.sync="search"
        hide-no-data
        hide-selected
        item-text="username"
        item-value="id"
        :label="$t('navbar.search')"
        append-icon="mdi-magnify"
        maxlength="32"
        return-object
        @change="(event) => redirectUser(event, model.id)"
      >
      </v-autocomplete>
    </template>
  </div>
</template>

<script>
import api from "../plugins/api";

export default {
  name: "SearchUsers",
  data() {
    return {
      entries: [],
      isLoading: false,
      model: null,
      search: null,
      users: []
    };
  },
  props: {
    
  },

  computed: {
    fields() {
      if (!this.model) return [];

      return Object.keys(this.model).map(key => {
        return {
          key,
          value: this.model[key] || "n/a"
        };
      });
    }
  },

  methods: {
    filter: function(item, queryText, itemText) {
      return (
        itemText.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1
      );
    },
    redirectUser() {
      this.$router.push('/profile/'+this.model.id)
      
    }
  },

  watch: {
    search(val) {
      if (this.users.length > 0) return;
      if (this.isLoading) return;
      this.isLoading = true;

      api.get("/users")
        .then(res => {
          this.count = res.data.length;
          this.entries = res.data;
          this.users = res.data
        })
        .catch(err => {
          console.log(err.response);
        })
        .finally(() => (this.isLoading = false));
    }
  }
};
</script>
