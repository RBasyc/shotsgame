<script setup lang="ts">
    import { ref } from 'vue';

    const showMenu = ref(true);
</script>

<template>
    <div id="app">
        <div class="crt-overlay"></div>

        <!-- 测试菜单 -->
        <div v-if="showMenu" class="game-menu">
            <h1 class="menu-title neon-text">
                SHOTSGAME
            </h1>
            <button class="btn-retro neon-border">
                寻找对战
            </button>
        </div>
    </div>
</template>

<style>
    @import './styles/game.css';

    #app {
        width: 100vw;
        height: 100vh;
        background: #0F0F23;
    }
</style>
