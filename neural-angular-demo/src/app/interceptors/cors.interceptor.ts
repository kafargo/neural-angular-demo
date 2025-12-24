import { HttpInterceptorFn } from '@angular/common/http';

export const corsInterceptor: HttpInterceptorFn = (req, next) => {
  // Don't modify headers for GET requests - Angular handles them correctly
  // Only set Content-Type for POST/PUT/PATCH requests if not already set
  if (req.method === 'GET' || req.headers.has('Content-Type')) {
    return next(req);
  }

  // For non-GET requests without Content-Type, set application/json
  const corsReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json'
    },
  });

  return next(corsReq);
};
