export class Message<T> {

  public timestamp: number;

  constructor(
    public content,
    public target: string,
    protected hostname: string,
  ) {
    this.timestamp = Date.now();
  }

}