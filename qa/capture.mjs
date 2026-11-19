import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const port = 9228
const outputDir = new URL('./', import.meta.url)
const profileDir = fileURLToPath(new URL('./chrome-profile-current/', import.meta.url))
await mkdir(profileDir, { recursive: true })

const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profileDir}`,
  'about:blank',
], { stdio: 'ignore' })

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function getPage() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`)
      const pages = await response.json()
      const page = pages.find((item) => item.type === 'page')
      if (page?.webSocketDebuggerUrl) return page
    } catch {}
    await wait(200)
  }
  throw new Error('Chrome DevTools endpoint did not become ready')
}

const page = await getPage()
const socket = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

let messageId = 0
const pending = new Map()
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (!message.id || !pending.has(message.id)) return
  const { resolve, reject } = pending.get(message.id)
  pending.delete(message.id)
  if (message.error) reject(new Error(message.error.message))
  else resolve(message.result)
})

function send(method, params = {}) {
  messageId += 1
  const id = messageId
  socket.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
}

async function capture(name, width, height, selector = null, progress = 0, waitMs = 4900, route = '') {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url: `http://127.0.0.1:5173/${route}` })
  await wait(waitMs)
  await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true })

  if (selector) {
    await send('Runtime.evaluate', {
      expression: `(() => {
        const element = document.querySelector(${JSON.stringify(selector)})
        if (!element) throw new Error('Missing selector: ${selector}')
        document.documentElement.style.scrollBehavior = 'auto'
        if (${JSON.stringify(selector)} === '.hero-overlap') {
          scrollTo({ top: innerHeight * ${progress}, behavior: 'instant' })
          return
        }
        const top = element.getBoundingClientRect().top + scrollY
        const travel = Math.max(element.offsetHeight - innerHeight, 0)
        scrollTo({ top: top + travel * ${progress}, behavior: 'instant' })
      })()`,
    })
    await wait(500)
    if (selector === '.orbit-services') {
      const points = [[.12,.2],[.3,.12],[.52,.18],[.78,.28],[.88,.5],[.73,.76],[.48,.84],[.22,.72]]
      for (const [x, y] of points) {
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: Math.round(width * x), y: Math.round(height * y) })
        await wait(70)
      }
    }
    if (selector === '.project-masonry') {
      const hover = await send('Runtime.evaluate', {
        expression: `(() => {
          const rect = document.querySelector('.project-image').getBoundingClientRect()
          return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        })()`,
        returnByValue: true,
      })
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: Math.round(hover.result.value.x), y: Math.round(hover.result.value.y) })
      await wait(700)
    }
  }

  const screenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
  await writeFile(new URL(name, outputDir), Buffer.from(screenshot.data, 'base64'))
}

try {
  await send('Page.enable')
  await send('Runtime.enable')
  await capture('reference-loader-cdp.png', 1440, 1000, null, 0, 700)
  await capture('reference-desktop-cdp.png', 1440, 1000)
  await capture('reference-hero-cover-cdp.png', 1440, 1000, '.hero-overlap', .48)
  await capture('reference-about-cdp.png', 1440, 1000, '.about', 0)
  await capture('reference-metrics-cdp.png', 1440, 1000, '.metrics', 0)
  await capture('reference-work-cdp.png', 1440, 1000, '.work', 0, 4900, '#/projects')
  await capture('reference-masonry-cdp.png', 1440, 1000, '.project-masonry', 0, 4900, '#/projects')
  await send('Runtime.evaluate', { expression: "document.querySelector('.project-card button').click()" })
  await wait(800)
  const desktopModalShot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
  await writeFile(new URL('reference-desktop-modal-cdp.png', outputDir), Buffer.from(desktopModalShot.data, 'base64'))
  await send('Runtime.evaluate', { expression: "document.querySelector('.case-nav button').click()" })
  await capture('reference-orbit-cdp.png', 1440, 1000, '.orbit-services', .48)
  await capture('reference-contact-cdp.png', 1440, 1000, '.contact', 0)
  await capture('reference-mobile-cdp.png', 390, 844)
  await send('Runtime.evaluate', { expression: "document.querySelector('a[href=\"#/home/about\"]').click()" })
  await wait(120)
  const samePageTransitionStarts = await send('Runtime.evaluate', {
    expression: "document.documentElement.classList.contains('same-page-transition')",
    returnByValue: true,
  })
  await wait(1250)
  const samePageTransitionNavigates = await send('Runtime.evaluate', {
    expression: "location.hash === '#/home/about' && document.documentElement.classList.contains('same-page-transition') === false",
    returnByValue: true,
  })
  await capture('reference-mobile-work-cdp.png', 390, 844, '.work', 0, 4900, '#/projects')

  const layout = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      innerWidth,
      bodyWidth: document.body.scrollWidth,
      projectCards: document.querySelectorAll('.project-card').length,
      videos: document.querySelectorAll('video').length,
      loaderPresent: Boolean(document.querySelector('.loader'))
    })`,
    returnByValue: true,
  })
  await send('Runtime.evaluate', { expression: "document.querySelector('a[href=\"#/home/about\"]').click()" })
  await wait(120)
  const transitionStarts = await send('Runtime.evaluate', {
    expression: "Boolean(document.querySelector('.page-transition.is-covering'))",
    returnByValue: true,
  })
  await wait(900)
  const transitionNavigates = await send('Runtime.evaluate', {
    expression: "location.hash === '#/home/about'",
    returnByValue: true,
  })
  await wait(500)
  await send('Runtime.evaluate', { expression: "document.querySelector('a[href=\"#/projects\"]').click()" })
  await wait(1550)
  await send('Runtime.evaluate', { expression: "document.querySelector('.project-card button').click()" })
  await wait(120)
  const interaction = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('.case-modal')
      const layer = document.querySelector('.case-layer')
      const media = document.querySelector('.case-image')
      const mediaImage = document.querySelector('.case-media img')
      const landscapeCards = [...document.querySelectorAll('.project-card:not(.is-portrait) .project-image')].map((node) => {
        const rect = node.getBoundingClientRect()
        return [Math.round(rect.width), Math.round(rect.height)]
      })
      const portraitCards = [...document.querySelectorAll('.project-card.is-portrait .project-image')].map((node) => {
        const rect = node.getBoundingClientRect()
        return rect.width / rect.height
      })
      const filterButtons = [...document.querySelectorAll('.filters button')]
      const rect = modal?.getBoundingClientRect()
      return {
        caseOpens: Boolean(layer),
        modalFits: Boolean(rect && rect.width < innerWidth && rect.height < innerHeight),
        backdropBlur: layer ? getComputedStyle(layer).backdropFilter : '',
        mediaScrollable: Boolean(media && media.scrollHeight > media.clientHeight && getComputedStyle(media).overflowY === 'auto'),
        mediaObjectFit: mediaImage ? getComputedStyle(mediaImage).objectFit : '',
        mediaFilter: mediaImage ? getComputedStyle(mediaImage).filter : '',
        equalLandscapeCardSizes: new Set(landscapeCards.map((size) => size.join('x'))).size === 1,
        portraitCardsAreNineSixteen: portraitCards.length === 5 && portraitCards.every((ratio) => Math.abs(ratio - 9 / 16) < 0.02),
        borderlessFilters: filterButtons.length === 10 && filterButtons.every((button) => getComputedStyle(button).borderTopWidth === '0px'),
        splitIndependentSites: document.querySelectorAll('.project-card[id^="project-category-8-"]').length === 2,
        splitAiVideos: document.querySelectorAll('.project-card[id^="project-category-9-"]').length === 5,
        hasPreviousAndNext: document.querySelectorAll('.case-navigation button').length === 2
      }
    })()`,
    returnByValue: true,
  })
  const modalShot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
  await writeFile(new URL('reference-mobile-modal-cdp.png', outputDir), Buffer.from(modalShot.data, 'base64'))
  console.log('layout-check', layout.result.value)
  console.log('interaction-check', JSON.stringify({ samePageTransitionStarts: samePageTransitionStarts.result.value, samePageTransitionNavigates: samePageTransitionNavigates.result.value, transitionStarts: transitionStarts.result.value, transitionNavigates: transitionNavigates.result.value, ...interaction.result.value }))
} finally {
  socket.close()
  chrome.kill()
}
