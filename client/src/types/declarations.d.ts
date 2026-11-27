declare module 'canvas-confetti' {
  export interface Options {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    origin?: { x?: number; y?: number };
  }
  export default function confetti(options?: Options): Promise<null> | null;
}
