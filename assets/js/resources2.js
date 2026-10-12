// UI Vault — resource pack 2. Same format as resources.js: [name, url, category, license, description, tags]
window.RESOURCES.push(
  // Component kits & widgets
  ["Nuxt UI", "https://ui.nuxt.com", "components", "MIT", "Fully styled, accessible Vue components for Nuxt, built on Reka UI and Tailwind.", ["vue", "nuxt", "tailwind"]],
  ["Naive UI", "https://www.naiveui.com", "components", "MIT", "A Vue 3 library with 90+ components and a very polished theming system.", ["vue", "themes"]],
  ["Element Plus", "https://element-plus.org", "components", "MIT", "A Vue 3 desktop UI library, popular for admin dashboards.", ["vue", "admin"]],
  ["Skeleton", "https://www.skeleton.dev", "components", "MIT", "Adaptive design system for Svelte and React, powered by Tailwind.", ["svelte", "react", "tailwind"]],
  ["Radix Themes", "https://www.radix-ui.com/themes", "components", "MIT", "A pre-styled component library on top of Radix Primitives.", ["react", "styled"]],
  ["Carbon", "https://carbondesignsystem.com", "components", "Apache-2.0", "IBM's open design system: components, guidelines, icons and data viz.", ["react", "design-system", "enterprise"]],
  ["Primer", "https://primer.style", "components", "MIT", "GitHub's design system — React components, CSS and Octicons.", ["react", "design-system"]],
  ["GOV.UK Design System", "https://design-system.service.gov.uk", "components", "MIT", "Some of the most rigorously user-tested form patterns anywhere.", ["a11y", "forms", "design-system"]],
  ["Material Web", "https://material-web.dev", "components", "Apache-2.0", "Google's Material 3 components as web components.", ["web-components", "material"]],
  ["Ionic", "https://ionicframework.com", "components", "MIT", "Mobile-first UI components that feel native on iOS and Android.", ["mobile", "web-components"]],
  ["Blueprint", "https://blueprintjs.com", "components", "Apache-2.0", "React toolkit for complex, data-dense desktop-style interfaces.", ["react", "data-dense", "desktop"]],
  ["Zag.js", "https://zagjs.com", "components", "MIT", "UI component logic as framework-agnostic state machines.", ["headless", "state-machines"]],
  ["Vidstack Player", "https://vidstack.io", "components", "MIT", "Build beautiful, accessible video and audio players.", ["video", "audio", "media"]],
  ["Tiptap", "https://tiptap.dev", "components", "MIT", "Headless rich-text editor framework built on ProseMirror.", ["editor", "rich-text"]],
  ["Lexical", "https://lexical.dev", "components", "MIT", "Meta's extensible, fast text editor framework.", ["editor", "react"]],
  ["React DayPicker", "https://daypicker.dev", "components", "MIT", "Customizable date picker component for React.", ["react", "dates", "forms"]],
  ["SortableJS", "https://sortablejs.github.io/Sortable/", "components", "MIT", "Reorderable drag-and-drop lists with no framework required.", ["drag-and-drop", "vanilla"]],
  ["Driver.js", "https://driverjs.com", "components", "MIT", "Product tours, highlights and onboarding spotlights.", ["onboarding", "tour", "vanilla"]],
  ["React Flow", "https://reactflow.dev", "components", "MIT", "Node-based editors and interactive diagrams in React.", ["react", "nodes", "diagrams"]],
  ["Splide", "https://splidejs.com", "components", "MIT", "Lightweight, accessible slider and carousel.", ["carousel", "a11y", "vanilla"]],

  // Copy-paste blocks
  ["Meraki UI", "https://merakiui.com", "copypaste", "MIT", "Beautiful Tailwind components with RTL and dark mode support.", ["tailwind", "html", "rtl"]],
  ["Mamba UI", "https://mambaui.com", "copypaste", "MIT", "Free Tailwind components and templates.", ["tailwind", "html"]],
  ["Tailblocks", "https://tailblocks.cc", "copypaste", "MIT", "60+ ready-to-use Tailwind page blocks.", ["tailwind", "blocks", "marketing"]],
  ["Float UI", "https://floatui.com", "copypaste", "MIT", "Tailwind components and templates for React, Vue and Svelte.", ["tailwind", "react", "vue"]],

  // CSS
  ["Pure.css", "https://purecss.io", "css", "BSD-3", "Tiny set of responsive CSS modules from Yahoo.", ["minimal", "grid"]],
  ["Tachyons", "https://tachyons.io", "css", "MIT", "The original functional/atomic CSS toolkit.", ["utility", "atomic"]],
  ["Panda CSS", "https://panda-css.com", "css", "MIT", "Build-time CSS-in-JS with design tokens and recipes.", ["css-in-js", "tokens"]],
  ["vanilla-extract", "https://vanilla-extract.style", "css", "MIT", "Type-safe, zero-runtime stylesheets in TypeScript.", ["typescript", "zero-runtime"]],
  ["Lightning CSS", "https://lightningcss.dev", "css", "MPL-2.0", "An extremely fast CSS parser, transformer, bundler and minifier.", ["tooling", "rust"]],
  ["modern-normalize", "https://github.com/sindresorhus/modern-normalize", "css", "MIT", "Normalize browsers' default styles. Tiny and modern.", ["reset", "base"]],
  ["Utopia", "https://utopia.fyi", "css", "Free tool", "Fluid type and space scales without breakpoints.", ["fluid", "typography", "generator"]],

  // Motion
  ["Typed.js", "https://mattboldt.com/demos/typed-js/", "motion", "MIT", "A typing animation library for headlines and terminals.", ["text", "typing"]],
  ["Locomotive Scroll", "https://scroll.locomotive.ca", "motion", "MIT", "Smooth scroll and scroll-triggered effects from the Locomotive studio.", ["scroll", "parallax"]],
  ["Swup", "https://swup.js.org", "motion", "MIT", "Versatile page transition library for server-rendered sites.", ["page-transitions"]],
  ["mo.js", "https://mojs.github.io", "motion", "MIT", "Motion graphics toolbelt for the web: bursts, shapes and timelines.", ["vector", "bursts"]],
  ["Zdog", "https://zzz.dog", "motion", "MIT", "Round, flat, designer-friendly pseudo-3D engine for canvas and SVG.", ["3d", "illustration"]],

  // Effects
  ["Matter.js", "https://brm.io/matter-js/", "effects", "MIT", "2D physics engine for playful, physical interfaces.", ["physics", "canvas"]],
  ["p5.js", "https://p5js.org", "effects", "LGPL-2.1", "Creative coding library for generative art and sketches.", ["generative", "canvas"]],
  ["Paper.js", "https://paperjs.org", "effects", "MIT", "Vector graphics scripting on canvas.", ["vector", "canvas"]],
  ["fireworks-js", "https://fireworks.js.org", "effects", "MIT", "Realistic fireworks on canvas in a few lines.", ["canvas", "celebration"]],
  ["Haikei", "https://haikei.app", "effects", "Free tool", "Generate SVG waves, blobs, layered peaks and gradients.", ["svg", "generator", "backgrounds"]],
  ["Blobmaker", "https://www.blobmaker.app", "effects", "Free tool", "Make organic SVG blob shapes.", ["svg", "generator"]],
  ["fffuel", "https://www.fffuel.co", "effects", "Free tool", "Dozens of SVG generators: noise, gradients, patterns, shapes.", ["svg", "generator", "noise"]],

  // 3D & engines
  ["PlayCanvas", "https://playcanvas.com", "3d", "MIT", "WebGL/WebGPU game engine with a collaborative editor.", ["engine", "webgpu", "games"]],

  // Icons
  ["Ionicons", "https://ionic.io/ionicons", "icons", "MIT", "1,300 icons in outline, filled and sharp styles.", ["svg", "mobile"]],
  ["Eva Icons", "https://akveo.github.io/eva-icons/", "icons", "MIT", "480 beautifully crafted icons with animations.", ["svg", "animated"]],
  ["css.gg", "https://css.gg", "icons", "MIT", "700+ icons in pure CSS, SVG and Figma.", ["css", "svg"]],
  ["Octicons", "https://primer.style/octicons/", "icons", "MIT", "GitHub's icon set — great for dev tools.", ["svg", "dev"]],
  ["Carbon Icons", "https://carbondesignsystem.com/elements/icons/library/", "icons", "Apache-2.0", "2,000+ icons from IBM's design system.", ["svg", "enterprise"]],
  ["Akar Icons", "https://akaricons.com", "icons", "MIT", "Perfectly rounded icon library made for any project.", ["svg", "rounded"]],
  ["MingCute", "https://www.mingcute.com", "icons", "Apache-2.0", "Thousands of carefully designed open-source icons.", ["svg", "line", "fill"]],
  ["Pixelarticons", "https://pixelarticons.com", "icons", "MIT", "480 pixel-perfect 24px icons in a retro pixel style.", ["pixel", "game", "retro"]],

  // Logos, art & media
  ["Open Doodles", "https://www.opendoodles.com", "logos", "CC0", "Free sketchy illustrations to copy, edit and remix.", ["illustrations", "sketch"]],
  ["Unsplash", "https://unsplash.com", "logos", "Unsplash License", "Free high-resolution photography for any project.", ["photos"]],
  ["Lorem Picsum", "https://picsum.photos", "logos", "Free", "Placeholder photos via URL — size, blur and grayscale options.", ["photos", "placeholder"]],
  ["Placehold", "https://placehold.co", "logos", "Free", "Placeholder images with custom text, size and colors.", ["placeholder"]],

  // Fonts
  ["Instrument Serif", "https://fonts.google.com/specimen/Instrument+Serif", "fonts", "OFL", "Condensed display serif with a beautiful italic. Used on this site.", ["serif", "display"]],
  ["Fraunces", "https://fonts.google.com/specimen/Fraunces", "fonts", "OFL", "Soft, “wonky” variable serif with optical sizes.", ["serif", "variable"]],
  ["Bricolage Grotesque", "https://fonts.google.com/specimen/Bricolage+Grotesque", "fonts", "OFL", "Characterful variable grotesque with ink traps.", ["sans", "display"]],
  ["Atkinson Hyperlegible", "https://www.brailleinstitute.org/freefont/", "fonts", "OFL", "Designed for maximum legibility for low-vision readers.", ["sans", "a11y"]],
  ["Lexend", "https://www.lexend.com", "fonts", "OFL", "Variable font designed to improve reading proficiency.", ["sans", "a11y"]],
  ["Iosevka", "https://typeof.net/Iosevka/", "fonts", "OFL", "Slender, customizable monospace for code and terminals.", ["mono", "custom"]],
  ["Fira Code", "https://github.com/tonsky/FiraCode", "fonts", "OFL", "Monospaced font with programming ligatures.", ["mono", "ligatures"]],
  ["Velvetyne", "https://velvetyne.fr", "fonts", "OFL", "Experimental libre type foundry — wild display faces.", ["foundry", "display"]],
  ["Collletttivo", "https://www.collletttivo.it", "fonts", "OFL", "Italian collective publishing free, open-source typefaces.", ["foundry", "display"]],
  ["Uncut", "https://uncut.wtf", "fonts", "Free", "Curated catalog of contemporary free typefaces.", ["catalog", "display"]],

  // Color
  ["Gruvbox", "https://github.com/morhetz/gruvbox", "color", "MIT", "Retro groove color scheme with warm contrast.", ["theme", "warm"]],
  ["Tokyo Night", "https://github.com/folke/tokyonight.nvim", "color", "Apache-2.0", "A clean dark theme celebrating Tokyo's lights.", ["theme", "dark"]],
  ["Solarized", "https://ethanschoonover.com/solarized/", "color", "MIT", "Precision colors for machines and people, light and dark.", ["theme", "classic"]],
  ["Poline", "https://meodai.github.io/poline/", "color", "MIT", "Generate palettes by drawing lines through color space.", ["generator", "js"]],
  ["APCA Contrast", "https://www.myndex.com/APCA/", "color", "Free tool", "The perceptual contrast method behind WCAG 3 drafts.", ["a11y", "contrast"]],

  // Charts
  ["Plotly.js", "https://plotly.com/javascript/", "charts", "MIT", "Scientific charts, 3D plots and maps with rich interaction.", ["scientific", "3d"]],
  ["Vega-Lite", "https://vega.github.io/vega-lite/", "charts", "BSD-3", "A grammar of interactive graphics in JSON.", ["grammar", "declarative"]],
  ["Lightweight Charts", "https://tradingview.github.io/lightweight-charts/", "charts", "Apache-2.0", "TradingView's tiny, fast financial charts.", ["finance", "canvas"]],
  ["Unovis", "https://unovis.dev", "charts", "Apache-2.0", "Modular data viz for React, Angular, Svelte, Vue and vanilla.", ["framework-agnostic", "maps"]],
  ["Frappe Charts", "https://frappe.io/charts", "charts", "MIT", "Simple, responsive, modern SVG charts with zero dependencies.", ["svg", "simple"]],

  // Native, game & Python UI
  ["Textual", "https://textual.textualize.io", "native", "MIT", "Build gorgeous terminal and web apps in Python.", ["python", "tui"]],
  ["Rich", "https://github.com/Textualize/rich", "native", "MIT", "Beautiful formatting, tables, progress bars and syntax in the terminal.", ["python", "terminal"]],
  ["NiceGUI", "https://nicegui.io", "native", "MIT", "Python UIs in the browser with a few lines of code.", ["python", "web"]],
  ["Flet", "https://flet.dev", "native", "Apache-2.0", "Flutter-powered apps written in Python.", ["python", "flutter", "mobile"]],
  ["CustomTkinter", "https://customtkinter.tomschimansky.com", "native", "MIT", "Modern-looking Tkinter widgets with dark mode.", ["python", "desktop"]],
  ["Dear PyGui", "https://github.com/hoffstadt/DearPyGui", "native", "MIT", "GPU-accelerated immediate-mode GUI for Python.", ["python", "gpu", "tools"]],
  ["Kivy", "https://kivy.org", "native", "MIT", "Cross-platform Python framework for touch apps.", ["python", "mobile"]],
  ["Ratatui", "https://ratatui.rs", "native", "MIT", "Rust library for rich terminal user interfaces.", ["rust", "tui"]],
  ["Bubble Tea", "https://github.com/charmbracelet/bubbletea", "native", "MIT", "The fun, functional way to build terminal apps in Go.", ["go", "tui"]],
  ["Fyne", "https://fyne.io", "native", "BSD-3", "Cross-platform GUI toolkit for Go with a Material-ish look.", ["go", "desktop", "mobile"]],
  ["Godot", "https://godotengine.org", "native", "MIT", "Free game engine with a powerful built-in UI system.", ["game", "engine"]],
  ["Bevy", "https://bevyengine.org", "native", "MIT / Apache-2.0", "Refreshingly simple data-driven game engine in Rust.", ["rust", "game", "engine"]],
  ["LÖVE", "https://love2d.org", "native", "Zlib", "Tiny framework for 2D games in Lua.", ["lua", "game"]],

  // Tools
  ["Inkscape", "https://inkscape.org", "tools", "GPL-3.0", "Professional vector editor — logos, icons, illustrations.", ["vector", "svg", "design"]],
  ["Krita", "https://krita.org", "tools", "GPL-3.0", "Painting app for concept art, textures and illustration.", ["painting", "art"]],
  ["Blender", "https://www.blender.org", "tools", "GPL-3.0", "The free 3D suite — model, render and animate UI hero art.", ["3d", "render"]],
  ["FontForge", "https://fontforge.org", "tools", "GPL-3.0", "Create and edit fonts, including icon fonts.", ["fonts", "editor"]],
  ["Responsively", "https://responsively.app", "tools", "AGPL-3.0", "Preview your site on many devices at once.", ["responsive", "testing"]],
  ["axe-core", "https://github.com/dequelabs/axe-core", "tools", "MPL-2.0", "The accessibility testing engine behind most a11y tools.", ["a11y", "testing"]],
  ["Lighthouse", "https://developer.chrome.com/docs/lighthouse/", "tools", "Apache-2.0", "Audit performance, accessibility and SEO.", ["performance", "a11y"]],

  // Learn
  ["Practical Typography", "https://practicaltypography.com", "learn", "Free", "Matthew Butterick's no-nonsense guide to better type.", ["typography"]],
  ["Inclusive Components", "https://inclusive-components.design", "learn", "Free", "How to build common components accessibly, explained in depth.", ["a11y", "components"]],
  ["The A11Y Project", "https://www.a11yproject.com", "learn", "Free", "Community checklist and resources for digital accessibility.", ["a11y", "checklist"]],
  ["Material Design 3", "https://m3.material.io", "learn", "Free", "Google's complete guidelines for color, type, motion and layout.", ["guidelines", "material"]],
  ["Apple HIG", "https://developer.apple.com/design/human-interface-guidelines", "learn", "Free", "Apple's Human Interface Guidelines for every platform.", ["guidelines", "ios", "macos"]],
  ["Shadertoy", "https://www.shadertoy.com", "learn", "Free", "Thousands of live fragment shaders to study and fork.", ["glsl", "shaders"]],
  ["Smashing Magazine", "https://www.smashingmagazine.com", "learn", "Free", "Long-form articles on UX, CSS and front-end craft.", ["articles", "ux"]]
);
