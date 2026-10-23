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
        // Capacitações em Saúde
        atencaoPrimaria: resolve(import.meta.dirname, 'programas/atencao-primaria.html'),
        urgencias: resolve(import.meta.dirname, 'programas/urgencias.html'),
        doencasCronicas: resolve(import.meta.dirname, 'programas/doencas-cronicas.html'),
        saudeMental: resolve(import.meta.dirname, 'programas/saude-mental.html'),
        mulherCrianca: resolve(import.meta.dirname, 'programas/mulher-crianca.html'),
        teaTdah: resolve(import.meta.dirname, 'programas/tea-tdah.html'),
        // Capacitações em Educação
        primeirosSocorrosEscolar: resolve(import.meta.dirname, 'programas/primeiros-socorros-escolar.html'),
        teaTdahEscolar: resolve(import.meta.dirname, 'programas/tea-tdah-escolar.html'),
        saudeMentalEscolar: resolve(import.meta.dirname, 'programas/saude-mental-escolar.html'),
        inclusaoNeurodiversidade: resolve(import.meta.dirname, 'programas/inclusao-neurodiversidade.html'),
        bullyingCulturaPaz: resolve(import.meta.dirname, 'programas/bullying-cultura-paz.html'),
        bemEstarEducador: resolve(import.meta.dirname, 'programas/bem-estar-educador.html')
      }
    }
  }
})
