<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/stores/main.js'

const store = useMainStore()
const { clearWinners } = store
const { winners } = storeToRefs(store)
</script>

<template>
  <section class="winners">
    <h2 class="winners__title">Список победителей</h2>
    <template v-if="winners.length">
      <table class="table">
        <thead class="table__header">
          <tr>
            <th class="table__hearder-name">Имя</th>
            <th class="table__hearder-time">Время</th>
            <th class="table__hearder-mode">Режим</th>
          </tr>
        </thead>
        <tbody class="table__body">
          <tr v-for="winner in winners" class="table__row">
            <td>{{ winner.name }}</td>
            <td class="table__time">{{ winner.time }} сек.</td>
            <td class="table__mode">{{ winner.mode }}</td>
          </tr>
        </tbody>
      </table>
      <button @click="clearWinners" type="button" class="winners__button-clear">
        Очистить список
      </button>
    </template>
    <template v-else>
      <p>Список победителей пуст</p>
    </template>
  </section>
</template>

<style scoped>
.winners {
  margin: 0 auto;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.winners__button-clear:active {
  border: 4px inset #fff;
}
.table {
  max-width: 500px;
  font-size: 1.1em;
  border-radius: 6px;
  border-collapse: collapse;
  overflow-wrap: anywhere;
}
.table th,
.table td {
  padding: 6px;
  border: 2px solid #555;
}
.table__header {
  text-align-last: left;
}
.table__hearder-name {
  min-width: 60px;
  overflow-wrap: normal;
}
.table__hearder-name,
.table__hearder-time,
.table__hearder-mode {
  overflow-wrap: normal;
}
.table__mode {
  text-transform: capitalize;
}
.winners__button-clear {
  margin-top: 12px;
  padding: 6px 12px;
  cursor: pointer;
  font: inherit;
  background-color: #e4e4e4;
  border-radius: 4px;
  border: 4px outset #fff;
}
</style>
