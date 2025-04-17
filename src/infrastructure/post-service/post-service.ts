import { Injectable } from '@nestjs/common';
import { IPostService } from '../../domain/contracts/post-service/post-service.interface';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Post } from '../../domain/contracts/post-service/post';
import { Response } from '../../domain/contracts/response';

@Injectable()
export class PostService implements IPostService {
  constructor(private readonly httpService: HttpService) {}

  async getTopPostIds(): Promise<Response<Array<number>>> {
    const response = await firstValueFrom(
      this.httpService.get<number[]>(
        'https://hacker-news.firebaseio.com/v0/topstories.json',
      ),
    );

    return new Response<Array<number>>(
      response.status === 200,
      response.status,
      response.data,
      response.statusText,
    );
  }

  async getPostById(id: number): Promise<Response<Post>> {
    const response = await firstValueFrom(
      this.httpService.get<Post>(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
      ),
    );

    return new Response<Post>(
      response.status === 200,
      response.status,
      response.data,
      response.statusText,
    );
  }
}
