export const mockLogin = async (page) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('username', 'admin');
    window.localStorage.removeItem('ra.list.tasks');
    window.localStorage.removeItem('ra.list.task_statuses');
    window.localStorage.removeItem('ra.list.labels');
    window.localStorage.removeItem('ra.filter.tasks');
  });
};

export const resetNavigationCaches = async (page) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem('ra.list.tasks');
    window.localStorage.removeItem('ra.list.task_statuses');
    window.localStorage.removeItem('ra.list.labels');
    window.localStorage.removeItem('ra.filter.tasks');
  });
};
