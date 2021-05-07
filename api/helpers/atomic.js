export class AtomicInt32Array {
  /**
   * @var {Int32Array}
   */
  #array;

  constructor(elementCount) {
    const buffer = new SharedArrayBuffer(
      Int32Array.BYTES_PER_ELEMENT * elementCount,
    );

    this.#array = new Int32Array(buffer).fill(0);
  }

  /**
   * @return {number}
   */
  get(index) {
    return Atomics.load(this.#array, index);
  }

  /**
   * @return {number}
   */
  set(index, value) {
    return Atomics.store(this.#array, index, value);
  }

  /**
   * @return {number}
   */
  add(index, value) {
    Atomics.add(this.#array, index, value);

    return this.get(index);
  }

  /**
   * @return {number}
   */
  increment(index) {
    return this.add(index, 1);
  }

  /**
   * @return {number}
   */
  decrement(index) {
    return this.add(index, -1);
  }

  /**
   * @return {number}
   */
  sum() {
    return this.#array.reduce((acc, a) => acc + a);
  }

  forEach(cb, thisArg) {
    this.#array.forEach(cb, thisArg);
  }

  /**
   * @param {number} index
   * @param {number} value
   */
  waitFor(index, value) {
    return Atomics.wait(this.#array, index, value, Infinity);
  }

  /**
   * Check whether the value at index `index` equals `test` and if not, set it to `set`
   * @param {number} index
   * @param {number} test
   * @param {number} set
   */
  testAndSet(index, test, set) {
    return Atomics.compareExchange(this.#array, index, test, set);
  }
}

export class AtomicCounter {
  /**
   * @var {AtomicInt32Array}
   */
  #atomicArray;

  constructor() {
    this.#atomicArray = new AtomicInt32Array(1);
  }

  /**
   * @return {number}
   */
  get value() {
    return this.#atomicArray.get(0);
  }

  /**
   * @param {number} value
   */
  forceSetValue(value) {
    this.#atomicArray.set(0, value);
  }

  /**
   * @return {number}
   */
  increment() {
    return this.#atomicArray.increment(0);
  }


  /**
   * @return {number}
   */
  decrement() {
    return this.#atomicArray.decrement(0);
  }

  /**
   * @param {number} value
   */
  waitFor(value) {
    return this.#atomicArray.waitFor(0, value);
  }

  /**
   * Check whether the value equals `test` and if not, set it to `set`
   * @param {number} test
   * @param {number} set
   */
  testAndSet(test, set) {
    return this.#atomicArray.testAndSet(0, test, set);
  }
}

export class AtomicBool {
  /**
   * @var {AtomicCounter}
   */
  #atomicCounter;

  constructor() {
    this.#atomicCounter = new AtomicCounter();
  }

  /**
   * @return {boolean}
   */
  get value() {
    return 1 === this.#atomicCounter.value;
  }

  /**
   * @param {boolean} bool
   */
  set value(bool) {
    this.#atomicCounter.forceSetValue(Number(bool));
  }

  /**
   * @param {boolean} bool
   */
  waitFor(bool) {
    return this.#atomicCounter.waitFor(Number(bool));
  }

  /**
   * Check whether the value equals `test` and if not, set it to `set`
   * @param {boolean} test
   * @param {boolean} set
   */
  testAndSet(test, set) {
    return Boolean(this.#atomicCounter.testAndSet(Number(test), Number(set)));
  }
}
