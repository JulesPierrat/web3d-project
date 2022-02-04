class LowPassFilter {
    constructor(alpha) {
      this.setAlpha(alpha);
      this.y = null;
      this.s = null;
    }
    
    setAlpha(alpha) {
      if (alpha <= 0 || alpha > 1.0) {
        throw new Error();
      }
      this.alpha = alpha;
    }
    
    filter(value, timestamp, alpha) {
      if (alpha) {
        this.setAlpha(alpha);
      }
      let s;
      if (!this.y) {
        s = value;
      } else {
        s = this.alpha * value + ( 1.0 - this.alpha ) * this.s;
      }
      this.y = value;
      this.s = s;
      return s;
    }
    
    lastValue() {
      return this.y;
    }
  }
  