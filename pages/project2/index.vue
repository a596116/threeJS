<template>
  <main>
    <div class="container">
      <nav>
        <p id="logo">HaoDai</p>
        <button>Download Now</button>
      </nav>

      <section class="intro"></section>

      <section ref="stepsRef" class="steps">
        <div class="step-counter">
          <div class="counter-title">
            <h1>Steps</h1>
          </div>
          <div class="count">
            <div ref="countContainerRef" class="count-container">
              <h1>01</h1>
              <h1>02</h1>
              <h1>03</h1>
              <h1>04</h1>
              <h1>05</h1>
            </div>
          </div>
        </div>

        <div class="cards">
          <div ref="cardRef" class="card">
            <div class="card-img">
              <HDImg src="/img/card-1.jpg" />
            </div>
            <div class="card-content">
              <p>
                Effortlessly import your 3D models and assets into our intui
                tive design tool, ensuring that projects are set up quickly .
              </p>
            </div>
          </div>
          <div ref="cardRef" class="card">
            <div class="card-img">
              <HDImg src="/img/card-2.jpg" />
            </div>
            <div class="card-content">
              <p>
                Effortlessly import your 3D models and assets into our intui
                tive design tool, ensuring that projects are set up quickly .
              </p>
            </div>
          </div>
          <div ref="cardRef" class="card">
            <div class="card-img">
              <HDImg src="/img/card-3.jpg" />
            </div>
            <div class="card-content">
              <p>
                Effortlessly import your 3D models and assets into our intui
                tive design tool, ensuring that projects are set up quickly .
              </p>
            </div>
          </div>
          <div ref="cardRef" class="card">
            <div class="card-img">
              <HDImg src="/img/card-4.jpg" />
            </div>
            <div class="card-content">
              <p>
                Effortlessly import your 3D models and assets into our intui
                tive design tool, ensuring that projects are set up quickly .
              </p>
            </div>
          </div>
          <div ref="cardRef" class="card">
            <div class="card-img">
              <HDImg src="/img/card-5.jpg" />
            </div>
            <div class="card-content">
              <p>
                Effortlessly import your 3D models and assets into our intui
                tive design tool, ensuring that projects are set up quickly .
              </p>
            </div>
          </div>

          <div ref="cardRef" class="card empty"></div>
          <div ref="cardRef" class="card empty"></div>
        </div>
      </section>

      <section class="outro">
        <p>
          Our 3D design tool is built to enhance tour creative workdlow,
          <span>providing an all-in-one solution</span>
          for crafting stunning visuals and prototypes.
        </p>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const { width, height } = useWindowSize()
const { x, y } = useWindowScroll()
const stepsRef = ref<HTMLElement | null>(null)
// const cardRef = ref<HTMLElement[] | null>(null)
const countContainerRef = ref<HTMLElement | null>(null)

const handleResize = ref()
onNuxtReady(() => {
  const lenis = new Lenis({})
  // function raf(time: any) {
  //   lenis.raf(time)
  //   requestAnimationFrame(raf)
  // }
  // requestAnimationFrame(raf)

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  const cards = document.querySelectorAll('.card')
  const stickyHeight = computed(() => height.value * 7)
  const totalCards = computed(() => cards?.length)

  ScrollTrigger.create({
    trigger: stepsRef.value,
    start: 'top top',
    end: `+=${stickyHeight.value}`,
    pin: true,
    pinSpacing: true,
    onUpdate: (self) => {
      postitionCards(self.progress)
    },
  })

  const getRadius = () => {
    return width.value < 900 ? width.value * 7.5 : width.value * 2.5
  }

  const arcAngle = Math.PI * 0.4
  const startAngle = Math.PI / 2 - arcAngle / 2

  const postitionCards = (progress = 0) => {
    const radius = getRadius()
    const totalTravel = 1 + totalCards.value! / 7.5
    const adjustedProgress = (progress * totalTravel - 1) * 0.75

    cards?.forEach((card, i) => {
      const normalizedProgress = (totalCards.value! - 1 - i) / totalCards.value!
      const cardProgress = normalizedProgress + adjustedProgress
      const angle = startAngle + arcAngle * cardProgress

      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      const rotation = (angle - Math.PI / 2) * (180 / Math.PI)

      gsap.set(card, {
        x: x,
        y: -y + radius,
        rotation: -rotation,
        transformOrigin: 'center center',
      })
    })
  }

  postitionCards(0)

  const currentCardIndex = ref(0)

  const options = {
    root: null,
    rootMargin: '0% 0%',
    threshold: 0.5,
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        let cardIndex = Array.from(cards).indexOf(entry.target)

        currentCardIndex.value = cardIndex

        const targetY = 150 - currentCardIndex.value * 150
        gsap.to(countContainerRef.value, {
          y: targetY,
          duration: 0.3,
          ease: 'power1.out',
          overwrite: true,
        })
      }
    }, options)
  }, options)

  cards.forEach((card) => {
    observer.observe(card)
  })

  handleResize.value = () => {
    postitionCards()
  }
})
onMounted(() => {
  window.addEventListener('resize', handleResize.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize.value)
})
</script>

<style scoped src="./index.scss"></style>
