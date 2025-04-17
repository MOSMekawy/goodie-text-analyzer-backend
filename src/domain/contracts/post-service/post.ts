export class Post {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly by: string,
    public readonly time: number,
    public readonly url?: string,
    public readonly text?: string,
    public readonly score?: number,
    public readonly parent?: number,
    public readonly descendants?: number,
    public readonly kids?: number[],
  ) {}

  /**
   * Creates a Post instance from a JSON object
   */
  public static fromJson(json: any): Post {
    return new Post(
      json.id,
      json.title,
      json.by,
      json.time,
      json.url,
      json.text,
      json.score,
      json.descendants,
      json.kids,
    );
  }
}
