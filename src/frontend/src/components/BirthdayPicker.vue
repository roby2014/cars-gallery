<template>
    <div>
        <v-menu
            offset-y
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            transition="scale-transition"
            min-width="auto"
        >
            <template v-slot:activator="{ on, attrs }">
                <v-text-field
                    readonly
                    v-model="date"
                    :label="$t('register.birthday')"
                    prepend-icon="mdi-calendar"
                    v-bind="attrs"
                    v-on="on"
                ></v-text-field>
            </template>
            <v-date-picker
                v-model="date"
                :active-picker.sync="activePicker"
                :max="new Date().toISOString().substr(0, 10)"
                min="1950-01-01"
                @change="save"
            ></v-date-picker>
        </v-menu>
    </div>
</template>

<script>
export default {
    name: "BirthdayPicker",

    data() {
        return {
            activePicker: null,
            date: null,
            menu: false,
        };
    },

    watch: {
        menu(val) {
            val && setTimeout(() => (this.activePicker = "YEAR"));
        },
    },

    methods: {
        save(date) {
            this.$emit("datePicked", date);
        },
    },
};
</script>
