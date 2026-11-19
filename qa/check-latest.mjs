import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const port = 9229
const profileDir = fileURLToPath(new URL('./chrome-profile-latest/', import.meta.url))
await mkdir(profileDir, { recursive: true })
const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${profileDir}`, 'about:blank'], { stdio: 'ignore' })
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

try {
  let page
  for (let attempt = 0; attempt < 30 && !page; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`)
      page = (await response.json()).find((item) => item.type === 'page')
    } catch {}
    if (!page) await wait(100)
  }
  if (!page) throw new Error('Chrome did not start')

  const socket = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  let id = 0
  const pending = new Map()
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data)
    if (!message.id || !pending.has(message.id)) return
    const callback = pending.get(message.id)
    pending.delete(message.id)
    message.error ? callback.reject(new Error(message.error.message)) : callback.resolve(message.result)
  })
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    id += 1
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })

  await send('Page.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url: 'http://127.0.0.1:5173/#/projects' })
  await wait(6200)
  const result = await send('Runtime.evaluate', {
    expression: `(() => {
      const cards = [...document.querySelectorAll('.project-card')]
      const cardSizes = cards.map((node) => {
        const rect = node.querySelector('.project-image').getBoundingClientRect()
        return [Math.round(rect.width), Math.round(rect.height)]
      })
      const filters = [...document.querySelectorAll('.filters button')]
      const ids = cards.map((card) => card.id)
      const covers = Object.fromEntries(cards.map((card) => {
        const media = card.querySelector('img,video')
        return [card.querySelector('.project-title b')?.textContent, {
          src: media?.getAttribute('src'),
          objectViewBox: media ? getComputedStyle(media).objectViewBox : null,
          objectPosition: media ? getComputedStyle(media).objectPosition : null,
        }]
      }))
      const columnTops = [...document.querySelectorAll('.project-column')].map((column) => {
        const card = column.querySelector('.project-card')
        const image = card?.querySelector('.project-image')
        return {
          card: Math.round(card?.getBoundingClientRect().top || 0),
          image: Math.round(image?.getBoundingClientRect().top || 0),
          transform: card ? getComputedStyle(card).transform : null,
          imageTransform: image ? getComputedStyle(image).transform : null,
          imageMarginTop: image ? getComputedStyle(image).marginTop : null,
          cardClass: card?.className || null,
        }
      })
      return {
        projectCount: cards.length,
        portraitCount: document.querySelectorAll('.project-card.is-portrait').length,
        allCardsSameSize: new Set(cardSizes.map((size) => size.join('x'))).size === 1,
        filterCount: filters.length,
        borderlessFilters: filters.every((button) => getComputedStyle(button).borderTopWidth === '0px'),
        independentCount: ids.filter((value) => value.startsWith('project-category-8-')).length,
        aiVideoCount: ids.filter((value) => value.startsWith('project-category-9-')).length,
        columnTops,
        firstRowAligned: columnTops.length === 2 && Math.abs(columnTops[0].image - columnTops[1].image) <= 1,
        covers,
      }
    })()`,
    returnByValue: true,
  })
  const screenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
  await writeFile(new URL('reference-latest-projects.png', import.meta.url), Buffer.from(screenshot.data, 'base64'))
  for (const [filter, filename] of [['跨境listing视觉', 'reference-latest-listing-covers.png'], ['产品详情页', 'reference-latest-detail-covers.png'], ['产品包装', 'reference-latest-packaging-cover.png'], ['独立站设计', 'reference-latest-website-covers.png']]) {
    await send('Runtime.evaluate', { expression: `[...document.querySelectorAll('.filters button')].find((button) => button.textContent === ${JSON.stringify(filter)})?.click()` })
    await wait(1000)
    const filteredScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
    await writeFile(new URL(filename, import.meta.url), Buffer.from(filteredScreenshot.data, 'base64'))
    if (filter === '产品详情页') {
      await send('Runtime.evaluate', { expression: `window.scrollTo(0, 650)` })
      await wait(1000)
      const lowerScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
      await writeFile(new URL('reference-latest-detail-covers-lower.png', import.meta.url), Buffer.from(lowerScreenshot.data, 'base64'))
      await send('Runtime.evaluate', { expression: `window.scrollTo(0, 0)` })
      await wait(300)
    }
  }
  await send('Runtime.evaluate', { expression: `[...document.querySelectorAll('.filters button')].find((button) => button.textContent === '全部')?.click()` })
  await wait(600)
  await send('Runtime.evaluate', { expression: `document.querySelector('#project-category-2-project-1 .project-image').click()` })
  await wait(700)
  await send('Runtime.evaluate', { expression: `(() => { const figure = [...document.querySelectorAll('.case-media')].find((node) => node.querySelector('figcaption span')?.textContent === '节庆KV海报'); figure?.scrollIntoView({ block: 'start' }); return Boolean(figure) })()` })
  await wait(1000)
  const detailResult = await send('Runtime.evaluate', {
    expression: `(() => { const figure = [...document.querySelectorAll('.case-media')].find((node) => node.querySelector('figcaption span')?.textContent === '节庆KV海报'); const image = figure?.querySelector('img'); return { found: Boolean(image), objectViewBox: image ? getComputedStyle(image).objectViewBox : null } })()`,
    returnByValue: true,
  })
  await send('Runtime.evaluate', { expression: `document.querySelector('.case-nav button').click(); document.querySelector('#project-category-3-project-1 .project-image').click()` })
  await wait(700)
  const aigcResult = await send('Runtime.evaluate', {
    expression: `(() => { const captions = [...document.querySelectorAll('.case-media figcaption')]; return { titles: captions.map((node) => node.querySelector('span')?.textContent), subtitles: captions.map((node) => node.querySelector('small')?.textContent), hasNumberedTitle: captions.some((node) => /^\\d/.test(node.querySelector('span')?.textContent || '')) } })()`,
    returnByValue: true,
  })
  await send('Runtime.evaluate', { expression: `document.querySelector('.case-nav button').click(); document.querySelector('#project-category-6-project-1 .project-image').click()` })
  await wait(700)
  const allTitleResult = await send('Runtime.evaluate', {
    expression: `(() => { const captions = [...document.querySelectorAll('.case-media figcaption')]; return { count: captions.length, bilingualCount: captions.filter((node) => node.querySelector('span') && node.querySelector('small')).length, titles: captions.map((node) => node.querySelector('span')?.textContent), subtitles: captions.map((node) => node.querySelector('small')?.textContent) } })()`,
    returnByValue: true,
  })
  await send('Runtime.evaluate', { expression: `document.querySelector('.case-image').scrollTop = 0` })
  await wait(300)
  const titleScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
  await writeFile(new URL('reference-latest-detail-titles.png', import.meta.url), Buffer.from(titleScreenshot.data, 'base64'))
  await send('Runtime.evaluate', { expression: `document.querySelector('a[href="#/home/top"]').click()` })
  await wait(1600)
  const homeResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const cards = [...document.querySelectorAll('.hero-deck .deck-card')]
      const sourceByTitle = Object.fromEntries(cards.map((card) => [card.querySelector('span')?.textContent, card.querySelector('img,video')?.getAttribute('src')]))
      return { cardCount: cards.length, sourceByTitle, orbitCount: document.querySelectorAll('.orbit-card').length }
    })()`,
    returnByValue: true,
  })
  await send('Runtime.evaluate', { expression: `document.querySelector('a[href="#/home/about"]').click()` })
  await wait(1600)
  const aboutResult = await send('Runtime.evaluate', {
    expression: `(() => ({ navGap: getComputedStyle(document.querySelector('.site-header nav')).gap, navSize: getComputedStyle(document.querySelector('.site-header nav a')).fontSize, skills: [...document.querySelectorAll('.skill-item small')].map((node) => node.textContent), skillCount: document.querySelectorAll('.skill-item').length }))()`,
    returnByValue: true,
  })
  const aboutScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
  await writeFile(new URL('reference-latest-about-skills.png', import.meta.url), Buffer.from(aboutScreenshot.data, 'base64'))
  console.log(JSON.stringify({ projects: result.result.value, detail: detailResult.result.value, aigc: aigcResult.result.value, allTitles: allTitleResult.result.value, home: homeResult.result.value, about: aboutResult.result.value }, null, 2))
  socket.close()
} finally {
  chrome.kill()
}
