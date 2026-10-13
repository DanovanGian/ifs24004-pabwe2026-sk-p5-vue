import { createRouter, createWebHistory } from "vue-router";
import { getAccessToken } from "./helpers/apiHelper";

const routes = [
  {
    path: "/auth",
    component: () => import("./features/auth/layouts/AuthLayout.vue"),
    meta: { guestOnly: true },
    children: [
      { path: "login", component: () => import("./features/auth/pages/LoginPage.vue") },
      { path: "register", component: () => import("./features/auth/pages/RegisterPage.vue") },
    ],
  },
  {
    path: "/",
    component: () => import("./features/aucations/layouts/AucationLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      { path: "", component: () => import("./features/aucations/pages/HomePage.vue") },
      {
        path: "aucations/:aucationId",
        component: () => import("./features/aucations/pages/DetailPage.vue"),
      },
      { path: "users", component: () => import("./features/users/pages/UsersPage.vue") },
      { path: "profile", component: () => import("./features/users/pages/ProfilePage.vue") },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("./features/common/pages/NotFoundPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const isLoggedIn = Boolean(getAccessToken());

  if (to.meta.requiresAuth && !isLoggedIn) return "/auth/login";
  if (to.meta.guestOnly && isLoggedIn) return "/";
});

export default router;