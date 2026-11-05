import {
  str,
  clamp,
  cycle,
  bounded,
  App,
  MINUTE,
  DAY,
  type Settings,
  type Shape,
  type View,
} from "./lib.ts";

export class AppModel extends App {
  hunger = 20;
  energy = 80;
  joy = 80;
  last = 0;
  action = 0;
  names = ["Feed", "Play", "Rest"];
  constructor(s: Settings, saved: Settings, now: number) {
    super(s, saved, now);
    this.hunger = bounded(saved.hunger, 0, 100, 20);
    this.energy = bounded(saved.energy, 0, 100, 80);
    this.joy = bounded(saved.joy, 0, 100, 80);
    this.last = bounded(saved.last, 0, now, now);
    this.tick(now);
  }
  tick(now: number): void {
    const steps = Math.floor(clamp(now - this.last, 0, 7 * DAY) / MINUTE);
    if (steps > 0) {
      this.hunger = clamp(this.hunger + steps * 0.2, 0, 100);
      this.energy = clamp(this.energy - steps * 0.1, 0, 100);
      this.joy = clamp(this.joy - steps * 0.1, 0, 100);
      this.last = now;
    }
    if (now < this.last) this.last = now;
  }
  key(key: string, delta: number, now: number): boolean {
    this.tick(now);
    if (key === "wheel") this.action = cycle(this.action, delta, 3);
    if (key === "ok") {
      if (this.action === 0) this.hunger = clamp(this.hunger - 25, 0, 100);
      if (this.action === 1) {
        this.joy = clamp(this.joy + 25, 0, 100);
        this.energy = clamp(this.energy - 10, 0, 100);
      }
      if (this.action === 2) this.energy = clamp(this.energy + 25, 0, 100);
    }
    return false;
  }
  save(): Settings {
    return {
      hunger: this.hunger,
      energy: this.energy,
      joy: this.joy,
      last: this.last,
    };
  }
  view(now: number): View {
    const happy = this.joy > 30 && this.hunger < 80;
    const blink = Math.floor(now / 3000) % 5 === 0;
    const c = str(this.settings, "mood_color", "#7BE5B1");
    const shapes: Shape[] = [
      { x: 25, y: 3, width: 22, height: 12, color: c },
      { x: 23, y: 1, width: 5, height: 6, color: c },
      { x: 44, y: 1, width: 5, height: 6, color: c },
      { x: 29, y: 6, width: 3, height: blink ? 1 : 3, color: "#000000FF" },
      { x: 40, y: 6, width: 3, height: blink ? 1 : 3, color: "#000000FF" },
      { x: 33, y: 11, width: 6, height: happy ? 2 : 1, color: "#000000FF" },
    ];
    return {
      title: str(this.settings, "name"),
      value: this.names[this.action],
      rows: [
        "Food " + Math.round(100 - this.hunger) + "%",
        "Energy " +
          Math.round(this.energy) +
          "% / Joy " +
          Math.round(this.joy) +
          "%",
        happy ? "Feeling good" : "Could use some care",
      ],
      shapes,
      hint: "Wheel action / OK care",
    };
  }
}
