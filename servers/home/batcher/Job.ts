export class Job {

  public requiredRam = 0;

  constructor(
    public target: string,
    public type: 'hack' | 'grow' | 'weaken',
    public threads: number,
    public endTime: number,
    public reportPort: number,
  ) {
    this.requiredRam = threads * 1.75;
  }
}