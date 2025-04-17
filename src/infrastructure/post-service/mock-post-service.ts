import { Injectable } from '@nestjs/common';
import { IPostService } from '../../domain/contracts/post-service/post-service.interface';
import { Post } from '../../domain/contracts/post-service/post';
import { Response } from '../../domain/contracts/response';
import Posts from './mock-posts.json';

@Injectable()
export class MockPostService implements IPostService {
  private posts: Post[] = Posts;

  async getTopPostIds(): Promise<Response<Array<number>>> {
    const ids = this.posts
      .sort((a, b) => b.score - a.score)
      .map(post => post.id);

    return new Response<Array<number>>(
      true,
      200,
      ids,
    );
  }

  async getPostById(id: number): Promise<Response<Post>> {
    const post = this.posts.find(p => p.id === id);

    if (!post) {
      return new Response<Post>(
        false,
        404,
        null,
        'Post not found',
      );
    }

    return new Response<Post>(
      true,
      200,
      post,
    );
  }
}
