import { Canvas } from './webgl/Canvas'

const canvas = new Canvas(document.querySelector<HTMLCanvasElement>('.home__canvas')!)

const mouse = document.querySelector<HTMLElement>('.home__mouse')!

window.addEventListener('mousemove', (e) => {
  mouse.style.setProperty('--x', `${e.clientX}px`)
  mouse.style.setProperty('--y', `${e.clientY}px`)
})
window.addEventListener('mousedown', (e) => {
  if (e.button === 0) mouse.classList.add('active')
})
window.addEventListener('mouseup', () => {
  mouse.classList.remove('active')
})
window.addEventListener('mouseleave', () => {
  mouse.classList.remove('active')
})

window.addEventListener('beforeunload', () => canvas.dispose())
