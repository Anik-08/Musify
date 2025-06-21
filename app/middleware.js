import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/', '/api(.*)'],
  async afterAuth(auth, req) {
    if (auth.userId && req.nextUrl.pathname === '/admin') {
      const user = await auth.getUser();
      if (!user?.publicMetadata?.isAdmin) {
        return Response.redirect(new URL('/dashboard', req.url));
      }
    }
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};