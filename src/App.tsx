import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

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

type PanelId = 'hero' | 'skills' | 'mcp' | 'demos' | 'paper2hfss' | 'docs'

const panelIds: PanelId[] = ['hero', 'skills', 'mcp', 'demos', 'paper2hfss', 'docs']

type ArrayParameters = {
  nx: number
  ny: number
  dx: number
  dy: number
  theta: number
  phi: number
}

const defaultArrayParameters: ArrayParameters = {
  nx: 8,
  ny: 8,
  dx: 0.5,
  dy: 0.5,
  theta: 30,
  phi: 45,
}

function arrayFactor(size: number, phase: number) {
  if (Math.abs(phase) < 1e-6) return 1
  return Math.sin(size * phase / 2) / (size * Math.sin(phase / 2))
}

function ArrayPatternDemo() {
  const [parameters, setParameters] = useState<ArrayParameters>(defaultArrayParameters)
  const [autoRotate, setAutoRotate] = useState(false)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const updatePatternRef = useRef<(next: ArrayParameters) => void>(() => undefined)
  const controlsRef = useRef<OrbitControls | null>(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#06131f')
    scene.fog = new THREE.Fog('#06131f', 3.2, 6.2)

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(2.35, 1.35, -2.35)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    stage.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.055
    controls.autoRotate = false
    controls.autoRotateSpeed = 0.42
    controls.minDistance = 1.45
    controls.maxDistance = 5.5
    controls.target.set(0, 0.42, 0)
    controlsRef.current = controls

    scene.add(new THREE.HemisphereLight(0xbdeee6, 0x06131f, 1.35))
    const keyLight = new THREE.DirectionalLight(0xe9fff9, 2.4)
    scene.add(keyLight)
    const rimLight = new THREE.PointLight(0x65e7d1, 7, 5)
    rimLight.position.set(-1.7, 1.4, -1.2)
    scene.add(rimLight)

    const polarGrid = new THREE.PolarGridHelper(1.18, 12, 4, 64, 0x39727a, 0x163b49)
    polarGrid.position.y = -0.015
    scene.add(polarGrid)

    const origin = new THREE.Vector3(0, 0, 0)
    scene.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, 1.35, 0x65e7d1, 0.08, 0.045))
    scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, 1.35, 0xe4c79a, 0.08, 0.045))
    scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, 1.35, 0x8ea7aa, 0.08, 0.045))

    const thetaSteps = 200
    const phiSteps = 200
    const vertexCount = (thetaSteps + 1) * (phiSteps + 1)
    const positions = new Float32Array(vertexCount * 3)
    const colors = new Float32Array(vertexCount * 3)
    const indices: number[] = []

    for (let thetaIndex = 0; thetaIndex < thetaSteps; thetaIndex += 1) {
      for (let phiIndex = 0; phiIndex < phiSteps; phiIndex += 1) {
        const a = thetaIndex * (phiSteps + 1) + phiIndex
        const b = a + phiSteps + 1
        indices.push(a, b, b + 1, a, b + 1, a + 1)
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setIndex(indices)
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      shininess: 95,
      specular: new THREE.Color('#b9cccc'),
    })
    const patternMesh = new THREE.Mesh(geometry, material)
    patternMesh.scale.setScalar(1.12)
    scene.add(patternMesh)

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: '#b9cccc',
      wireframe: true,
      transparent: true,
      opacity: 0.055,
    })
    const wireMesh = new THREE.Mesh(geometry, wireMaterial)
    wireMesh.scale.copy(patternMesh.scale)
    scene.add(wireMesh)

    const deepColor = new THREE.Color('#123c55')
    const midColor = new THREE.Color('#38a99f')
    const peakColor = new THREE.Color('#e4c79a')
    const sampleColor = new THREE.Color()

    const updatePattern = (next: ArrayParameters) => {
      const theta0 = THREE.MathUtils.degToRad(next.theta)
      const phi0 = THREE.MathUtils.degToRad(next.phi)
      const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute
      const colorAttribute = geometry.getAttribute('color') as THREE.BufferAttribute
      let vertex = 0

      for (let thetaIndex = 0; thetaIndex <= thetaSteps; thetaIndex += 1) {
        const theta = thetaIndex / thetaSteps * Math.PI / 2
        const sinTheta = Math.sin(theta)
        const cosTheta = Math.cos(theta)

        for (let phiIndex = 0; phiIndex <= phiSteps; phiIndex += 1) {
          const phi = phiIndex / phiSteps * Math.PI * 2
          const psiX = 2 * Math.PI * next.dx * (
            sinTheta * Math.cos(phi) - Math.sin(theta0) * Math.cos(phi0)
          )
          const psiY = 2 * Math.PI * next.dy * (
            sinTheta * Math.sin(phi) - Math.sin(theta0) * Math.sin(phi0)
          )
          const magnitude = Math.abs(arrayFactor(next.nx, psiX) * arrayFactor(next.ny, psiY))

          positionAttribute.setXYZ(
            vertex,
            magnitude * sinTheta * Math.cos(phi),
            magnitude * cosTheta,
            magnitude * sinTheta * Math.sin(phi),
          )

          if (magnitude < 0.55) {
            sampleColor.lerpColors(deepColor, midColor, magnitude / 0.55)
          } else {
            sampleColor.lerpColors(midColor, peakColor, (magnitude - 0.55) / 0.45)
          }
          colorAttribute.setXYZ(vertex, sampleColor.r, sampleColor.g, sampleColor.b)
          vertex += 1
        }
      }

      positionAttribute.needsUpdate = true
      colorAttribute.needsUpdate = true
      geometry.computeVertexNormals()
      geometry.computeBoundingSphere()
    }

    updatePatternRef.current = updatePattern
    updatePattern(defaultArrayParameters)

    const resize = () => {
      const width = Math.max(1, stage.clientWidth)
      const height = Math.max(1, stage.clientHeight)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(stage)

    let frame = 0
    const animate = () => {
      frame = window.requestAnimationFrame(animate)
      controls.update()
      keyLight.position.copy(camera.position)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      controls.dispose()
      controlsRef.current = null
      geometry.dispose()
      material.dispose()
      wireMaterial.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      updatePatternRef.current = () => undefined
    }
  }, [])

  useEffect(() => {
    updatePatternRef.current(parameters)
  }, [parameters])

  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = autoRotate
  }, [autoRotate])

  const controls: Array<{ key: keyof ArrayParameters; label: string; unit: string; min: number; max: number; step: number }> = [
    { key: 'nx', label: 'Elements / X', unit: '', min: 1, max: 20, step: 1 },
    { key: 'ny', label: 'Elements / Y', unit: '', min: 1, max: 20, step: 1 },
    { key: 'dx', label: 'Spacing / X', unit: ' λ', min: 0.1, max: 2, step: 0.1 },
    { key: 'dy', label: 'Spacing / Y', unit: ' λ', min: 0.1, max: 2, step: 0.1 },
    { key: 'theta', label: 'Elevation', unit: '°', min: 0, max: 90, step: 1 },
    { key: 'phi', label: 'Azimuth', unit: '°', min: 0, max: 360, step: 1 },
  ]

  return (
    <div className="array-demo-shell">
      <div className="demo-controls" aria-label="Planar array parameters">
        <div className="demo-control-header">
          <span className="status-pill">LIVE DEMO</span>
          <div className="demo-control-actions">
            <button
              type="button"
              className={`rotate-toggle ${autoRotate ? 'enabled' : ''}`}
              aria-pressed={autoRotate}
              onClick={() => setAutoRotate((current) => !current)}
            >
              <span className="toggle-dot" />
              AUTO ROTATE {autoRotate ? 'ON' : 'OFF'}
            </button>
            <button type="button" onClick={() => setParameters(defaultArrayParameters)}>Reset</button>
          </div>
        </div>
        {controls.map((control) => (
          <label className="range-control" key={control.key}>
            <span>{control.label}<strong>{parameters[control.key]}{control.unit}</strong></span>
            <input
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={parameters[control.key]}
              onChange={(event) => setParameters((current) => ({ ...current, [control.key]: Number(event.target.value) }))}
            />
          </label>
        ))}
        <p className="demo-hint">调整阵元数量、间距与扫描方向，实时观察三维归一化阵因子。拖动波束查看空间形态；此演示用于直观理解，不替代全波仿真。</p>
      </div>
      <div className="array-canvas-wrap">
        <div
          ref={stageRef}
          className="array-three-stage"
          aria-label="Interactive three-dimensional planar array radiation pattern"
          role="img"
        />
        <div className="demo-readout">
          <span>NX × NY</span><strong>{parameters.nx} × {parameters.ny}</strong>
          <span>SCAN</span><strong>θ {parameters.theta}° / φ {parameters.phi}°</strong>
        </div>
        <span className="demo-gesture">DRAG · ROTATE / WHEEL · ZOOM</span>
      </div>
    </div>
  )
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
    href: 'https://github.com/Lavaxzyh/codex-profile-switch',
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
    demos: null,
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

    setActivePanel('docs')
    docsPanel.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeArticle])

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
              {id === 'paper2hfss' ? 'Paper2HFSS' : id === 'demos' ? 'Visual Lab' : id}
            </button>
          ))}
        </nav>

        <a className="nav-github" href="https://github.com/Lavaxzyh/paper2hfss" target="_blank" rel="noreferrer">
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
            className={`panel hero-panel ${activePanel === 'hero' ? 'panel-active' : ''}`}
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
                <span>01 · 05</span>
              </section>
            </div>
          </section>

          <section
            id="skills"
            ref={(node) => {
              panelRefs.current.skills = node
            }}
            className={`panel ${activePanel === 'skills' ? 'panel-active' : ''}`}
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
            className={`panel panel-tinted ${activePanel === 'mcp' ? 'panel-active' : ''}`}
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
            id="demos"
            ref={(node) => {
              panelRefs.current.demos = node
            }}
            className={`panel demo-panel ${activePanel === 'demos' ? 'panel-active' : ''}`}
          >
            <div className="panel-inner demo-inner">
              <div className="section-heading demo-heading">
                <div>
                  <p className="eyebrow">03 / VISUAL INTERACTION LAB</p>
                  <h2>
                    See the field.<br />
                    <em>Shape the beam.</em>
                  </h2>
                </div>
                <div className="demo-directory">
                  <span>DEMO INDEX</span>
                  <button type="button" className="active" aria-current="page">01 · Planar Array Factor</button>
                  <span className="demo-coming">MORE MODULES · SOON</span>
                </div>
              </div>
              <p className="demo-intro">
                A small browser-side experiment for connecting array parameters with a visible radiation-pattern response.
              </p>
              <ArrayPatternDemo />
            </div>
          </section>

          <section
            id="paper2hfss"
            ref={(node) => {
              panelRefs.current.paper2hfss = node
            }}
            className={`panel ${activePanel === 'paper2hfss' ? 'panel-active' : ''}`}
          >
            <div className="panel-inner">
              <div className="product-header">
                <div>
                  <p className="eyebrow">04 / RESEARCH PREVIEW</p>
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
            className={`panel panel-tinted ${activePanel === 'docs' ? 'panel-active' : ''}`}
          >
            <div className="panel-inner docs-inner">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">05 / TECHNICAL NOTES</p>
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
                  <a href="https://github.com/Lavaxzyh/paper2hfss" target="_blank" rel="noreferrer">
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
