// v-reveal: adds the .reveal class immediately and .is-visible once
// the element crosses into the viewport. One consistent treatment
// used across the whole site rather than a different animation per
// section (see frontend-design guidance: one orchestrated effect
// beats scattered ones).

const observer =
  typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible')
              observer.unobserve(entry.target)
            }
          }
        },
        { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
      )
    : null

export const reveal = {
  mounted(el) {
    el.classList.add('reveal')
    if (!observer) {
      el.classList.add('is-visible')
      return
    }
    observer.observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  }
}
