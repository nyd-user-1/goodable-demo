export class TextScrambler {
  private el: HTMLElement;
  private chars: string;
  private resolve?: () => void;
  private queue: Array<{
    from: string;
    to: string;
    start: number;
    end: number;
    char?: string;
  }> = [];
  private frameRequest?: number;
  private frame: number = 0;

  constructor(el: HTMLElement, chars: string = '!<>-_\\/[]{}—=+*^?#________') {
    this.el = el;
    this.chars = chars;
  }

  setText(newText: string): Promise<void> {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise<void>((resolve) => (this.resolve = resolve));
    this.queue = [];

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }

    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
    }
    this.frame = 0;
    this.update();
    return promise;
  }

  private update = () => {
    let output = '';
    let complete = 0;

    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];

      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += char;
      } else {
        output += from;
      }
    }

    this.el.innerText = output;

    if (complete === this.queue.length) {
      if (this.resolve) this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  };

  private randomChar(): string {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}
