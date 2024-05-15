import autobind from 'autobind-decorator';
import gsap from 'gsap';
import NormalizeWheel from 'normalize-wheel';

// Linear interpolation function
function lerp(a, b, t) {
  return (1 - t) * a + t * b;
}

class Slider {
  constructor({ element, elements, shouldRotate = true }) {
    this.element = element;
    this.elements = elements;

    this.transformPrefix = 'transform';
    this.disableVelocity = false;
    this.shouldRotate = shouldRotate;

    this.scroll = {
      ease: 0.1,
      position: 0,
      current: 0,
      target: 0,
      last: 0,
      clamp: 0,
    };

    this.init();
  }

  init() {
    this.create();
    this.update();
    this.addEventListeners();
  }

  create() {
    this.elements.list = this.element.querySelector(this.elements.list);
    this.elements.items = this.elements.list.children;

    this.length = this.elements.items.length;

    this.width = this.elements.items[0].getBoundingClientRect().width;
    this.widthTotal = this.elements.list.getBoundingClientRect().width;

    // Append a clone of the first item to the end
    const cloneFirst = this.elements.items[0].cloneNode(true);
    this.elements.list.appendChild(cloneFirst);

    // Prepend a clone of the last item to the beginning
    const cloneLast = this.elements.items[this.length - 1].cloneNode(true);
    this.elements.list.insertBefore(cloneLast, this.elements.items[0]);

    // Update length to include the clones
    this.length += 2;

    this.velocityValue = window.innerWidth <= 768 ? 0.5 : 1;
    this.velocity = this.velocityValue;
  }

  update() {
    this.scroll.target += this.velocity;

    // Check if the scroll position exceeds the bounds of the slider content
    if (this.scroll.current >= this.widthTotal && this.velocity > 0) {
      this.scroll.current = -this.width;
    } else if (this.scroll.current <= -this.width && this.velocity < 0) {
      this.scroll.current = this.widthTotal - this.width * 2;
    }

    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);

    for (let i = 0; i < this.length; i++) {
      const element = this.elements.items[i];
      element.style.transform = `translateX(-${this.scroll.current}px)`;
    }

    requestAnimationFrame(this.update.bind(this));
  }

  addEventListeners() {
    window.addEventListener('mousewheel', (event) => this.onWheel(event), { passive: false });
    window.addEventListener('wheel', (event) => this.onWheel(event), { passive: false });

    window.addEventListener('mousedown', (event) => this.onTouchDown(event), { passive: true });
    window.addEventListener('mousemove', (event) => this.onTouchMove(event), { passive: true });
    window.addEventListener('mouseup', (event) => this.onTouchUp(event), { passive: true });

    window.addEventListener('touchstart', (event) => this.onTouchDown(event), { passive: true });
    window.addEventListener('touchmove', (event) => this.onTouchMove(event), { passive: true });
    window.addEventListener('touchend', (event) => this.onTouchUp(event), { passive: true });

    window.addEventListener(
      'resize',
      () => {
        if (this.innerWidth === window.innerWidth) return;
        this.onResize();
        this.innerWidth = window.innerWidth;
      },
      { passive: true }
    );
  }

  onWheel(event) {
    if (!this.isSliderArea(event.target)) {
      return;
    }
    event.preventDefault();

    // Determine scroll direction
    const scrollDelta = event.deltaY * 0.1;
    const newVelocity = scrollDelta > 0 ? this.velocityValue : -this.velocityValue;

    // If the scroll direction changes, reset the scroll position to prevent abrupt changes
    if (Math.sign(this.velocity) !== Math.sign(newVelocity)) {
      this.scroll.target = this.scroll.current;
    }

    this.velocity = newVelocity;
  }

  onTouchDown(event) {
    if (!this.isSliderArea(event.target)) {
      return;
    }
    this.isDown = true;

    this.scroll.position = this.scroll.current;
    this.start = event.touches ? event.touches[0].clientX : event.clientX;
  }

  onTouchMove(event) {
    if (!this.isDown || !this.isSliderArea(event.target)) {
      return;
    }
    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const distance = (this.start - x) * 2;

    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp(event) {
    this.isDown = false;
  }

  onResize() {
    // Implement your resize logic here
  }

  isSliderArea(target) {
    // Check if the target is within the slider area
    return target.closest('.slider') !== null;
  }
}

const slider = new Slider({
  element: document.querySelector('.slider'),
  elements: {
    list: '.slider__list',
    items: '.slider__item',
  },
});
