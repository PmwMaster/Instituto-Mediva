import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        atencaoPrimaria: resolve(import.meta.dirname, 'programas/atencao-primaria.html'),
        urgencias: resolve(import.meta.dirname, 'programas/urgencias.html'),
        doencasCronicas: resolve(import.meta.dirname, 'programas/doencas-cronicas.html'),
        saudeMental: resolve(import.meta.dirname, 'programas/saude-mental.html'),
        mulherCrianca: resolve(import.meta.dirname, 'programas/mulher-crianca.html'),
        teaTdah: resolve(import.meta.dirname, 'programas/tea-tdah.html')
      }
    }
  }
})
