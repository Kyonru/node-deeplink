import { Request, Response, NextFunction } from 'express';

declare module '@kyonru/node-deeplink' {
  export interface DeepLinkingOptions {
    fallback: string;
    android_package_name?: string;
    ios_store_link?: string;
    label?: string;
    title?: string;
    timeout?: number;
    usePathOnFallback?: boolean;
  }

  type ExpressMiddleware = (
    req: Request,
    res: Response,
    nex: NextFunction
  ) => void;

  function deeplink(options: DeepLinkingOptions): ExpressMiddleware;
}
