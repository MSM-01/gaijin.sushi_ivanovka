/** Плавная прокрутка к элементу с учётом липких шапки и вкладок. */
export function scrollToId(id: string, offset = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}
