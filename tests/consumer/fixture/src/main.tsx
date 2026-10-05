import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { createApp, nextTick } from 'vue'
import components from '../generated/react'
import Gallery from './Gallery.vue'
import './style.css'
import 'virtual:uno.css'

createApp(Gallery).mount('#app')
await nextTick()
createRoot(document.querySelector('#react-root')!).render(
  <>{[...document.querySelectorAll<HTMLElement>('[data-driver="react"]')].map((element) => {
    const name = element.dataset.name!
    const Component = components[name]!
    return createPortal(<Component className="glyph" size={64} title={element.dataset.copy === '0' ? name : undefined} />, element, `${name}-${element.dataset.copy}`)
  })}</>,
)
