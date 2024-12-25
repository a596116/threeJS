<template>
  <main>
    <div ref="corridorRef" class="corridor"></div>
    <div ref="loadingRef" class="loading">Loading Scene</div>
    <div class="overlay">
      <div class="counter"><p>0</p></div>
    </div>
    <div class="hero">
      <nav>
        <div class="logo">
          <NuxtLink to="/">Home</NuxtLink>
        </div>
        <div class="nav-items">
          <a href="#">Apparel</a>
          <a href="#">Events</a>
          <a href="#">Archive</a>
        </div>
        <div class="site-year">
          <p>2024 [N]</p>
        </div>
      </nav>
      <h1>
        Blending contemporary minimalism with futuristic innovation to create
        designs that transcend trends and define elegance .
      </h1>
      <div class="footer">
        <p>/ Made by HaoDai</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'

useSeoMeta({
  title: 'Project 1',
})

const { width, height } = useWindowSize()
const corridorRef = ref<HTMLElement | null>(null)
const loadingRef = ref<HTMLElement | null>(null)

const onWindowResize = ref()

onNuxtReady(() => {
  // 1. Basic Scene Setup
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )

  const renderer = new THREE.WebGLRenderer({
    powerPreference: 'high-performance',
    antialias: false,
    stencil: false,
    depth: false,
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  // renderer.outputColorSpace = THREE.SRGBColorSpace
  // @ts-ignore
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.toneMapping = THREE.NoToneMapping
  corridorRef.value?.appendChild(renderer.domElement)

  // 2. Lighting Setup (可跳過)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const keyLight = new THREE.DirectionalLight(0xfffffff, 0.5)
  keyLight.position.set(5, 8, 5)
  keyLight.castShadow = true
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0x000000, 0.5)
  fillLight.position.set(-5, 3, -5)
  scene.add(fillLight)

  const light1 = new THREE.PointLight(0xffffff, 2, 1)
  light1.position.set(2, 3, 2)
  scene.add(light1)

  const light2 = new THREE.PointLight(0xffffff, 2, 1)
  light2.position.set(-2, 3, -2)
  scene.add(light2)

  // 3. Camera and Movement Setup
  const initialAngle = Math.PI / 4
  const radius = Math.sqrt(50)
  const currentAngle = ref(initialAngle + Math.PI)
  const targetAngle = ref(initialAngle)
  const currentY = ref(0)
  const targetY = ref(0)

  // Set initial camera position with different rotation
  camera.position.x = Math.cos(currentAngle.value) * radius
  camera.position.z = Math.sin(currentAngle.value) * radius
  camera.position.y = currentY.value
  camera.lookAt(0, 0, 0)

  // 4. Parallax Control Setup
  const mouseX = ref(0)
  const mouseY = ref(0)
  const windowHalfX = computed(() => window.innerWidth / 2)
  const windowHalfY = computed(() => window.innerHeight / 2)

  const { x, y } = useMouse()
  // Disable mouse control during initial animation
  let animationComplete = false
  watchEffect(() => {
    // if (!animationComplete) return
    mouseX.value = (x.value - windowHalfX.value) / windowHalfX.value
    mouseY.value = (y.value - windowHalfY.value) / windowHalfY.value
    targetAngle.value = initialAngle + -mouseX.value * 0.35
    targetY.value = -mouseY.value * 1.5
  })

  // 5. Model Loading and Material Setup
  const emissiveColors = {
    screen: new THREE.Color(0x00ff00),
    lamp: new THREE.Color(0xffaa00),
    light: new THREE.Color(0xffffff),
    default: new THREE.Color(0xffffff),
  }

  const loader = new GLTFLoader()
  loader.load('/models/project1/scene.gltf', (gltf) => {
    const model = gltf.scene

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true

        if (child.material) {
          let emissiveColor = emissiveColors.default
          for (const [key, value] of Object.entries(emissiveColors)) {
            if (child.name.toLowerCase().includes(key)) {
              emissiveColor = value
              break
            }
          }

          const newMaterial = new THREE.MeshStandardMaterial({
            color: child.material.color,
            map: child.material.map,
            emissive: emissiveColor,
            emissiveIntensity: 0,
            roughness: 5.0,
            metalness: 0.125,
          })

          if (child.material.map) {
            // @ts-ignore
            newMaterial.map.encoding = THREE.sRGBEncoding
            // @ts-ignore
            newMaterial.map.flipY = false
          }

          child.material = newMaterial
        }
      }
    })

    const box = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    model.position.sub(center)

    scene.add(model)
    loadingRef.value?.remove()

    startAnimations()
  })

  // Add GSAP animations
  const overlay = document.querySelector('.overlay')
  const counter = document.querySelector('.counter p')

  function splitText() {
    const textElements = document.querySelectorAll(
      'nav a, nav p, h1, .footer p'
    )

    textElements.forEach((element) => {
      const text = element.textContent?.toUpperCase()
      element.textContent = ''

      text?.split('').forEach((char) => {
        if (char === ' ') {
          const spaceSpan = document.createElement('span')
          spaceSpan.classList.add('space')
          spaceSpan.style.display = 'inline-block'
          spaceSpan.style.width = '15px'
          spaceSpan.style.opacity = '0'
          element.appendChild(spaceSpan)
        } else {
          const span = document.createElement('span')
          span.classList.add('char')
          span.textContent = char
          span.style.display = 'inline-block'
          span.style.opacity = '0'
          element.appendChild(span)
        }
      })
    })
  }

  splitText()

  function startAnimations() {
    const timeline = gsap.timeline({
      onComplete: () => {
        animationComplete = true
      },
    })

    // Generate random checkpoints but ensure last one is 100
    const checkpoints = [0]
    const numJumps = 7
    let currentValue = 0

    while (checkpoints.length < numJumps) {
      const minJump = 5
      const maxJump =
        Math.floor((100 - currentValue) / (numJumps - checkpoints.length + 1)) *
        2
      const jump = minJump + Math.floor(Math.random() * (maxJump - minJump))

      currentValue += jump
      if (currentValue < 97) {
        checkpoints.push(currentValue)
      }
    }
    checkpoints.push(97)
    checkpoints.push(100)

    let currentIndex = 0
    timeline.to(
      {},
      {
        duration: 4,
        ease: 'none',
        onUpdate: function () {
          const timeProgress = this.progress()
          const targetIndex = Math.floor(timeProgress * checkpoints.length)

          if (
            targetIndex !== currentIndex &&
            targetIndex < checkpoints.length
          ) {
            currentIndex = targetIndex
            counter!.textContent = String(checkpoints[currentIndex])
          }
        },
        onComplete: function () {
          counter!.textContent = '100'
        },
      }
    )

    timeline.to(
      '.counter',
      {
        opacity: 0,
        duration: 0.75,
        ease: 'power2.out',
      },
      '+=0.2'
    )

    const rotationProxy = {
      angle: currentAngle.value,
    }

    timeline.to(
      rotationProxy,
      {
        angle: initialAngle,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: () => {
          currentAngle.value = rotationProxy.angle
          camera.position.x = Math.cos(currentAngle.value) * radius
          camera.position.z = Math.sin(currentAngle.value) * radius
          camera.lookAt(0, 0, 0)
        },
      },
      '+=0.2'
    )

    timeline.to(
      overlay,
      {
        opacity: 0,
        duration: 1.5,
        ease: 'power2.inOut',
        onComplete: () => {
          overlay!.remove()
        },
      },
      '<'
    )

    // @ts-ignore
    timeline.add(() => {
      const allChars = document.querySelectorAll('.char, .space')

      const textTimeline = gsap.timeline()

      textTimeline.to(allChars, {
        duration: 0.1,
        opacity: 1,
        ease: 'power2.inOut',
        stagger: {
          amount: 1,
          each: 0.1,
          from: 'random',
          repeat: 2,
          yoyo: true,
        },
      })

      textTimeline.to(allChars, {
        duration: 0.1,
        opacity: 1,
        ease: 'power2.inOut',
        stagger: {
          amount: 1,
          each: 0.1,
          from: 'random',
          repeat: 1,
          yoyo: true,
        },
      })

      textTimeline.to(allChars, {
        duration: 0.15,
        opacity: 1,
        ease: 'power2.inOut',
        stagger: {
          amount: 1,
          each: 0.2,
          from: 'random',
        },
      })

      return textTimeline
    }, '-=1')

    return timeline
  }

  // 6. Post-Processing Setup
  const renderScene = new RenderPass(scene, camera)
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    2.0,
    0.25,
    0.5
  )

  // 7. Film Grain Effect (可跳過)
  const FilmGrainShader = {
    uniforms: {
      tDiffuse: { value: null },
      time: { value: 0 },
      amount: { value: 0.15 },
      speed: { value: 2.0 },
      size: { value: 1.0 },
    },

    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,

    fragmentShader: `
      uniform float time;
      uniform float amount;
      uniform float speed;
      uniform float size;
      uniform sampler2D tDiffuse;
      varying vec2 vUv;

      float random(vec2 co) {
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
      }

      void main() {
        vec4 color = texture2D(tDiffuse, vUv);
        vec2 position = vUv;
        position *= size;
        float grain = random(position * time * speed);
        color.rgb += grain * amount;
        gl_FragColor = color;
      }
    `,
  }

  const filmGrainPass = new ShaderPass(FilmGrainShader)
  filmGrainPass.renderToScreen = true

  const composer = new EffectComposer(renderer)
  composer.addPass(renderScene)
  composer.addPass(bloomPass)
  composer.addPass(filmGrainPass)

  // 8. Animation and Render Loop
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor
  }
  const animate = () => {
    requestAnimationFrame(animate)

    filmGrainPass.uniforms.time.value = performance.now() * 0.001

    if (animationComplete) {
      currentAngle.value = lerp(currentAngle.value, targetAngle.value, 0.025)
      currentY.value = lerp(currentY.value, targetY.value, 0.025)

      camera.position.x = Math.cos(currentAngle.value) * radius
      camera.position.z = Math.sin(currentAngle.value) * radius
      camera.position.y = lerp(camera.position.y, currentY.value, 0.05)
    }

    camera.lookAt(0, 0, 0)
    composer.render()
  }

  onWindowResize.value = () => {
    camera.aspect = width.value / height.value
    camera.updateProjectionMatrix()
    renderer.setSize(width.value, height.value)
    composer.setSize(width.value, height.value)
  }

  animate()
})
onMounted(() => {
  window.addEventListener('resize', onWindowResize.value, false)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize.value, false)
})

// 9. Window Resize Event Listener
// onNuxtReady(() => {
//   animate()
// })
</script>

<style scoped src="./index.scss"></style>
