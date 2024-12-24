<template>
  <main>
    <div ref="corridorRef" class="corridor"></div>
    <div ref="loadingRef" class="loading">Loading Scene</div>
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
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { CopyShader } from 'three/addons/shaders/CopyShader.js'
import { LuminosityHighPassShader } from 'three/addons/shaders/LuminosityHighPassShader.js'

useSeoMeta({
  title: 'Project 1',
})

const { width, height } = useWindowSize()
const corridorRef = ref<HTMLElement | null>(null)
const loadingRef = ref<HTMLElement | null>(null)

onNuxtReady(() => {
  // 1. Basic Scene Setup
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)

  const camera = new THREE.PerspectiveCamera(
    75,
    width.value / height.value,
    0.1,
    1000
  )

  const renderer = new THREE.WebGLRenderer({
    powerPreference: 'high-performance',
    antialias: false,
    stencil: false,
    depth: false,
  })
  renderer.setSize(width.value, height.value)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  // renderer.outputColorSpace = THREE.SRGBColorSpace
  // @ts-ignore
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.toneMapping = THREE.NoToneMapping
  corridorRef.value?.appendChild(renderer.domElement)

  // 2. Lighting Setup (可跳過)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const keyLight = new THREE.DirectionalLight(0xffffff, 0.5)
  keyLight.position.set(5, 8, 5)
  keyLight.castShadow = true
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5)
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
  const currentAngle = ref(initialAngle)
  const targetAngle = ref(initialAngle)
  const currentY = ref(0)
  const targetY = ref(0)

  camera.position.set(5, 0, 5)
  camera.lookAt(0, 0, 0)

  // 4. Parallax Control Setup
  const mouseX = ref(0)
  const mouseY = ref(0)
  const windowHalfX = computed(() => width.value / 2)
  const windowHalfY = computed(() => height.value / 2)

  const { x, y } = useMouse()
  watchEffect(() => {
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
    gltf.scene.traverse((child) => {
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

    const box = new THREE.Box3().setFromObject(gltf.scene)
    const center = box.getCenter(new THREE.Vector3())
    gltf.scene.position.sub(center)
    scene.add(gltf.scene)
    loadingRef.value?.remove()
  })

  // 6. Post-Processing Setup
  const renderScene = new RenderPass(scene, camera)
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width.value, height.value),
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
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float amount;
    uniform float speed;
    uniform float size;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec2 position = vUv;
      position *= size;
      float grain = rand(position * speed * speed);
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

    currentAngle.value = lerp(currentAngle.value, targetAngle.value, 0.025)
    currentY.value = lerp(currentY.value, targetY.value, 0.025)

    camera.position.x = Math.cos(currentAngle.value) * radius
    camera.position.z = Math.sin(currentAngle.value) * radius
    camera.position.y = lerp(camera.position.y, currentY.value, 0.05)

    camera.lookAt(0, 0, 0)

    composer.render()
  }

  animate()

  const onWindowResize = () => {
    camera.aspect = width.value / height.value
    camera.updateProjectionMatrix()
    renderer.setSize(width.value, height.value)
    composer.setSize(width.value, height.value)
  }
  window.addEventListener('resize', onWindowResize, false)
})

// 9. Window Resize Event Listener
// onNuxtReady(() => {
//   animate()
// })
</script>

<style scoped src="./index.scss"></style>
