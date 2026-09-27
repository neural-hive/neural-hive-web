<template>
  <section class="section concentration">
    <div class="container">

      <!-- INTRO -->
      <div class="qa qa-intro">
        <div
          class="qa__question reveal reveal-left"
          ref="revealElements"
        >
          <p class="eyebrow">The concentration problem</p>

          <h2 class="display-2">
            Superintelligence should not become a private room with five keys.
          </h2>
        </div>

        <div
          class="qa__answer lede reveal reveal-right"
          ref="revealElements"
        >
          <p>
            OpenAI, Anthropic and other frontier labs are pushing intelligence
            forward at a remarkable speed.
          </p>

          <p>
            That progress matters. So does who gets to shape what comes next.
          </p>
        </div>
      </div>


      <!-- 01 -->
      <div class="qa">
        <div
          class="qa__question reveal reveal-left"
          ref="revealElements"
        >
          <p class="eyebrow">The problem</p>

          <p class="statement">
            What happens as intelligence becomes more powerful?
          </p>
        </div>

        <div
          class="qa__answer lede reveal reveal-right"
          ref="revealElements"
        >
          <p>
            Control over it is becoming more concentrated.
          </p>

          <p>
            A handful of companies are building the systems that could reshape
            how we work, create, compete, and make decisions.
          </p>
        </div>
      </div>


      <!-- 02 -->
      <div class="qa">
        <div
          class="qa__question reveal reveal-left"
          ref="revealElements"
        >
          <p class="statement">
            What does it mean to control the most powerful intelligence?
          </p>
        </div>

        <div
          class="qa__answer reveal reveal-right"
          ref="revealElements"
        >
          <p class="quiet__emphasis">
            They control who gets access.<br />
            They control who gets to build.<br />
            They control who gets left behind.
          </p>
        </div>
      </div>


      <!-- 03 -->
      <div class="qa">
        <div
          class="qa__question reveal reveal-left"
          ref="revealElements"
        >
          <p class="statement">
            What happens when the intelligence shaping your future isn't yours?
          </p>
        </div>

        <div
          class="qa__answer lede reveal reveal-right"
          ref="revealElements"
        >
          <p>
            What happens when your profession can be transformed by a system
            you don't control?
          </p>

          <p>
            What happens when your expertise becomes a capability inside
            someone else's machine?
          </p>
        </div>
      </div>


      <!-- 04 -->
      <div class="qa qa-final">
        <div
          class="qa__question reveal reveal-left"
          ref="revealElements"
        >
          <p class="statement">
            Is this really about whether AI should exist?
          </p>
        </div>

        <div
          class="qa__answer reveal reveal-right"
          ref="revealElements"
        >
          <p class="statement answer-no">
            No.
          </p>

          <p class="statement">
            It's about who gets a seat at the table.
          </p>
        </div>
      </div>


      <!-- FINAL -->
<!-- FINAL -->
<div class="qa qa-final">

  <div
    class="qa__question reveal reveal-left"
    ref="revealElements"
  >
    <p class="statement final-question">
      Can we safeguard our future before someone else decides it for us?
    </p>
  </div>

  <div
    class="qa__answer reveal reveal-right"
    ref="revealElements"
  >
    <p class="statement">
      There is a way. <br> <span class="hive-end"> The Neural HIVE - Internet of AI. </span>
    </p>


  </div>

</div>

    </div>
  </section>
</template>


<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

let observer = null

onMounted(() => {
  const elements = document.querySelectorAll(
    '.concentration .reveal'
  )

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -10% 0px'
    }
  )

  elements.forEach((element) => {
    observer.observe(element)
  })
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>


<style scoped>
/* ================================
   QUESTION / ANSWER LAYOUT
================================ */

.final-question {
  font-size: 1.5rem !important;
  line-height: 1.2;
}

.hive-end {
  color: #5CE1E6;
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 8px 0 0;
}

.qa {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: start;

  min-height: 38vh;
  padding: 80px 0;

  border-bottom: 1px solid var(--line);
}

.qa-intro {
  padding-top: 20px;
}

.qa__question {
  max-width: 560px;
}

.qa__answer {
  max-width: 620px;
  padding-top: 24px;
}


/* ================================
   TYPOGRAPHY
================================ */

.statement {
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 650;
  line-height: 1.2;
  padding-top: 8px;
}

.qa__question .statement {
  font-size: 1.65rem;
}

.quiet__emphasis {
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 650;
  line-height: 1.35;
}

.answer-no {
  font-size: 2rem !important;
  margin-bottom: 12px;
}


/* ================================
   REVEAL ANIMATIONS
================================ */

/*
   Initial state
   Everything starts invisible.
*/

.reveal {
  opacity: 0;

  will-change: opacity, transform;

  transition:
    opacity 0.9s ease,
    transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}


/*
   Questions fly in from the LEFT
*/

.reveal-left {
  transform: translateX(-70px);
}


/*
   Answers fly in from the RIGHT
*/

.reveal-right {
  transform: translateX(70px);
}


/*
   Final statement rises UP
*/

.reveal-up {
  transform: translateY(60px);
}


/*
   Visible state
*/

.reveal.is-visible {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}


/* ================================
   STAGGER
================================ */

/*
   Small delay on answers so the question
   arrives slightly before the answer.
*/

.qa__question.reveal {
  transition-delay: 0s;
}

.qa__answer.reveal {
  transition-delay: 0.12s;
}


/* ================================
   FINAL SECTION
================================ */

.qa-final {
  border-bottom: 0;
  padding-bottom: 40px;
}

.final-statement {
  max-width: 800px;
  padding: 40px 0 100px;
}

.final-statement .statement {
  font-size: 2rem;
}


/* ================================
   MOBILE
================================ */

@media (max-width: 860px) {

  .qa {
    grid-template-columns: 1fr;

    gap: 24px;

    min-height: auto;

    padding: 56px 0;
  }

  .qa__answer {
    padding-top: 0;
  }


  /*
     On mobile, don't fly horizontally.
     Everything rises naturally instead.
  */

  .reveal-left,
  .reveal-right {
    transform: translateY(35px);
  }

  .reveal-up {
    transform: translateY(35px);
  }

  .qa__answer.reveal {
    transition-delay: 0.08s;
  }


  .qa-final {
    padding-bottom: 20px;
  }

  .final-statement {
    padding-top: 30px;
  }
}


/* ================================
   REDUCED MOTION
================================ */

@media (prefers-reduced-motion: reduce) {

  .reveal,
  .reveal-left,
  .reveal-right,
  .reveal-up {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>