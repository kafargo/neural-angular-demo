import { HttpInterceptorFn } from '@angular/common/http';

export const corsInterceptor: HttpInterceptorFn = (req, next) => {
  // Only add json headers for json endpoints, not for images
  const corsReq = req.clone({
    setHeaders: {
      // Set appropriate headers based on the request type
      'Content-Type': req.url.includes('/image') ? 'image/png' : 'application/json',
      'Accept': req.url.includes('/image') ? 'image/png' : 'application/json, text/plain, */*'
    },
  });

  return next(corsReq);
};
