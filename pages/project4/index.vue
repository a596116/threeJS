<template>
  <main>
    <div ref="modelRef" class="model"></div>

    <section class="hero">
      <h1>Digital <br />Evolution</h1>
      <h2>Transform Your Brand Identity</h2>
      <p>
        Experience the next generation of digital product design. We craft
        immersive experiences that blend innovation with functionality, helping
        brands stand out in the digital landscape.
      </p>
    </section>

    <section class="info">
      <div class="tags">
        <p>Brand Strategy</p>
        <p>User Experience</p>
        <p>Digital Products</p>
        <p>Innovation Lab</p>
      </div>
      <h2>
        We believe in creating digital products that not only look exceptional
        but drive real business growth and user engagement through thoughtful
        design and strategic innovation.
      </h2>
      <p>
        Our approach combines cutting-edge technology with human-centered design
        principles. We transform complex challenges into seamless digital
        experiences that resonate with your audience and elevate your brand in
        the digital space.
      </p>
    </section>

    <section ref="scannerRef" class="scanner">
      <div class="scan-info">
        <div class="product-id"><h2>#2024</h2></div>
        <div class="product-description">
          <p>Transform Your Digital Identity</p>
        </div>
      </div>

      <div ref="scanContainerRef" class="scan-container"></div>

      <div class="barcode">
        <img src="/img/barcode.png" alt="" />
      </div>

      <div class="purchased"><p>Innovation Verified</p></div>
    </section>

    <section class="outro">
      <h2>
        Join the revolution where innovative experience meets strategic
        thinking. Let's create products that don't just exist in digital space -
        they define it.
      </h2>
    </section>
  </main>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

gsap.registerPlugin(ScrollTrigger)
const modelRef = ref<HTMLElement | null>(null)
const scannerRef = ref<HTMLElement | null>(null)
const scanContainerRef = ref<HTMLElement | null>(null)

onNuxtReady(() => {
  const lenis = new Lenis({})

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  // 2. Scene Setup
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xfefdfd)

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  })
  renderer.setClearColor(0xffffff, 1)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  //   @ts-ignore
  renderer.physicallyCorrectLights = true
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 2.5
  modelRef.value?.appendChild(renderer.domElement)

  // 3. Lighting Setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 3)
  scene.add(ambientLight)

  const mainLight = new THREE.DirectionalLight(0xffffff, 1)
  mainLight.position.set(5, 10, 7.5)
  scene.add(mainLight)

  const fillLight = new THREE.DirectionalLight(0xffffff, 3)
  fillLight.position.set(-5, 0, -5)
  scene.add(fillLight)

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2)
  hemiLight.position.set(0, 25, 0)
  scene.add(hemiLight)

  // 4. Basic Animation Function (for initial rendering)
  function basicAnimate() {
    renderer.render(scene, camera)
    return requestAnimationFrame(basicAnimate)
  }
  basicAnimate()

  // 5. Load 3D Model
  let model: any
  const loader = new GLTFLoader()
  loader.load(
    '/josta.glb',
    function (gltf) {
      model = gltf.scene
      model.traverse((node: any) => {
        if (node.isMesh) {
          if (node.material) {
            node.material.metalness = 0.3
            node.material.roughness = 0.4
            node.material.envMapIntensity = 1.5
          }
          node.castShadow = true
          node.receiveShadow = true
        }
      })

      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      model.position.sub(center)
      scene.add(model)

      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      camera.position.z = maxDim * 1.5

      model.scale.set(0, 0, 0)
      playInitialAnimation()

      cancelAnimationFrame(basicAnimate())
      animate()
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    function (error) {
      console.error('An error happened:', error)
    }
  )

  // 6. Animation Variables
  const floatAmplitude = 0.2
  const floatSpeed = 1.5
  const rotationSpeed = 0.3
  let isFloating = true
  let currentScroll = 0

  // 7. Scanner Section Setup
  const stickyHeight = window.innerHeight
  const scannerPosition = scannerRef.value?.offsetTop
  const scanSound = new Audio('/scan-sfx.mp3')
  gsap.set(scanContainerRef.value, { scale: 0 })

  // 8. Initial Animation
  function playInitialAnimation() {
    if (model) {
      gsap.to(model.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1,
        ease: 'power2.out',
      })
    }
    gsap.to(scanContainerRef.value, {
      scale: 1,
      duration: 1,
      ease: 'power2.out',
    })
  }

  // 9. Scroll Triggers
  ScrollTrigger.create({
    trigger: 'body',
    start: 'top top',
    end: 'top -10',
    onEnterBack: () => {
      if (model) {
        gsap.to(model.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 1,
          ease: 'power2.out',
        })
        isFloating = true
      }
      gsap.to(scanContainerRef.value, {
        scale: 1,
        duration: 1,
        ease: 'power2.out',
      })
    },
  })

  ScrollTrigger.create({
    trigger: '.scanner',
    start: 'top top',
    end: `${stickyHeight}px`,
    pin: true,
    onEnter: () => {
      if (model) {
        isFloating = false
        model.position.y = 0

        setTimeout(() => {
          scanSound.currentTime = 0
          scanSound.play()
        }, 500)

        gsap.to(model.rotation, {
          y: model.rotation.y + Math.PI * 2,
          duration: 1,
          ease: 'power2.inOut',
          onComplete: () => {
            gsap.to(model.scale, {
              x: 0,
              y: 0,
              z: 0,
              duration: 0.5,
              ease: 'power2.in',
              onComplete: () => {
                gsap.to(scanContainerRef.value, {
                  scale: 0,
                  duration: 0.5,
                  ease: 'power2.in',
                })
              },
            })
          },
        })
      }
    },
    onLeaveBack: () => {
      gsap.set(scanContainerRef.value, { scale: 0 })
      gsap.to(scanContainerRef.value, {
        scale: 1,
        duration: 1,
        ease: 'power2.out',
      })
    },
  })

  // 10. Scroll Event Handler
  lenis.on('scroll', (e) => {
    currentScroll = e.scroll
  })

  // 11. Window Resize Handler
  window.addEventListener('resize', onWindowResize, false)
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  // 12. Full Animation Loop
  function animate() {
    if (model) {
      if (isFloating) {
        const floatOffset =
          Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude
        model.position.y = floatOffset
      }

      const scrollProgress = Math.min(currentScroll / scannerPosition!, 1)

      if (scrollProgress < 1) {
        model.rotation.x = scrollProgress * Math.PI * 2
      }

      if (scrollProgress < 1) {
        model.rotation.y += 0.001 * rotationSpeed
      }

      //   if (scrollProgress < 1) {
      //     model.rotation.z += 0.1 * rotationSpeed
      //   }
    }

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }
})
</script>

<style scoped src="./index.scss"></style>
