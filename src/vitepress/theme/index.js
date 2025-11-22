import DefaultTheme from 'vitepress/theme'
import SubPages from './components/SubPages.vue'
import FullContents from './components/FullContents.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('SubPages', SubPages)
    app.component('FullContents', FullContents)
  }
}
