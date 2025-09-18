import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ApiResponseDto } from '../response.interface';


@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    const response = context.switchToHttp().getResponse();

    return next.handle()
      .pipe(
        map(responseData => {

          // WITH PAGINATION
          if (responseData && typeof responseData === 'object' && 'items' in responseData && 'meta' in responseData) {
            const { items, meta } = responseData;
            return {
              statusCode: response.statusCode,
              message: 'Success',
              data: items,
              meta: meta,
            };
          }

          // NO PAGINATION
          return {
            statusCode: response.statusCode,
            message: 'Success',
            data: responseData,
          };
        }),
      );
  }
}
