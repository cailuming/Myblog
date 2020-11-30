import { RouteConfig } from 'vue-router'

const routes: RouteConfig[] = [
  {
    path: '/', 
    component: () => import('pages/Index.vue'), 
    children: [
      { path: '/',  component: () => import('pages/showcase.vue') }, 
      { path: '/showcase',  component: () => import('pages/showcase.vue') }, 
      { path: '/shadercreator',  component: () => import('pages/shadercreator.vue') },
      { path: '/sandbox',  component: () => import('pages/sandbox.vue') },
      { path: '/aboutAuthor',  component: () => import('pages/aboutAuthor.vue') }
    ]
  },
  {
    path: '/sandbox', 
    component: () => import('pages/sandbox.vue')
  },
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*', 
    component: () => import('pages/Error404.vue')
  })
}

export default routes
