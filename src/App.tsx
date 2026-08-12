import { useEffect, useMemo, useState } from 'react'

type Article = {
  slug: string
  title: string
  description: string
  date: string
  category: string
  tags: string[]
  readingTime: string
  featured: boolean
  body: string
}

const articleFiles = import.meta.glob('../content/articles/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function parseArticle(raw: string, path: string): Article {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  const meta: Record<string, string> = {}
  const body = match?.[2]?.trim() ?? raw.trim()
  match?.[1]?.split('\n').forEach((line) => {
    const index = line.indexOf(':')
    if (index > -1) meta[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')
  })
  return {
    slug: path.split('/').pop()?.replace(/\.md$/, '') ?? 'article',
    title: meta.title ?? 'Untitled note',
    description: meta.description ?? '',
    date: meta.date ?? '',
    category: meta.category ?? 'Technical Notes',
    tags: (meta.tags ?? '').split(',').map((tag) => tag.trim()).filter(Boolean),
    readingTime: meta.readingTime ?? '5 min',
    featured: meta.featured === 'true',
    body,
  }
}

const articles = Object.entries(articleFiles).map(([path, raw]) => parseArticle(raw, path)).sort((a, b) => b.date.localeCompare(a.date))

const skills = [
  ['Codex Profile Switch', '在不同 Codex 配置之间进行便携、可控的工作流切换，适合个人开发环境管理。', 'Featured', ['Codex', 'Workflow']],
  ['HFSS / PyAEDT', '用可复现脚本把建模、端口和求解设置串成工程流程。', 'Core', ['HFSS', 'PyAEDT']],
  ['Antenna Design', '从辐射机理、馈电到指标权衡，建立可验证的天线设计直觉。', 'Research', ['Antenna', 'EM']],
  ['Microwave Engineering', '传输线、滤波器、S 参数与高频系统的结构化知识地图。', 'Foundation', ['RF', 'Microwave']],
  ['EM Simulation', '关注边界条件、网格、收敛与结果可信度，而不仅是漂亮曲线。', 'Core', ['Simulation', 'Validation']],
  ['AI Agent Workflow', '让模型理解工程上下文，在工具调用与人类判断之间建立闭环。', 'Exploring', ['AI', 'Agent']],
  ['Python Automation', '用 Python 连接数据、几何、仿真和报告，减少重复操作。', 'Core', ['Python', 'Automation']],
  ['Technical Writing', '把复杂的射频工程决策写成可复用、可审阅的技术文档。', 'Practice', ['Docs', 'Research']],
] as const

const mcps = [
  ['AEDT / HFSS MCP', '把本地 HFSS 暴露为可审计的工程工具。', 'Verified', 'Paper → HFSS'],
  ['PyAEDT Automation', '参数化几何、端口、设置和导出，支持最小可复现实验。', 'Prototype', 'Script → Model'],
  ['Paper Parsing Agent', '从 PDF、图片和表格中提取结构、材料与仿真条件。', 'Exploring', 'Paper → Params'],
  ['Simulation Verification', '对照论文曲线、频段、收敛状态和目标指标进行验收。', 'Prototype', 'Run → Evidence'],
  ['Result Extraction', '把 S 参数、增益、效率和场图转成可比较的数据。', 'Exploring', 'HFSS → Report'],
  ['Optimization Loop', '在明确边界内自动调整参数，并保留每轮决策证据。', 'Exploring', 'Metric → Iterate'],
] as const

const workflow = [
  ['01', 'Paper understanding', '理解结构、应用场景与论文中的关键假设。'],
  ['02', 'Engineering parameters', '提取尺寸、材料、频段、边界与激励条件。'],
  ['03', 'HFSS model generation', '通过 PyAEDT 生成参数化、可检查的本地工程。'],
  ['04', 'Local simulation', '在用户本机 HFSS 中完成网格、求解与收敛检查。'],
  ['05', 'Paper-result comparison', '把仿真数据与论文图表和指标进行可追溯对比。'],
  ['06', 'Automatic optimization', '在规则和预算内迭代，直到达到可接受的复现质量。'],
] as const

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function renderMarkdown(body: string) {
  return body.split('\n\n').map((block, index) => {
    if (block.startsWith('## ')) return <h3 key={index}>{block.replace('## ', '')}</h3>
    if (block.startsWith('```')) return <pre key={index}><code>{block.replace(/```[\w-]*\n?|```/g, '')}</code></pre>
    return <p key={index}>{block.split('\n').map((line, lineIndex) => <span key={lineIndex}>{line}{lineIndex < block.split('\n').length - 1 && <br />}</span>)}</p>
  })
}

export default function App() {
  const [activeArticle, setActiveArticle] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    const onHashChange = () => setActiveArticle(window.location.hash.startsWith('#/docs/') ? window.location.hash.replace('#/docs/', '') : null)
    onHashChange()
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const categories = ['All', ...Array.from(new Set(articles.map((article) => article.category)))]
  const filteredArticles = useMemo(() => articles.filter((article) => {
    const matchesCategory = category === 'All' || article.category === category
    const haystack = `${article.title} ${article.description} ${article.tags.join(' ')}`.toLowerCase()
    return matchesCategory && haystack.includes(query.toLowerCase())
  }), [category, query])

  const article = activeArticle ? articles.find((item) => item.slug === activeArticle) : undefined

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Paper2HFSS home">
          <span className="brand-mark">∿</span><span>Paper2HFSS</span><small>by Lavax</small>
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          <button onClick={() => scrollTo('skills')}>Skills</button>
          <button onClick={() => scrollTo('mcp')}>MCP</button>
          <button onClick={() => scrollTo('paper2hfss')}>Paper2HFSS</button>
          <button onClick={() => scrollTo('docs')}>Docs</button>
        </nav>
        <a className="nav-github" href="https://github.com" target="_blank" rel="noreferrer">GitHub ↗</a>
      </header>

      <main id="top">
        <section className="hero section-grid">
          <div className="hero-copy">
            <p className="eyebrow">AI × RF × ANTENNA ENGINEERING</p>
            <h1>From Paper to<br /><em>Verified HFSS Model.</em></h1>
            <p className="hero-lede">让 AI 自动完成从论文到可验证 HFSS 仿真模型的复现流程。这里记录我在天线、微波与工程自动化之间搭建的桥。</p>
            <div className="hero-actions">
              <button className="button button-primary" onClick={() => scrollTo('skills')}>Explore Skills <span>↓</span></button>
              <button className="button button-quiet" onClick={() => scrollTo('docs')}>Read Technical Notes <span>↗</span></button>
            </div>
            <div className="hero-meta"><span>Researcher / Builder</span><span className="meta-dot" /><span>Research Preview · 2026</span></div>
          </div>
          <div className="hero-visual" aria-label="Abstract electromagnetic field visualization" role="img">
            <div className="field-orbit orbit-one" /><div className="field-orbit orbit-two" /><div className="field-orbit orbit-three" />
            <div className="field-core"><span>HFSS</span><small>LOCAL SOLVE</small></div>
            <span className="visual-label label-top">εᵣ  /  S₁₁  /  Δf</span><span className="visual-label label-bottom">PARAMETRIC · TRACEABLE · ITERATIVE</span>
          </div>
        </section>

        <section className="intro-strip"><p>Engineering notes for people who want to understand <strong>why</strong> a simulation can be trusted.</p><span>01 — 04</span></section>

        <section id="skills" className="content-section">
          <div className="section-heading"><div><p className="eyebrow">01 / SKILLS GALLERY</p><h2>Build the right<br /><em>mental model.</em></h2></div><p className="section-note">A working map of the skills behind reproducible antenna and microwave research.</p></div>
          <div className="card-grid skills-grid">{skills.map(([name, desc, level, tags], index) => { const featuredSkill = index === 0; return <article className="skill-card" key={name}><div className="card-top"><span className="index-label">SKILL</span><span className="status-pill">{level}</span></div><h3>{name}</h3><p>{desc}</p><div className="tag-row">{tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><a href={featuredSkill ? 'https://github.com/ZYHIR18/codex-profile-switch' : '#docs'} onClick={featuredSkill ? undefined : () => scrollTo('docs')} target={featuredSkill ? '_blank' : undefined} rel={featuredSkill ? 'noreferrer' : undefined}>{featuredSkill ? 'View project' : 'Explore notes'} <span>↗</span></a></article> })}</div>
        </section>

        <section id="mcp" className="content-section tinted-section">
          <div className="section-heading"><div><p className="eyebrow">02 / MCP GALLERY</p><h2>Connect intelligence<br /><em>to engineering.</em></h2></div><p className="section-note">Small, inspectable tool connections that let an agent act inside a real electromagnetic workflow.</p></div>
          <div className="card-grid mcp-grid">{mcps.map(([name, desc, status, flow], index) => <article className="mcp-card" key={name}><div className="mcp-number">0{index + 1}</div><div><div className="card-top"><span className={`status-pill status-${status.toLowerCase()}`}>{status}</span><span className="flow-label">{flow}</span></div><h3>{name}</h3><p>{desc}</p><a href="https://github.com" target="_blank" rel="noreferrer">View interface <span>↗</span></a></div></article>)}</div>
        </section>

        <section id="paper2hfss" className="content-section product-section">
          <div className="product-header"><div><p className="eyebrow">03 / RESEARCH PREVIEW</p><h2>Paper2HFSS</h2><p className="product-tagline">不是 PDF 转 HFSS。<br /><em>是论文到验证的工程闭环。</em></p></div><span className="research-badge">● IN DEVELOPMENT</span></div>
          <div className="workflow-grid">{workflow.map(([number, title, desc]) => <div className="workflow-step" key={number}><span>{number}</span><h3>{title}</h3><p>{desc}</p></div>)}</div>
          <div className="product-footer"><div><strong>Expected output</strong><span>.aedt project · parameter sheet · simulation evidence · reproduction report</span></div><a className="button button-primary" href="mailto:hello@paper2hfss.dev?subject=Paper2HFSS%20updates">Follow Paper2HFSS <span>↗</span></a></div>
        </section>

        <section id="docs" className="content-section docs-section">
          <div className="section-heading"><div><p className="eyebrow">04 / TECHNICAL NOTES</p><h2>Make the process<br /><em>shareable.</em></h2></div><p className="section-note">Short, practical notes on HFSS automation, antenna reasoning and the evidence behind a result.</p></div>
          {!article && <><div className="docs-toolbar"><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes, tags, topics…" aria-label="Search technical notes" /></label><div className="category-filters">{categories.map((item) => <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div></div><div className="article-list">{filteredArticles.map((item) => <a className={`article-row ${item.featured ? 'featured' : ''}`} href={`#/docs/${item.slug}`} key={item.slug}><div className="article-date">{item.date}<span>{item.readingTime}</span></div><div><span className="article-category">{item.category}</span><h3>{item.title}</h3><p>{item.description}</p><div className="tag-row">{item.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div></div><span className="article-arrow">↗</span></a>)}{filteredArticles.length === 0 && <p className="empty-state">No notes match this search yet.</p>}</div></>}
          {article && <article className="article-detail"><a className="back-link" href="#/docs">← Back to notes</a><p className="eyebrow">{article.category} · {article.date} · {article.readingTime}</p><h2>{article.title}</h2><p className="article-intro">{article.description}</p><div className="article-body">{renderMarkdown(article.body)}</div><div className="tag-row">{article.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div></article>}
        </section>
      </main>

      <footer className="footer"><div><a className="brand" href="#top"><span className="brand-mark">∿</span><span>Paper2HFSS</span></a><p>Technical notes for AI-assisted electromagnetic engineering.</p></div><div className="footer-links"><a href="https://github.com" target="_blank" rel="noreferrer">GitHub ↗</a><a href="mailto:hello@paper2hfss.dev">Email ↗</a><span>© 2026 Lavax</span></div></footer>
    </div>
  )
}
