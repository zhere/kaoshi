import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/admin-login'
  },
  {
    path: '/admin-login',
    name: 'AdminLogin',
    component: () => import('@/views/AdminLogin.vue')
  },
  {
    path: '/employee-login',
    name: 'EmployeeLogin',
    component: () => import('@/views/EmployeeLogin.vue')
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
        path: 'material',
        name: 'MaterialManagement',
        component: () => import('@/views/admin/MaterialManagement.vue')
      },
      {
        path: 'question',
        name: 'QuestionManagement',
        component: () => import('@/views/admin/QuestionManagement.vue')
      },
      {
        path: 'exam',
        name: 'ExamManagement',
        component: () => import('@/views/admin/ExamManagement.vue')
      },
      {
        path: 'points',
        name: 'PointsManagement',
        component: () => import('@/views/admin/PointsManagement.vue')
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/admin/Statistics.vue')
      },
      {
        path: 'profile',
        name: 'AdminProfile',
        component: () => import('@/views/admin/Profile.vue')
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
      },
      {
        path: 'material',
        name: 'MaterialList',
        component: () => import('@/views/employee/MaterialList.vue')
      },
      {
        path: 'points',
        name: 'MyPoints',
        component: () => import('@/views/employee/MyPoints.vue')
      },
      {
        path: 'profile',
        name: 'EmployeeProfile',
        component: () => import('@/views/employee/Profile.vue')
      }
    ]
  },
  {
    path: '/pc-exam/:id',
    name: 'PcExam',
    component: () => import('@/views/employee/PcExam.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    if (to.meta.requiresAdmin) {
      next('/admin-login')
    } else {
      next('/employee-login')
    }
  } else if (to.meta.requiresAdmin && userStore.loginType !== 'admin') {
    next('/admin-login')
  } else if ((to.path === '/admin-login' || to.path === '/employee-login') && userStore.isLoggedIn) {
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