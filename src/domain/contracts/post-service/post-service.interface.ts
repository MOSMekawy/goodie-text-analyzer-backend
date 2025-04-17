import { Post } from './post';
import { Response } from '../response';

export interface IPostService {
  /**
   * Retrieves the ids of top stories
   */
  getTopPostIds(): Promise<Response<Array<number>>>;

  /**
   * Retrieves a story by its id
   * @param id The id of the story to retrieve
   */
  getPostById(id: number): Promise<Response<Post>>;
}
