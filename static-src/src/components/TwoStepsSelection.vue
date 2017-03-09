<template>
    <div>
        <p><slot name='selected-label-text'>Selected option</slot>:
            {{ selectedOption }}
        </p>
        <slot name='available-label-text'>Available options</slot>
        <select v-model='preSelectedOption'>
            <option v-for='option in availableOptions' :value='option'>
            {{ option }}</option>
        </select>
        <button v-on:click='selectOption'>
            <slot name='select-button-text'>Select</slot>
        </button>
    </div>
</template>

<script>
export default {
    props: {
        availableOptions: {
            type: Array,
            default: function () {
                return []
            }
        },
        selectedOption: String
    },
    data: function () {
        return {
            preSelectedOption: this.selectedOption
        }
    },
    methods: {
        selectOption: function () {
            this.$emit("select-option", this.preSelectedOption);
        }
    }
}
</script>  
