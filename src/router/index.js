import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/admin',
    component: () => import('@/views/Admin.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/user'
      },
      {
        path: 'user',
        name: 'UserManagement',
        component: () => import('@/views/admin/UserManagement.vue')
      },
      {
        path: 'question',
        name: 'QuestionManagement',
        component: () => import('@/views/admin/QuestionManagement.vue')
      },
      {
        path: 'template',
        name: 'ExamTemplateManagement',
        component: () => import('@/views/admin/ExamTemplateManagement.vue')
      },
      {
        path: 'exam',
        name: 'ExamManagement',
        component: () => import('@/views/admin/ExamManagement.vue')
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/admin/Statistics.vue')
      },
      {
        path: 'export',
        name: 'DataExport',
        component: () => import('@/views/admin/DataExport.vue')
      }
    ]
  },
  {
    path: '/employee',
    component: () => import('@/views/Employee.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/employee/exam-list'
      },
      {
        path: 'exam-list',
        name: 'ExamList',
        component: () => import('@/views/employee/ExamList.vue')
      },
      {
        path: 'exam/:id',
        name: 'OnlineExam',
        component: () => import('@/views/employee/OnlineExam.vue')
      },
      {
        path: 'result',
        name: 'ExamResult',
        component: () => import('@/views/employee/ExamResult.vue')
      },
      {
        path: 'history',
        name: 'HistoryRecord',
        component: () => import('@/views/employee/HistoryRecord.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.meta.requiresAdmin && userStore.loginType !== 'admin') {
    next('/login')
  } else if (to.path === '/login' && userStore.isLoggedIn) {
    if (userStore.loginType === 'admin') {
      next('/admin/user')
    } else {
      next('/employee/exam-list')
    }
  } else {
    next()
  }
})

export default router
