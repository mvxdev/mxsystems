// Переключатели страницы сравнения: подставляют нужные скриншоты из old/ и new/
const state = { lang: 'ru', dev: 'desktop', mode: '' };
const show = () => {
  const name = `${state.lang}-${state.dev}${state.mode}.jpg`;
  document.getElementById('old').src = `old/${name}`;
  document.getElementById('new').src = `new/${name}`;
  document.body.classList.toggle('mobile', state.dev === 'mobile');
};
document.querySelectorAll('.group').forEach((g) => g.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  g.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
  state[g.dataset.k] = b.dataset.v;
  show();
}));
show();
