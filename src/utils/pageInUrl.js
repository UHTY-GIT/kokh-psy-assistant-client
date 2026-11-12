// utils/pageInUrl.js
// Номер сторінки списку живе в адресі (?page=3): після перезавантаження, «Назад» з картки
// чи повторного входу відкривається та сама сторінка списку, а не перша.
//   const { currentPage, changePage } = usePageInUrl(totalPages);

import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export function usePageInUrl(totalPages) {
  const route = useRoute();
  const router = useRouter();
  // сторінка, якій належить список: під час переходу на іншу адресу ?page зникає,
  // і список, що ще анімовано йде з екрана, не має перестрибнути на першу сторінку
  const ownRoute = route.name;

  const pageFromUrl = () => {
    const page = Number.parseInt(route.query.page, 10);
    return page > 1 ? page : 1;
  };

  const currentPage = ref(pageFromUrl());

  // «Назад» / «Вперед» у браузері змінюють адресу — показуємо відповідну сторінку
  watch(() => route.query.page, () => {
    if (route.name === ownRoute) currentPage.value = pageFromUrl();
  });

  const setPage = (page, replace = false) => {
    currentPage.value = page;
    const query = { ...route.query };
    if (page > 1) query.page = String(page);
    else delete query.page;
    router[replace ? 'replace' : 'push']({ query, hash: route.hash });
  };

  const changePage = (step) => {
    const next = currentPage.value + step;
    if (next >= 1 && next <= totalPages.value) setPage(next);
  };

  // такої сторінки вже немає (список став коротшим) — показуємо останню наявну
  watch(totalPages, (total) => {
    if (total >= 1 && currentPage.value > total) setPage(total, true);
  });

  return { currentPage, changePage };
}
