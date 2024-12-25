<template>
  <main>
    <nav>
      <p id="logo">
        <NuxtLink to="/">Home</NuxtLink>
      </p>
    </nav>
    <section class="hero">
      <p>Scroll Down</p>
    </section>

    <section ref="stickyRef" class="sticky">
      <div class="col">
        <div class="services">
          <div ref="indicatorRef" class="indicator"></div>
          <div class="service active"><p>Deliverables</p></div>
          <div class="service"><p>Brand & Event Design</p></div>
          <div class="service"><p>Video & Fotographie</p></div>
          <div class="service"><p>Motion Design</p></div>
          <div class="service"><p>3D Graphics</p></div>
          <div class="service"><p>Print & Drukwork</p></div>
          <div class="service"><p>Digital Antwerp (UI/UX)</p></div>
          <div class="service"><p>Web Development</p></div>
        </div>
      </div>
      <div class="col">
        <div class="service-img-wrapper">
          <div ref="serviceImgRef" class="service-img">
            <div class="img">
              <HDImg src="/img/card-1.jpg" />
            </div>
            <div class="img">
              <HDImg src="/img/card-2.jpg" />
            </div>
            <div class="img">
              <HDImg src="/img/card-3.jpg" />
            </div>
            <div class="img">
              <HDImg src="/img/card-4.jpg" />
            </div>
            <div class="img">
              <HDImg src="/img/card-5.jpg" />
            </div>
            <div class="img">
              <HDImg src="/img/card-6.jpg" />
            </div>
            <div class="img">
              <HDImg src="/img/card-7.jpg" />
            </div>
            <div class="img">
              <HDImg src="/img/card-8.jpg" />
            </div>
          </div>
        </div>
        <div class="service-copy">
          <p ref="serviceCopyRef">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Natus
            error quidem, alias rem reiciendis quod excepturi, ratione neque
            nemo, ab repellendus quo! Voluptas, dolorum!
          </p>
        </div>
      </div>

      <div class="progress-bar">
        <div class="progress"></div>
      </div>

      <div class="index">
        <span ref="currentCountRef" id="current-count">1</span>
        <span class="separator"></span>
        <span class="total-count">8</span>
      </div>
    </section>

    <section class="outro">
      <p>Your next section goes here</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import HDImg from '~/components/UI/HDImg.vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { servicesCopy } from './services'
import SplitType from 'split-type'

gsap.registerPlugin(ScrollTrigger)
const { width, height } = useWindowSize()
const stickyRef = ref<HTMLElement | null>(null)
const indicatorRef = ref<HTMLElement | null>(null)
const serviceImgRef = ref<HTMLElement | null>(null)
const serviceCopyRef = ref<HTMLElement | null>(null)
const currentCountRef = ref<HTMLElement | null>(null)

onNuxtReady(() => {
  const lenis = new Lenis({})

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  const stickyHeight = window.innerHeight * 8
  const services = document.querySelectorAll('.service')
  const serviceHeight = ref(services[0].clientHeight)
  const imgHeight = 250

  serviceCopyRef.value!.textContent = servicesCopy[0][0]
  let currentSplitText = new SplitType(serviceCopyRef.value!, {
    types: 'lines',
  })

  const measureContainer = document.createElement('div')
  measureContainer.style.cssText = `
      position: absolute;
      visibility: hidden;
      height: auto;
      width: auto;
      white-space: nowrap;
      font-family: "PP NeueBit";
      font-size: ${serviceHeight.value}px;
      font-weight: 600;
      text-transform: uppercase;
  `
  document.body.appendChild(measureContainer)

  const serviceWidths = Array.from(services).map((service) => {
    measureContainer.textContent = service.querySelector('p')!.textContent
    return measureContainer.offsetWidth + 8
  })

  document.body.removeChild(measureContainer)

  gsap.set(indicatorRef.value, {
    width: serviceWidths[0],
    xPercent: -50,
    left: '50%',
  })

  const scrollPerService = window.innerHeight
  let currentIndex = 0

  const animateTextChange = (index: number) => {
    return new Promise((resolve) => {
      gsap.to(currentSplitText.lines, {
        opacity: 0,
        y: -20,
        duration: 0.25,
        stagger: 0.025,
        ease: 'power3.inOut',
        onComplete: () => {
          currentSplitText.revert()

          const newText = servicesCopy[index][0]
          serviceCopyRef.value!.textContent = newText

          currentSplitText = new SplitType(serviceCopyRef.value!, {
            types: 'lines',
          })

          gsap.set(currentSplitText.lines, {
            opacity: 0,
            y: 20,
          })

          gsap.to(currentSplitText.lines, {
            opacity: 1,
            y: 0,
            duration: 0.25,
            stagger: 0.025,
            ease: 'power3.out',
            onComplete: resolve,
          })
        },
      })
    })
  }

  ScrollTrigger.create({
    trigger: stickyRef.value,
    start: 'top top',
    end: `${stickyHeight}px`,
    pin: true,
    onUpdate: async (self) => {
      const progress = self.progress
      gsap.set('.progress', { scaleY: progress })

      const scrollPosition = Math.max(0, self.scroll() - window.innerHeight)
      const activeIndex = Math.floor(scrollPosition / scrollPerService)

      if (
        activeIndex >= 0 &&
        activeIndex < services.length &&
        currentIndex !== activeIndex
      ) {
        currentIndex = activeIndex

        services.forEach((service) => service.classList.remove('active'))
        services[activeIndex].classList.add('active')

        await Promise.all([
          gsap.to(indicatorRef.value, {
            y: activeIndex * serviceHeight.value,
            width: serviceWidths[activeIndex],
            duration: 0.3,
            ease: 'power3.inOut',
            overwrite: true,
          }),

          gsap.to(serviceImgRef.value, {
            y: -(activeIndex * imgHeight),
            duration: 0.3,
            ease: 'power3.inOut',
            overwrite: true,
          }),

          gsap.to(currentCountRef.value, {
            innerText: activeIndex + 1,
            snap: { innerText: 1 },
            duration: 0.3,
            ease: 'power3.out',
          }),

          animateTextChange(activeIndex),
        ])
      }
    },
  })
})
</script>

<style scoped src="./index.scss"></style>
