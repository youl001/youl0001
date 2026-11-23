import { useEffect, useMemo, useRef, useState } from 'react'
import portfolioData from './portfolioData.generated.json'

const legacyProjects = [
  { id: 'c4d-scene', title: 'C4D 场景搭建渲染', en: 'C4D Scene Rendering', group: 'C4D 场景', scope: '国内 / 跨境', year: '2026', image: '/assets/portfolio/c4d-scene-thumb.jpg', detailImage: '/assets/portfolio/c4d-scene-detail.jpg', tone: 'tone-base', services: '场景搭建 / 材质灯光 / 产品渲染', count: '完整项目展示', brief: '围绕产品材质与使用氛围完成场景搭建、灯光设计和商业级渲染，呈现可直接用于电商传播的产品视觉。' },
  { id: 'domestic-kv', title: '国内 KV 海报视觉', en: 'Domestic KV Poster', group: 'KV 海报', scope: '国内电商', year: '2026', image: '/assets/portfolio/domestic-kv-thumb.jpg', detailImage: '/assets/portfolio/domestic-kv-detail.jpg', tone: 'tone-orange', services: '主题策划 / KV 视觉 / 延展海报', count: '多主题海报', brief: '根据节日、活动与产品卖点构建统一主视觉，并延展适用于电商会场和品牌传播的系列海报。' },
  { id: 'crossborder-kv', title: '跨境 KV 海报视觉', en: 'Cross-border KV Poster', group: 'KV 海报', scope: '跨境电商', year: '2026', image: '/assets/portfolio/crossborder-kv-thumb.jpg', detailImage: '/assets/portfolio/crossborder-kv-detail.jpg', tone: 'tone-violet', services: 'Banner / KV / 营销视觉', count: '多套营销视觉', brief: '面向海外销售场景完成信息层级、产品利益点和氛围视觉整合，兼顾转化效率与品牌统一性。' },
  { id: 'makeup-remover', title: '卸妆油详情页设计', en: 'Cleansing Oil Detail Page', group: '详情页设计', scope: '国内电商', year: '2026', image: '/assets/portfolio/makeup-remover-thumb.jpg', detailImage: '/assets/portfolio/makeup-remover-detail.jpg', tone: 'tone-green', services: '详情页策略 / 卖点梳理 / 页面设计', count: '完整详情页', brief: '以自然、舒缓的视觉语言梳理产品成分与使用体验，建立清晰且具有信任感的购买阅读路径。' },
  { id: 'floor-washer', title: '洗地机详情页设计', en: 'Floor Washer Detail Page', group: '详情页设计', scope: '国内电商', year: '2026', image: '/assets/portfolio/floor-washer-thumb.jpg', detailImage: '/assets/portfolio/floor-washer-detail.jpg', tone: 'tone-orange', services: '详情页策略 / 功能可视化 / 场景设计', count: '完整详情页', brief: '将机械结构、清洁能力与使用场景转化为直观视觉模块，帮助用户快速理解核心功能。' },
  { id: 'neck-fan', title: '挂脖风扇详情页设计', en: 'Neck Fan Detail Page', group: '详情页设计', scope: '国内电商', year: '2026', image: '/assets/portfolio/neck-fan-thumb.jpg', detailImage: '/assets/portfolio/neck-fan-detail.jpg', tone: 'tone-silver', services: '详情页策略 / 功能图解 / 场景视觉', count: '完整详情页', brief: '通过轻盈清凉的色彩与功能图解，集中呈现佩戴体验、风道设计和多场景使用优势。' },
  { id: 'shower-system', title: '花洒详情页设计', en: 'Shower System Detail Page', group: '详情页设计', scope: '国内 / 跨境', year: '2026', image: '/assets/portfolio/shower-system-thumb.jpg', detailImage: '/assets/portfolio/shower-system-detail.jpg', tone: 'tone-base', services: '详情页策略 / 材质表现 / 空间场景', count: '完整详情页', brief: '以简洁空间、材质特写和水流效果表现产品质感，强化舒适沐浴与安装使用信息。' },
  { id: 'welding-pliers', title: '电焊钳详情页设计', en: 'Welding Pliers Detail Page', group: '详情页设计', scope: '国内电商', year: '2026', image: '/assets/portfolio/welding-pliers-thumb.jpg', detailImage: '/assets/portfolio/welding-pliers-detail.jpg', tone: 'tone-red', services: '详情页策略 / 工业视觉 / 参数表达', count: '完整详情页', brief: '以强对比工业视觉呈现绝缘、安全与耐用性能，让专业参数和产品结构更容易被理解。' },
  { id: 'independent-store', title: '户外独立站设计', en: 'Outdoor Independent Store', group: '独立站设计', scope: '跨境电商', year: '2026', image: '/assets/portfolio/independent-store-thumb.jpg', detailImage: '/assets/portfolio/independent-store-detail.jpg', tone: 'tone-green', services: '独立站 / 页面系统 / 品牌视觉', count: '整站视觉方案', brief: '围绕户外品类构建沉浸式品牌页面系统，兼顾产品展示、内容阅读与跨境转化路径。' },
  { id: 'aigc-model', title: 'AIGC 模特应用', en: 'AIGC Model Application', group: 'AIGC 模特', scope: '服饰内容', year: '2026', image: '/assets/portfolio/aigc-model-thumb.jpg', detailImage: '/assets/portfolio/aigc-model-detail.jpg', tone: 'tone-pink', services: '模特生成 / 场景统一 / 商品适配', count: '多组模特场景', brief: '根据服饰调性生成统一的人物、造型与场景素材，快速扩展不同风格与市场的商品内容。' },
  { id: 'product-retouch', title: '产品摄影与精修', en: 'Product Photography & Retouching', group: '摄影精修', scope: '产品视觉', year: '2026', image: '/assets/portfolio/product-retouch-thumb.jpg', detailImage: '/assets/portfolio/product-retouch-detail.jpg', tone: 'tone-silver', services: '产品拍摄 / 光影塑造 / 商业精修', count: '多品类作品', brief: '围绕材质、结构和光影进行产品拍摄与商业精修，统一画面质感并突出产品细节。' },
  { id: 'packaging', title: '产品包装设计', en: 'Product Packaging Design', group: '包装设计', scope: '品牌视觉', year: '2026', image: '/assets/portfolio/packaging-thumb.jpg', detailImage: '/assets/portfolio/packaging-detail.jpg', tone: 'tone-orange', services: '包装视觉 / 信息排版 / 应用延展', count: '多套包装方案', brief: '从品牌气质和货架识别出发完成包装视觉设计，并建立可延展到传播物料的统一语言。' },
  { id: 'white-noise', title: '白噪声睡眠机', en: 'White Noise Machine', group: 'Amazon 视觉', scope: 'Amazon Listing', year: '2026', image: '/assets/portfolio/white-noise-thumb.jpg', detailImage: '/assets/portfolio/white-noise-detail.jpg', tone: 'tone-orange', services: '主附图 / Listing / A+ 页面', count: '完整 Amazon 项目', brief: '通过温暖睡眠场景、功能图解与规格信息，构建适配 Amazon Listing 和 A+ 的完整购买叙事。' },
  { id: 'retro-speaker', title: '复古蓝牙音箱', en: 'Retro Bluetooth Speaker', group: 'Amazon 视觉', scope: 'Amazon Listing', year: '2026', image: '/assets/portfolio/retro-speaker-thumb.jpg', detailImage: '/assets/portfolio/retro-speaker-detail.jpg', tone: 'tone-orange', services: '主附图 / Listing / A+ 页面', count: '完整 Amazon 项目', brief: '围绕复古造型、音质结构与生活方式场景完成主附图和 A+ 页面视觉设计。' },
  { id: 'air-duster', title: '压缩空气除尘器', en: 'Compressed Air Duster', group: 'Amazon 视觉', scope: 'Amazon Listing', year: '2026', image: '/assets/portfolio/air-duster-thumb.jpg', detailImage: '/assets/portfolio/air-duster-detail.jpg', tone: 'tone-violet', services: '主附图 / Listing / A+ 页面', count: '完整 Amazon 项目', brief: '通过动力结构、配件说明与应用场景强化产品性能卖点，形成清晰有力的跨境销售页面。' },
  { id: 'glass-blender', title: '厨房玻璃搅拌机', en: 'Glass Jar Blender', group: 'Amazon 视觉', scope: 'Amazon Listing', year: '2026', image: '/assets/portfolio/glass-blender-thumb.jpg', detailImage: '/assets/portfolio/glass-blender-detail.jpg', tone: 'tone-orange', services: '主附图 / Listing / A+ 页面', count: '完整 Amazon 项目', brief: '以食材场景、容量信息和多功能表现建立直观的产品卖点层级，适配 Amazon 转化阅读。' },
  { id: 'video-bottle', title: '保温水瓶 AI 视频', en: 'Insulated Bottle AI Film', group: 'AI 产品视频', scope: 'AI 影像', year: '2026', image: '/assets/portfolio/video-bottle-poster.jpg', video: '/assets/portfolio/video-bottle.mp4', tone: 'tone-base', services: '创意脚本 / AI 生成 / 视频剪辑', count: '产品短片', brief: '通过生成式影像构建保温水瓶的使用场景与产品氛围，完成节奏简洁的电商短片。' },
  { id: 'video-pet-mat', title: '宠物冰垫 AI 视频', en: 'Pet Cooling Mat AI Film', group: 'AI 产品视频', scope: 'AI 影像', year: '2026', image: '/assets/portfolio/video-pet-cooling-mat-poster.jpg', video: '/assets/portfolio/video-pet-cooling-mat.mp4', tone: 'tone-violet', services: '创意脚本 / AI 生成 / 视频剪辑', count: '产品短片', brief: '围绕夏日降温需求生成宠物使用情境，用轻松直观的镜头展示冰垫卖点。' },
  { id: 'video-pet-feeder', title: '宠物喂食器 AI 视频', en: 'Pet Feeder AI Film', group: 'AI 产品视频', scope: 'AI 影像', year: '2026', image: '/assets/portfolio/video-pet-feeder-poster.jpg', video: '/assets/portfolio/video-pet-feeder.mp4', tone: 'tone-pink', services: '创意脚本 / AI 生成 / 视频剪辑', count: '产品短片', brief: '以日常陪伴与智能喂养为核心，组合宠物、产品和生活场景完成短视频表达。' },
  { id: 'video-goggles', title: '儿童泳镜 AI 视频', en: 'Kids Goggles AI Film', group: 'AI 产品视频', scope: 'AI 影像', year: '2026', image: '/assets/portfolio/video-kids-goggles-poster.jpg', video: '/assets/portfolio/video-kids-goggles.mp4', tone: 'tone-green', services: '创意脚本 / AI 生成 / 视频剪辑', count: '产品短片', brief: '通过明亮活泼的泳池场景呈现佩戴体验、防水性能与儿童产品氛围。' },
  { id: 'video-earbuds', title: '蓝牙耳机 AI 视频', en: 'Wireless Earbuds AI Film', group: 'AI 产品视频', scope: 'AI 影像', year: '2026', image: '/assets/portfolio/video-earbuds-poster.jpg', video: '/assets/portfolio/video-earbuds.mp4', tone: 'tone-silver', services: '创意脚本 / AI 生成 / 视频剪辑', count: '产品短片', brief: '结合科技质感、运动场景与产品特写，完成适合电商和社媒传播的耳机短片。' },
]

const { categories: projectCategories, projects } = portfolioData

const assetUrl = (path) => {
  if (!path || /^(?:https?:|data:|blob:)/.test(path)) return path
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}

const galleryEnglishLabelByGroup = {
  'C4D场景渲染': 'C4D RENDERING',
  'KV海报视觉': 'KEY VISUAL DESIGN',
  'AIGC模特': 'AIGC MODEL STUDY',
  '跨境listing视觉': 'ECOMMERCE VISUAL',
  '产品详情页': 'PRODUCT DETAIL DESIGN',
  '产品包装': 'PACKAGING DESIGN',
  '产品拍摄精修': 'PRODUCT RETOUCHING',
  '独立站设计': 'WEBSITE DESIGN',
  'AI视频': 'AI PRODUCT VIDEO',
}

const homeProjects = projects
  .filter((project) => !['category-8-project-2', 'category-9-project-2', 'category-9-project-3', 'category-9-project-4', 'category-9-project-5'].includes(project.id))

function useScrollMotion(routeKey) {
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const viewport = window.innerHeight
      document.querySelectorAll('[data-parallax]').forEach((node) => {
        const rect = node.getBoundingClientRect()
        const speed = Number(node.dataset.parallax || .08)
        const offset = (rect.top + rect.height / 2 - viewport / 2) * speed
        node.style.setProperty('--parallax', `${offset.toFixed(2)}px`)
      })
    }
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [routeKey])
}

function Counter({ value, suffix = '' }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      const start = performance.now()
      const tick = (time) => {
        const progress = Math.min((time - start) / 1200, 1)
        setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      observer.disconnect()
    }, { threshold: .5 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [value])
  return <strong ref={ref}>{String(display).padStart(2, '0')}<sup>{suffix}</sup></strong>
}

function IntroExperience() {
  const [hidden, setHidden] = useState(false)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.body.classList.add('is-locked')
    const leaveTimer = window.setTimeout(() => setLeaving(true), reduced ? 80 : 2200)
    const hideTimer = window.setTimeout(() => {
      setHidden(true)
      document.body.classList.remove('is-locked')
    }, reduced ? 180 : 3280)
    return () => {
      clearTimeout(leaveTimer)
      clearTimeout(hideTimer)
      document.body.classList.remove('is-locked')
    }
  }, [])
  if (hidden) return null
  return <div className={`intro-screen ${leaving ? 'is-leaving' : ''}`} aria-label="欢迎来到 Youl 的作品集">
    <div className="intro-loader" role="status" aria-label="页面加载中">
      <span className="intro-orbit intro-orbit-primary" aria-hidden="true" />
      <span className="intro-orbit intro-orbit-secondary" aria-hidden="true" />
      <span className="intro-core" aria-hidden="true" />
    </div>
  </div>
}

function PageTransition({ transition, onDone }) {
  const [phase, setPhase] = useState('ready')
  useEffect(() => {
    document.body.classList.add('is-locked')
    const frame = requestAnimationFrame(() => setPhase('covering'))
    const coverTimer = window.setTimeout(() => {
      transition.run()
      setPhase('covered')
    }, 1000)
    const doneTimer = window.setTimeout(onDone, 1480)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(coverTimer)
      clearTimeout(doneTimer)
      document.body.classList.remove('is-locked')
    }
  }, [transition])
  return <div className={`page-transition is-${phase}`} aria-hidden="true"><div className="page-transition-oval" /></div>
}

function Header({ menuOpen, setMenuOpen }) {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    let lastY = window.scrollY
    let frame = 0
    const update = () => {
      frame = 0
      const nextY = window.scrollY
      if (nextY < 90) setHidden(false)
      else if (nextY > lastY + 5) setHidden(true)
      else if (nextY < lastY - 5) setHidden(false)
      lastY = nextY
    }
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update) }
    window.addEventListener('scroll', requestUpdate, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
    }
  }, [])
  const close = () => setMenuOpen(false)
  return <>
    <header className={`site-header shell ${hidden && !menuOpen ? 'is-hidden' : ''}`}>
      <a className="brand" href="#/home/top" aria-label="返回首页"><span>YOUL</span><small>VISUAL<br />DESIGN</small></a>
      <nav aria-label="主导航"><a href="#/home/top">首页</a><a href="#/home/about">关于我</a><a href="#/projects">作品集展示</a></nav>
      <a className="contact-button" href="#/home/contact">Contact</a>
      <button className="menu-button" type="button" aria-label="打开菜单" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><i /><i /></button>
    </header>
    <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
      <p>MENU</p>
      <a href="#/home/top" onClick={close}>首页</a>
      <a href="#/home/about" onClick={close}>关于我</a>
      <a href="#/projects" onClick={close}>作品集展示</a>
      <a href="#/home/contact" onClick={close}>联系</a>
    </div>
  </>
}

function Hero() {
  const heroRef = useRef(null)
  useEffect(() => {
    const hero = heroRef.current
    const host = hero?.parentElement
    if (!hero || !host) return undefined
    const query = window.matchMedia('(min-width: 1101px) and (prefers-reduced-motion: no-preference)')
    const pinStyles = ['position', 'top', 'left', 'width', 'transform']
    let start = 0
    let offset = 0
    let range = 0
    let box = null
    let state = ''
    const setState = (next) => {
      if (next === state) return
      state = next
      pinStyles.forEach((property) => hero.style.removeProperty(property))
      if (next === 'pinned') Object.assign(hero.style, { position: 'fixed', top: `${-offset}px`, left: `${box.left}px`, width: `${box.width}px` })
      else if (next === 'after') hero.style.transform = `translateY(${Math.round(range)}px)`
    }
    const render = () => {
      const scrolled = window.scrollY - start
      setState(scrolled <= offset ? 'before' : scrolled < offset + range ? 'pinned' : 'after')
    }
    const measure = () => {
      state = ''
      pinStyles.forEach((property) => hero.style.removeProperty(property))
      host.style.removeProperty('height')
      const rect = hero.getBoundingClientRect()
      box = { left: rect.left, width: rect.width }
      start = rect.top + window.scrollY
      offset = Math.max(0, Math.round(rect.height - window.innerHeight))
      range = window.innerHeight * .8
      host.style.height = `${hero.offsetHeight}px`
      render()
    }
    const enable = () => {
      window.addEventListener('scroll', render, { passive: true })
      window.addEventListener('resize', measure)
      measure()
    }
    const disable = () => {
      window.removeEventListener('scroll', render)
      window.removeEventListener('resize', measure)
      pinStyles.forEach((property) => hero.style.removeProperty(property))
      host.style.removeProperty('height')
      state = ''
    }
    const apply = () => { disable(); if (query.matches) enable() }
    query.addEventListener('change', apply)
    apply()
    return () => { query.removeEventListener('change', apply); disable() }
  }, [])
  const onMove = (event) => {
    const rect = heroRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (event.clientX - rect.left) / rect.width - .5
    const y = (event.clientY - rect.top) / rect.height - .5
    heroRef.current.style.setProperty('--mx', `${(x * 22).toFixed(2)}px`)
    heroRef.current.style.setProperty('--my', `${(y * 14).toFixed(2)}px`)
  }
  const featured = homeProjects
  return <section className="hero" id="top" ref={heroRef} onPointerMove={onMove}>
    <div className="hero-copy shell reveal">
      <p>ECOMMERCE VISUAL DESIGNER</p>
      <h1><span>VISUALS THAT CONNECT.</span>{' '}<em>STORIES THAT STAY.</em></h1>
      <div className="hero-intro">Crafting memorable brand, commerce and image-led experiences with clarity, character and purpose.</div>
      <a className="primary-button" href="#/projects">PORTFOLIO</a>
    </div>
    <div className="hero-deck is-active" aria-label="精选项目预览">
      <div className="hero-wheel">
        {featured.map((project, index) => <a className="deck-card" style={{ '--angle': `${index * (360 / featured.length)}deg` }} href={`#/projects/${project.id}`} key={project.id}>
          {project.coverType === 'video'
            ? <video src={assetUrl(project.image)} muted loop autoPlay playsInline preload="metadata" aria-hidden="true" style={{ objectViewBox: project.previewViewBox || 'none', objectPosition: project.previewPosition || 'center' }} />
            : <img src={assetUrl(project.image)} alt="" loading={index < 3 ? 'eager' : 'lazy'} style={{ objectViewBox: project.previewViewBox || 'none', objectPosition: project.previewPosition || 'center' }} />}
          <span>{project.title}</span>
        </a>)}
      </div>
    </div>
  </section>
}

function About() {
  return <section className="about section" id="about"><div className="shell">
    <article className="about-profile-card reveal">
      <div className="about-profile-side">
        <div className="about-profile-photo"><img src={assetUrl('/assets/youl-profile.jpg')} alt="YOUL 个人照片" /></div>
        <div className="about-profile-contact">
          <a href="tel:17807811576"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 3.8 9.7 8 7.9 9.7c1.1 2.5 3 4.4 5.5 5.5l1.8-1.8 4.1 2.5c.5.3.8.9.6 1.5l-.5 2.1c-.2.8-.9 1.3-1.7 1.3C9.6 20.4 3.6 14.4 3.2 6.3c0-.8.5-1.5 1.3-1.7l2.1-.5c.2-.1.4-.1.6-.3Z" /></svg><span>17807811576</span></a>
          <a href="mailto:youl0001@163.com"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg><span>youl0001@163.com</span></a>
        </div>
      </div>
      <div className="about-profile-main">
        <div className="about-profile-label"><strong>ABOUT ME</strong><i>/</i><span>关于我</span></div>
        <h2>古幼玲</h2>
        <div className="about-profile-role"><strong>电商视觉设计师</strong><span>E-commerce Visual Designer</span></div>
        <div className="about-profile-skills" aria-label="专业技能">
          <div className="skills-heading"><strong>SKILLS</strong><span>/ 专业技能</span></div>
          <div className="skills-grid">
            <div className="skill-item"><span role="img" aria-label="Adobe Photoshop"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="3" width="26" height="26" rx="5" /><text x="16" y="21" textAnchor="middle">Ps</text></svg></span><small>PS</small></div>
            <div className="skill-item"><span role="img" aria-label="Adobe Illustrator"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="3" width="26" height="26" rx="5" /><text x="16" y="21" textAnchor="middle">Ai</text></svg></span><small>AI</small></div>
            <div className="skill-item"><span role="img" aria-label="Figma"><svg className="figma-icon" viewBox="0 0 32 32" aria-hidden="true"><circle cx="20" cy="8" r="4" /><circle cx="20" cy="16" r="4" /><circle cx="12" cy="24" r="4" /><path d="M8 8a4 4 0 0 1 4-4h4v8h-4a4 4 0 0 1-4-4Zm0 8a4 4 0 0 1 4-4h4v8h-4a4 4 0 0 1-4-4Zm0 8a4 4 0 0 1 4-4h4v4a4 4 0 0 1-8 0Z" /></svg></span><small>Figma</small></div>
            <div className="skill-item"><span role="img" aria-label="Cinema 4D"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11" /><path d="M9 11.2c6.4-3 12 1 14 6.4M10 23c3-6.2 8.5-8.2 13.4-5.5" /></svg></span><small>C4D</small></div>
            <div className="skill-item"><span role="img" aria-label="Octane Render"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="10.5" /><circle cx="16" cy="16" r="5" /><path d="M16 5.5v5M16 21.5v5M5.5 16h5M21.5 16h5" /></svg></span><small>Octane</small></div>
            <div className="skill-item"><span role="img" aria-label="KeyShot"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11" /><path d="M11 9v14M11 17l9-8M11 17l9 6" /></svg></span><small>KeyShot</small></div>
          </div>
        </div>
      </div>
    </article>
    <div className="metrics reveal">
      <article><Counter value={2} suffix="+" /><p>YEARS EXPERIENCE<br /><span>从业年限</span></p></article>
      <article><Counter value={150} suffix="+" /><p>VISUAL DESIGN<br /><span>视觉设计</span></p></article>
      <article><Counter value={110} suffix="+" /><p>IMAGE PROCESSING<br /><span>图片处理</span></p></article>
      <article><Counter value={9} /><p>CORE DIRECTIONS<br /><span>核心作品方向</span></p></article>
    </div>
  </div></section>
}

function ProjectCard({ project, onOpen, shape = 'landscape' }) {
  const tags = [...new Set([project.group, project.scope].filter(Boolean))]
  return <article className={`project-card reveal is-${shape}`} id={`project-${project.id}`}>
    <button type="button" className={`project-image ${project.tone}`} onClick={() => onOpen(project)} aria-label={`查看${project.title}案例详情`}>
      {project.coverType === 'video'
        ? <video src={assetUrl(project.image)} muted loop autoPlay playsInline preload="metadata" aria-label={`${project.title}视频预览`} />
        : <img
            src={assetUrl(project.image)}
            alt={`${project.title}示意视觉`}
            loading="lazy"
            data-parallax=".045"
            style={{
              objectPosition: project.previewPosition || 'center',
              objectViewBox: project.previewViewBox || 'none',
              transformOrigin: project.previewOrigin || 'center',
              '--cover-scale': project.previewScale || 1.04,
              '--cover-hover-scale': project.previewHoverScale || 1.075,
              '--cover-enter-scale': project.previewEnterScale || 1.16,
            }}
          />}
      <span className="project-title">{project.en && <i>{project.en}</i>}<b>{project.title}</b></span>
      <span className="project-tags">{tags.map((item) => <i key={item}>{item}</i>)}</span>
    </button>
    <div className="project-info"><span>{project.group} · {project.year}</span>{project.en && <p>{project.en}</p>}</div>
  </article>
}

function OrbitServices() {
  const sectionRef = useRef(null)
  const revealArcRef = useRef(null)
  const coverArcRef = useRef(null)
  useEffect(() => {
    const section = sectionRef.current
    const revealPath = revealArcRef.current
    const coverPath = coverArcRef.current
    if (!section || !revealPath || !coverPath) return undefined
    const clamp = (value) => Math.min(1, Math.max(0, value))
    const round = (value) => Math.round(value * 100) / 100
    const state = { reveal: 0, cover: 0, revealTarget: 0, coverTarget: 0, frame: 0 }
    const draw = (path, mode, progress) => {
      const fill = mode === 'cover' ? progress : 1 - progress
      const rect = section.getBoundingClientRect()
      const depth = 19 * (rect.height ? rect.width / rect.height : 1)
      const bend = 2 * depth * Math.sin(fill * Math.PI)
      if (mode === 'cover') {
        const top = round(100 - 100 * fill)
        path.setAttribute('d', `M0 100 L0 ${top} Q50 ${round(top + bend)} 100 ${top} L100 100 Z`)
      } else {
        const bottom = round(100 * fill)
        path.setAttribute('d', `M0 0 L0 ${bottom} Q50 ${round(bottom - bend)} 100 ${bottom} L100 0 Z`)
      }
    }
    const render = () => {
      state.reveal += (state.revealTarget - state.reveal) * .11
      state.cover += (state.coverTarget - state.cover) * .11
      draw(revealPath, 'reveal', state.reveal)
      draw(coverPath, 'cover', state.cover)
      if (Math.abs(state.revealTarget - state.reveal) > .001 || Math.abs(state.coverTarget - state.cover) > .001) state.frame = requestAnimationFrame(render)
      else state.frame = 0
    }
    const update = () => {
      if (window.innerWidth < 992 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        state.revealTarget = 1
        state.coverTarget = 0
      } else {
        const rect = section.getBoundingClientRect()
        const viewport = window.innerHeight
        state.revealTarget = clamp((viewport - rect.top) / (viewport * .7))
        state.coverTarget = clamp((viewport * .6 - rect.bottom) / (viewport * .6))
      }
      if (!state.frame) state.frame = requestAnimationFrame(render)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      cancelAnimationFrame(state.frame)
    }
  }, [])
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined
    const cards = [...section.querySelectorAll('.orbit-card')]
    const clones = new Set()
    const timers = new Set()
    let current = 0
    let lastX = null
    let lastY = null
    let lastSpawn = 0
    const cardWidth = cards[0]?.getBoundingClientRect().width || 200
    cards.forEach((card) => card.classList.add('is-template'))
    const spawn = (clientX, clientY) => {
      const rect = section.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      const card = cards[current % cards.length].cloneNode(true)
      current += 1
      card.classList.remove('is-template')
      card.classList.add('is-hidden')
      card.style.left = `${x}px`
      card.style.top = `${y}px`
      section.appendChild(card)
      clones.add(card)
      void card.getBoundingClientRect()
      card.classList.remove('is-hidden')
      card.classList.add('is-visible')
      const outTimer = window.setTimeout(() => {
        card.classList.remove('is-visible')
        card.classList.add('is-out')
      }, 400)
      const removeTimer = window.setTimeout(() => {
        card.remove()
        clones.delete(card)
      }, 1200)
      timers.add(outTimer)
      timers.add(removeTimer)
      lastX = clientX
      lastY = clientY
      lastSpawn = performance.now()
    }
    const move = (event) => {
      const copy = section.querySelector('.orbit-copy')
      const copyRect = copy?.getBoundingClientRect()
      if (copyRect && event.clientX >= copyRect.left && event.clientX <= copyRect.right && event.clientY >= copyRect.top && event.clientY <= copyRect.bottom) return
      if (performance.now() - lastSpawn < 90) return
      const step = cardWidth * .68
      if (lastX === null || Math.hypot(event.clientX - lastX, event.clientY - lastY) >= step) spawn(event.clientX, event.clientY)
    }
    section.addEventListener('pointermove', move)
    return () => {
      section.removeEventListener('pointermove', move)
      timers.forEach((timer) => clearTimeout(timer))
      clones.forEach((clone) => clone.remove())
    }
  }, [])
  return <section className="orbit-services" ref={sectionRef} aria-label="八项创意服务">
    <svg className="arc-scroll-transition arc-reveal" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path ref={revealArcRef} /></svg>
    <svg className="arc-scroll-transition arc-cover" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path ref={coverArcRef} /></svg>
    <div className="orbit-stage">
        <div className="orbit-copy">
          <h2>IDEAS IN MOTION.</h2>
          <span>A playful mix of products, images and visual experiments.</span>
        </div>
        {homeProjects.map((item) => <article className={`orbit-card ${item.tone}`} key={item.id}>
          {item.coverType === 'video'
            ? <video src={assetUrl(item.image)} muted loop autoPlay playsInline preload="metadata" aria-hidden="true" style={{ objectViewBox: item.previewViewBox || 'none', objectPosition: item.previewPosition || 'center' }} />
            : <img src={assetUrl(item.image)} alt="" loading="lazy" style={{ objectViewBox: item.previewViewBox || 'none', objectPosition: item.previewPosition || 'center' }} />}
          <span>{item.title}</span>
        </article>)}
    </div>
  </section>
}

function ProjectDetail({ project, onClose, onNext, onPrevious }) {
  useEffect(() => {
    if (!project) return undefined
    const keydown = (event) => event.key === 'Escape' && onClose()
    document.body.classList.add('is-locked')
    window.addEventListener('keydown', keydown)
    return () => { document.body.classList.remove('is-locked'); window.removeEventListener('keydown', keydown) }
  }, [project, onClose])
  if (!project) return null
  return <div className="case-layer" role="dialog" aria-modal="true" aria-labelledby="case-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className="case-modal">
      <div className="case-nav"><a href="#/home/top">YOUL</a><span>PROJECT SHOWCASE</span><button type="button" onClick={onClose}>关闭 <b>×</b></button></div>
      <div className="case-layout">
        <div className="case-image" aria-label={`${project.title}作品浏览区`}>
          <div className="case-media-list">
            {(project.gallery?.length ? project.gallery : [{ type: 'image', src: project.detailImage || project.image }]).map((media, index) => <figure className="case-media" key={`${media.src}-${index}`}>
              {media.title && <figcaption className="is-bilingual"><span>{media.title}</span><small>{media.enTitle || galleryEnglishLabelByGroup[project.group] || 'SELECTED WORK'}</small></figcaption>}
              {media.type === 'video'
                ? <video src={assetUrl(media.src)} poster={assetUrl(media.poster)} controls playsInline preload="metadata" aria-label={`${project.title}视频 ${index + 1}`} />
                : <img
                    src={assetUrl(media.src)}
                    alt={`${project.title}作品 ${index + 1}`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    style={{ objectViewBox: media.detailViewBox || 'none' }}
                  />}
            </figure>)}
          </div>
        </div>
        <div className="case-copy"><p>{project.group} · {project.year}</p><h2 id="case-title">{project.title}</h2>{project.en && <span>{project.en}</span>}
          <div className="case-meta-list">
            <div><small>服务内容</small><b>{project.services}</b></div>
            <div><small>作品分类</small><b>{project.group}</b></div>
            <div><small>作品数量</small><b>{project.count}</b></div>
          </div>
          <div className="case-navigation">
            <button type="button" onClick={onPrevious}><span>PREVIOUS</span><b>上一个项目</b></button>
            <button type="button" onClick={onNext}><span>NEXT</span><b>下一个项目</b></button>
          </div>
        </div>
      </div>
    </div>
  </div>
}

function Work() {
  const sectionRef = useRef(null)
  const [filter, setFilter] = useState('全部')
  const [selectedProject, setSelectedProject] = useState(null)
  const filters = ['全部', ...projectCategories]
  const visible = useMemo(() => filter === '全部' ? projects : projects.filter((project) => project.group === filter), [filter])
  const columns = [visible.filter((_, index) => index % 2 === 0), visible.filter((_, index) => index % 2 === 1)]
  useEffect(() => {
    const frame = requestAnimationFrame(() => sectionRef.current?.querySelectorAll('.project-card').forEach((card) => card.classList.add('is-visible')))
    return () => cancelAnimationFrame(frame)
  }, [filter])
  return <section className="work section" id="work" ref={sectionRef}><div className="shell work-shell">
    <div className="section-tag reveal"><p>精选项目</p></div>
    <div className="filters reveal" role="tablist" aria-label="作品分类筛选">{filters.map((item) => <button type="button" role="tab" aria-selected={filter === item} className={filter === item ? 'is-active' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>
    <div className="project-masonry">{columns.map((column, columnIndex) => <div className={`project-column column-${columnIndex + 1}`} key={columnIndex}>
      {column.map((project) => <ProjectCard project={project} onOpen={setSelectedProject} key={project.id} />)}
    </div>)}</div>
  </div><ProjectDetail project={selectedProject} onClose={() => setSelectedProject(null)} onPrevious={() => { const index = projects.findIndex((item) => item.id === selectedProject.id); setSelectedProject(projects[(index - 1 + projects.length) % projects.length]) }} onNext={() => { const index = projects.findIndex((item) => item.id === selectedProject.id); setSelectedProject(projects[(index + 1) % projects.length]) }} /></section>
}

function Contact() {
  return <footer className="contact" id="contact"><div className="shell contact-shell">
    <h2 className="reveal">CONTACT ME</h2>
    <div className="contact-details reveal">
      <a className="contact-link" href="tel:17807811576" aria-label="电话：17807811576">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 3.8 9.7 8 7.9 9.7c1.1 2.5 3 4.4 5.5 5.5l1.8-1.8 4.1 2.5c.5.3.8.9.6 1.5l-.5 2.1c-.2.8-.9 1.3-1.7 1.3C9.6 20.4 3.6 14.4 3.2 6.3c0-.8.5-1.5 1.3-1.7l2.1-.5c.2-.1.4-.1.6-.3Z" /></svg>
        <span>17807811576</span>
      </a>
      <a className="contact-link" href="mailto:youl0001@163.com?subject=项目合作" aria-label="邮箱：youl0001@163.com">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
        <span>youl0001@163.com</span>
      </a>
    </div>
  </div></footer>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [transition, setTransition] = useState(null)
  const [page, setPage] = useState(() => window.location.hash.startsWith('#/projects') ? 'projects' : 'home')
  const samePageTransitionRef = useRef(false)
  useScrollMotion(page)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')), { threshold: .12 })
    document.querySelectorAll('.reveal').forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [page])
  useEffect(() => {
    const scrollAfterRender = (id) => requestAnimationFrame(() => requestAnimationFrame(() => {
      const element = document.getElementById(id)
      if (element) element.scrollIntoView({ block: 'start', behavior: 'instant' })
      else window.scrollTo({ top: 0, behavior: 'instant' })
    }))
    const routeDetails = (hash) => {
      const parts = hash.slice(2).split('/').filter(Boolean)
      const destination = parts[0] === 'projects' ? 'projects' : 'home'
      const targetId = destination === 'projects' ? (parts[1] ? `project-${parts[1]}` : 'work') : (parts[1] || 'top')
      return { destination, targetId }
    }
    const routeAction = (hash) => {
      const { destination, targetId } = routeDetails(hash)
      return () => {
        setPage(destination)
        window.history.pushState(null, '', hash)
        scrollAfterRender(targetId)
      }
    }
    const navigate = (event) => {
      const anchor = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null
      if (!anchor || transition || samePageTransitionRef.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const hash = anchor.getAttribute('href')
      if (!hash) return
      const route = hash.startsWith('#/') ? routeDetails(hash) : null
      const run = hash.startsWith('#/') ? routeAction(hash) : (() => {
        const element = document.getElementById(hash.slice(1))
        if (!element) return null
        return () => {
          element.scrollIntoView({ block: 'start', behavior: 'instant' })
          window.history.pushState(null, '', hash)
        }
      })()
      if (!run) return
      event.preventDefault()
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const isSameHomePage = route && page === 'home' && route.destination === 'home'
      if (isSameHomePage) {
        const updateSamePage = () => {
          window.history.pushState(null, '', hash)
          const element = document.getElementById(route.targetId)
          if (element) element.scrollIntoView({ block: 'start', behavior: 'instant' })
          else window.scrollTo({ top: 0, behavior: 'instant' })
        }
        if (reducedMotion || !document.startViewTransition) {
          updateSamePage()
          return
        }
        samePageTransitionRef.current = true
        document.documentElement.classList.add('same-page-transition')
        const viewTransition = document.startViewTransition(updateSamePage)
        viewTransition.finished.finally(() => {
          document.documentElement.classList.remove('same-page-transition')
          samePageTransitionRef.current = false
        })
        return
      }
      if (reducedMotion) {
        run()
        return
      }
      setTransition({ run, hash })
    }
    const restore = () => {
      const hash = window.location.hash
      const destination = hash.startsWith('#/projects') ? 'projects' : 'home'
      setPage(destination)
      const parts = hash.startsWith('#/') ? hash.slice(2).split('/').filter(Boolean) : []
      const targetId = destination === 'projects' ? (parts[1] ? `project-${parts[1]}` : 'work') : (parts[1] || hash.slice(1) || 'top')
      scrollAfterRender(targetId)
    }
    document.addEventListener('click', navigate)
    window.addEventListener('popstate', restore)
    return () => {
      document.removeEventListener('click', navigate)
      window.removeEventListener('popstate', restore)
    }
  }, [transition, page])
  return <><IntroExperience />{transition && <PageTransition transition={transition} onDone={() => setTransition(null)} />}<Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} /><main id={page === 'projects' ? 'top' : undefined} key={page}>{page === 'home' ? <><div className="hero-overlap"><Hero /></div><About /><OrbitServices /></> : <Work />}</main><Contact /></>
}

export default App
