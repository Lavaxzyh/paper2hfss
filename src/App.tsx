import { useEffect, useMemo, useRef, useState } from 'react'

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

type Skill = {
  name: string
  description: string
  level: string
  tags: string[]
  href?: string
}

type MCPItem = {
  name: string
  description: string
  status: string
  flow: string
}

type WorkflowStep = {
  number: string
  title: string
  description: string
}

type PanelId = 'hero' | 'skills' | 'mcp' | 'paper2hfss' | 'docs'

const panelIds: PanelId[] = ['hero', 'skills', 'mcp', 'paper2hfss', 'docs']

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
    if (index > -1) {
      meta[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')
    }
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

const articles = Object.entries(articleFiles)
  .map(([path, raw]) => parseArticle(raw, path))
  .sort((a, b) => b.date.localeCompare(a.date))

const skills: Skill[] = [
  {
    name: 'Codex Profile Switch',
    description: 'A compact workflow switcher for separate Codex profiles and local development contexts.',
    level: 'Featured',
    tags: ['Codex', 'Workflow'],
    href: 'https://github.com/ZYHIR18/codex-profile-switch',
  },
  {
    name: 'HFSS / PyAEDT',
    description: 'Turn modeling, setup and export steps into reusable automation instead of one-off clicks.',
    level: 'Core',
    tags: ['HFSS', 'PyAEDT'],
  },
  {
    name: 'Antenna Design',
    description: 'From radiation mechanism to gain tradeoffs, build designs you can reason about and reproduce.',
    level: 'Research',
    tags: ['Antenna', 'EM'],
  },
  {
    name: 'Microwave Engineering',
    description: 'A structured map of transmission lines, filters and high-frequency system behavior.',
    level: 'Foundation',
    tags: ['RF', 'Microwave'],
  },
  {
    name: 'EM Simulation',
    description: 'Treat boundary conditions, meshing and convergence as verification tools, not decorations.',
    level: 'Core',
    tags: ['Simulation', 'Validation'],
  },
  {
    name: 'AI Agent Workflow',
    description: 'Let the model understand engineering context and coordinate tools with explicit checkpoints.',
    level: 'Exploring',
    tags: ['AI', 'Agent'],
  },
  {
    name: 'Python Automation',
    description: 'Connect data, geometry, simulation and reports with scripts that reduce repeated manual work.',
    level: 'Core',
    tags: ['Python', 'Automation'],
  },
  {
    name: 'Technical Writing',
    description: 'Turn complex RF decisions into reusable technical notes that others can inspect and extend.',
    level: 'Practice',
    tags: ['Docs', 'Research'],
  },
]

const mcps: MCPItem[] = [
  {
    name: 'AEDT / HFSS MCP',
    description: 'Expose local HFSS control as a reviewable engineering tool instead of a black box action.',
    status: 'Verified',
    flow: 'Paper -> HFSS',
  },
  {
    name: 'PyAEDT Automation',
    description: 'Parameterize geometry, ports and setup definitions for minimal-repeatability experiments.',
    status: 'Prototype',
    flow: 'Script -> Model',
  },
  {
    name: 'Paper Parsing Agent',
    description: 'Extract geometry, material and simulation clues from PDF pages, figures and tables.',
    status: 'Exploring',
    flow: 'Paper -> Params',
  },
  {
    name: 'Simulation Verification',
    description: 'Compare simulated curves and metrics with paper evidence before claiming a match.',
    status: 'Prototype',
    flow: 'Run -> Evidence',
  },
  {
    name: 'Result Extraction',
    description: 'Convert S-parameters, gain, efficiency and plots into structured data for review.',
    status: 'Exploring',
    flow: 'HFSS -> Report',
  },
  {
    name: 'Optimization Loop',
    description: 'Iterate inside explicit bounds and keep every decision traceable for later inspection.',
    status: 'Exploring',
    flow: 'Metric -> Iterate',
  },
]

const workflow: WorkflowStep[] = [
  {
    number: '01',
    title: 'Paper understanding',
    description: 'Read the structure, application scene and key assumptions described in the paper.',
  },
  {
    number: '02',
    title: 'Engineering parameters',
    description: 'Extract dimensions, materials, frequency bands, boundaries and excitation conditions.',
  },
  {
    number: '03',
    title: 'HFSS model generation',
    description: 'Use PyAEDT to generate a local, parameterized and inspectable engineering model.',
  },
  {
    number: '04',
    title: 'Local simulation',
    description: 'Run mesh, solve and convergence checks inside the user’s local HFSS installation.',
  },
  {
    number: '05',
    title: 'Paper-result comparison',
    description: 'Compare the simulation output with the paper figures and reported metrics.',
  },
  {
    number: '06',
    title: 'Automatic optimization',
    description: 'Iterate inside explicit constraints until the reproduction quality is acceptable.',
  },
]

function renderMarkdown(body: string) {
  return body.split('\n\n').map((block, index) => {
    if (block.startsWith('## ')) {
      return <h3 key={index}>{block.replace('## ', '')}</h3>
    }

    if (block.startsWith('```')) {
      return (
        <pre key={index}>
          <code>{block.replace(/```[\w-]*\n?|```/g, '')}</code>
        </pre>
      )
    }

    return (
      <p key={index}>
        {block.split('\n').map((line, lineIndex) => (
          <span key={lineIndex}>
            {line}
            {lineIndex < block.split('\n').length - 1 && <br />}
          </span>
        ))}
      </p>
    )
  })
}

export default function App() {
  const [activeArticle, setActiveArticle] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [activePanel, setActivePanel] = useState<PanelId>('hero')
  const panelRefs = useRef<Record<PanelId, HTMLElement | null>>({
    hero: null,
    skills: null,
    mcp: null,
    paper2hfss: null,
    docs: null,
  })

  useEffect(() => {
    const onHashChange = () => {
      setActiveArticle(window.location.hash.startsWith('#/docs/')
        ? window.location.hash.replace('#/docs/', '')
        : null)
    }

    onHashChange()
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    const docsPanel = panelRefs.current.docs
    if (!activeArticle || !docsPanel) return

    docsPanel.scrollTo({ top: 0, behavior: 'smooth' })
    panelRefs.current.docs?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
  }, [activeArticle])

  useEffect(() => {
    const root = panelRefs.current.hero?.parentElement
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visible?.target instanceof HTMLElement) {
          setActivePanel(visible.target.id as PanelId)
        }
      },
      { root, threshold: [0.55, 0.7] },
    )

    panelIds.forEach((id) => {
      const node = panelRefs.current[id]
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [])

  const categories = ['All', ...Array.from(new Set(articles.map((article) => article.category)))]

  const filteredArticles = useMemo(() => {
    const term = query.toLowerCase()
    return articles.filter((article) => {
      const matchesCategory = category === 'All' || article.category === category
      const haystack = `${article.title} ${article.description} ${article.tags.join(' ')}`.toLowerCase()
      return matchesCategory && haystack.includes(term)
    })
  }, [category, query])

  const article = activeArticle ? articles.find((item) => item.slug === activeArticle) : undefined

  const scrollToPanel = (id: PanelId) => {
    setActivePanel(id)
    const node = panelRefs.current[id]
    if (!node) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    node.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'start',
    })
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#hero" aria-label="Paper2HFSS home" onClick={() => scrollToPanel('hero')}>
          <span className="brand-mark">⌬</span>
          <span>Paper2HFSS</span>
          <small>by Lavax</small>
        </a>

        <nav className="nav-links" aria-label="Primary navigation">
          {panelIds.slice(1).map((id) => (
            <button
              key={id}
              className={activePanel === id ? 'active' : ''}
              onClick={() => scrollToPanel(id)}
              aria-label={`Go to ${id}`}
            >
              {id === 'paper2hfss' ? 'Paper2HFSS' : id}
            </button>
          ))}
        </nav>

        <a className="nav-github" href="https://github.com/ZYHIR18/paper2hfss" target="_blank" rel="noreferrer">
          GitHub →
        </a>
      </header>

      <main className="viewport">
        <div className="panel-track">
          <section
            id="hero"
            ref={(node) => {
              panelRefs.current.hero = node
            }}
            className="panel hero-panel"
          >
            <div className="panel-inner hero-inner">
              <div className="hero-grid">
                <div className="hero-copy">
                  <p className="eyebrow">AI × RF × ANTENNA ENGINEERING</p>
                  <h1>
                    From Paper to<br />
                    <em>Verified HFSS Model.</em>
                  </h1>
                  <p className="hero-lede">
                    A research-focused workflow for turning papers into reproducible HFSS models, local
                    simulations and verifiable results.
                  </p>
                  <div className="hero-actions">
                    <button className="button button-primary" onClick={() => scrollToPanel('skills')}>
                      Explore Skills <span>→</span>
                    </button>
                    <button className="button button-quiet" onClick={() => scrollToPanel('docs')}>
                      Read Technical Notes <span>→</span>
                    </button>
                  </div>
                  <div className="hero-meta">
                    <span>Researcher / Builder</span>
                    <span className="meta-dot" />
                    <span>Research Preview · 2026</span>
                  </div>
                </div>

                <div className="hero-visual" aria-label="Abstract electromagnetic field visualization" role="img">
                  <div className="field-orbit orbit-one" />
                  <div className="field-orbit orbit-two" />
                  <div className="field-orbit orbit-three" />
                  <div className="field-core">
                    <span>HFSS</span>
                    <small>LOCAL SOLVE</small>
                  </div>
                  <span className="visual-label label-top">S11 / S21 / f0</span>
                  <span className="visual-label label-bottom">PARAMETRIC · TRACEABLE · ITERATIVE</span>
                </div>
              </div>

              <section className="intro-strip">
                <p>
                  Engineering notes for people who want to understand <strong>why</strong> a simulation can be
                  trusted.
                </p>
                <span>01 · 04</span>
              </section>
            </div>
          </section>

          <section
            id="skills"
            ref={(node) => {
              panelRefs.current.skills = node
            }}
            className="panel"
          >
            <div className="panel-inner">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">01 / SKILLS GALLERY</p>
                  <h2>
                    Build the right<br />
                    <em>mental model.</em>
                  </h2>
                </div>
                <p className="section-note">
                  A working map of the skills behind reproducible antenna and microwave research.
                </p>
              </div>

              <div className="card-grid skills-grid">
                {skills.map((skill, index) => {
                  const isFeatured = index === 0
                  return (
                    <article className="skill-card" key={skill.name}>
                      <div className="card-top">
                        <span className="index-label">SKILL</span>
                        <span className="status-pill">{skill.level}</span>
                      </div>
                      <h3>{skill.name}</h3>
                      <p>{skill.description}</p>
                      <div className="tag-row">
                        {skill.tags.map((tag) => (
                          <span key={tag}>#{tag}</span>
                        ))}
                      </div>
                      <a
                        href={skill.href ?? '#docs'}
                        onClick={skill.href ? undefined : () => scrollToPanel('docs')}
                        target={skill.href ? '_blank' : undefined}
                        rel={skill.href ? 'noreferrer' : undefined}
                      >
                        {isFeatured ? 'View project' : 'Explore notes'} <span>→</span>
                      </a>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>

          <section
            id="mcp"
            ref={(node) => {
              panelRefs.current.mcp = node
            }}
            className="panel panel-tinted"
          >
            <div className="panel-inner">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">02 / MCP GALLERY</p>
                  <h2>
                    Connect intelligence<br />
                    <em>to engineering.</em>
                  </h2>
                </div>
                <p className="section-note">
                  Small, inspectable tool connections that let an agent act inside a real electromagnetic workflow.
                </p>
              </div>

              <div className="card-grid mcp-grid">
                {mcps.map((mcp, index) => (
                  <article className="mcp-card" key={mcp.name}>
                    <div className="mcp-number">0{index + 1}</div>
                    <div>
                      <div className="card-top">
                        <span className={`status-pill status-${mcp.status.toLowerCase()}`}>{mcp.status}</span>
                        <span className="flow-label">{mcp.flow}</span>
                      </div>
                      <h3>{mcp.name}</h3>
                      <p>{mcp.description}</p>
                      <a href="https://github.com" target="_blank" rel="noreferrer">
                        View interface <span>→</span>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section
            id="paper2hfss"
            ref={(node) => {
              panelRefs.current.paper2hfss = node
            }}
            className="panel"
          >
            <div className="panel-inner">
              <div className="product-header">
                <div>
                  <p className="eyebrow">03 / RESEARCH PREVIEW</p>
                  <h2>Paper2HFSS</h2>
                  <p className="product-tagline">
                    Not PDF to HFSS.
                    <br />
                    <em>Paper to verified engineering loop.</em>
                  </p>
                </div>
                <span className="research-badge">IN DEVELOPMENT</span>
              </div>

              <div className="workflow-grid">
                {workflow.map((step) => (
                  <div className="workflow-step" key={step.number}>
                    <span>{step.number}</span>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                ))}
              </div>

              <div className="product-footer">
                <div>
                  <strong>Expected output</strong>
                  <span>.aedt project · parameter sheet · simulation evidence · reproduction report</span>
                </div>
                <a className="button button-primary" href="mailto:hello@paper2hfss.dev?subject=Paper2HFSS%20updates">
                  Follow Paper2HFSS <span>→</span>
                </a>
              </div>
            </div>
          </section>

          <section
            id="docs"
            ref={(node) => {
              panelRefs.current.docs = node
            }}
            className="panel panel-tinted"
          >
            <div className="panel-inner docs-inner">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">04 / TECHNICAL NOTES</p>
                  <h2>
                    Make the process<br />
                    <em>shareable.</em>
                  </h2>
                </div>
                <p className="section-note">
                  Short, practical notes on HFSS automation, antenna reasoning and the evidence behind a result.
                </p>
              </div>

              {!article && (
                <>
                  <div className="docs-toolbar">
                    <label className="search-box">
                      <span>⌕</span>
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search notes, tags, topics..."
                        aria-label="Search technical notes"
                      />
                    </label>
                    <div className="category-filters">
                      {categories.map((item) => (
                        <button
                          className={category === item ? 'active' : ''}
                          onClick={() => setCategory(item)}
                          key={item}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="article-list">
                    {filteredArticles.map((item) => (
                      <a
                        className={`article-row ${item.featured ? 'featured' : ''}`}
                        href={`#/docs/${item.slug}`}
                        onClick={() => scrollToPanel('docs')}
                        key={item.slug}
                      >
                        <div className="article-date">
                          {item.date}
                          <span>{item.readingTime}</span>
                        </div>
                        <div>
                          <span className="article-category">{item.category}</span>
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                          <div className="tag-row">
                            {item.tags.map((tag) => (
                              <span key={tag}>#{tag}</span>
                            ))}
                          </div>
                        </div>
                        <span className="article-arrow">→</span>
                      </a>
                    ))}
                    {filteredArticles.length === 0 && <p className="empty-state">No notes match this search yet.</p>}
                  </div>
                </>
              )}

              {article && (
                <article className="article-detail">
                  <a className="back-link" href="#/docs" onClick={() => scrollToPanel('docs')}>
                    ← Back to notes
                  </a>
                  <p className="eyebrow">
                    {article.category} · {article.date} · {article.readingTime}
                  </p>
                  <h2>{article.title}</h2>
                  <p className="article-intro">{article.description}</p>
                  <div className="article-body">{renderMarkdown(article.body)}</div>
                  <div className="tag-row">
                    {article.tags.map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                </article>
              )}

              <footer className="footer docs-footer">
                <div>
                  <a className="brand" href="#hero" onClick={() => scrollToPanel('hero')}>
                    <span className="brand-mark">⌬</span>
                    <span>Paper2HFSS</span>
                  </a>
                  <p>© 2026 Lavax · Technical notes and project materials for research and education.</p>
                </div>
                <div className="footer-links">
                  <a href="https://github.com/ZYHIR18/paper2hfss" target="_blank" rel="noreferrer">
                    GitHub →
                  </a>
                  <a href="mailto:hello@paper2hfss.dev">Email →</a>
                </div>
              </footer>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
