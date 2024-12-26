<template>
  <main>
    <ul class="perspective-distant">
      <li
        v-for="route in projects"
        :key="route.name"
        class="transform-3d rotate-x-12 shadow-xl transition-all duration-500 hover:-translate-y-4 hover:rotate-x-[20deg] hover:rotate-z-3 hover:shadow-2xl"
      >
        <nuxt-link :to="route.path" class="!p-4">{{ route.name }}</nuxt-link>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import { projects } from './project'
</script>

<style scoped lang="scss">
main {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #5d5d5d;
}
a {
  color: #fff;
  text-decoration: none;
  font-size: 2rem;
  transition: all 0.3s;
  &:hover {
    color: blue;
  }
}
ul {
  list-style: none;
  display: flex;
  gap: 1rem;
  flex-direction: column;
}
</style>
