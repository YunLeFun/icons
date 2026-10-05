import { Icon } from '@iconify/vue'
import icon from '@yunlefun/icons/icons/brand-mark'
import { createApp, h } from 'vue'

createApp({ render: () => h(Icon, { icon, width: 64, height: 64 }) }).mount('#app')
