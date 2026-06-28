// Labels + ordering for the generic content editor. The editor renders the whole
// content doc tree, so anything not listed still shows up (using its raw key as label).

// Section order (mirrors the landing) + human titles for the editor cards.
export const SECTIONS = [
  ['hero', 'Hero — шапка'],
  ['value', 'Ценность керамики'],
  ['master', 'Мастер'],
  ['clay', 'Гончарный круг (интерактив)'],
  ['process', 'Процесс'],
  ['shrink', 'Усадка'],
  ['kiln', 'Печь'],
  ['glaze', 'Глазуровка'],
  ['invite', 'Приглашение + адрес'],
  ['types', 'Виды глины'],
  ['pricing', 'Цены'],
  ['booking', 'Запись'],
  ['footer', 'Подвал'],
  ['nav', 'Кнопки / меню'],
  ['mascot', 'Маскот-козочка'],
  ['gallery', 'Витрина (3D, тех. тексты)'],
]

// Friendly labels for common field keys (fallback = the key itself).
export const FIELD_LABELS = {
  kicker: 'Кикер (надзаголовок)',
  title: 'Заголовок',
  body: 'Текст',
  sub: 'Подзаголовок',
  note: 'Примечание',
  hint: 'Подсказка',
  tagline: 'Слоган',
  place: 'Надпись над логотипом',
  scroll: 'Подпись «листай»',
  name: 'Имя',
  intro: 'Вступление',
  close: 'Кнопка «закрыть»',
  reset: 'Кнопка «сброс»',
  glaze: 'Подпись «глазурь»',
  raw: 'Подпись «сырое»',
  fired: 'Подпись «после обжига»',
  hold: 'Подпись кнопки печи',
  brush: 'Кисть',
  hand: 'Рука',
  handHint: 'Подсказка «рука»',
  kurs: 'Кнопка «мастер-класс»',
  cowork: 'Кнопка «коворкинг»',
  book: 'Кнопка «записаться»',
  kursTitle: 'Заголовок «мастер-классы»',
  kursBody: 'Текст «мастер-классы»',
  coworkTitle: 'Заголовок «коворкинг»',
  coworkBody: 'Текст «коворкинг»',
  featured: 'Метка «популярное»',
  kursLead: 'Надзаголовок «формат»',
  addressLabel: 'Подпись «адрес»',
  address: 'Адрес',
  studio: 'Студия',
  city: 'Город',
  directions: 'Кнопка карты',
  mapHint: 'Подпись под картой',
  soon: 'Подпись «скоро»',
  kursBtn: 'Кнопка «мастер-класс»',
  coworkBtn: 'Кнопка «коворкинг»',
  rights: 'Права',
  made: 'Подпись «сделано»',
  l: 'Название',
  r: 'Цена',
  t: 'Заголовок',
  d: 'Описание',
  vase: 'Ваза',
  mug: 'Кружка',
  bowl: 'Миска',
  stages: 'Стадии',
  facts: 'Факты',
  points: 'Карточки',
  steps: 'Этапы',
  items: 'Карточки',
  rows: 'Строки',
  groups: 'Группы цен',
  shapes: 'Названия форм',
}

// Keys that should render as a multi-line textarea.
export const TEXTAREA_KEYS = new Set(['body', 'sub', 'note', 'kursBody', 'coworkBody', 'intro', 'd'])

// Templates for "add item" when an array is empty (otherwise we clone the existing shape).
export const ITEM_TEMPLATES = {
  points: { t: '', d: '' },
  items: { t: '', d: '' },
  steps: { t: '', d: '' },
  facts: '',
  stages: '',
  rows: { l: '', r: '' },
  groups: { title: '', rows: [{ l: '', r: '' }], note: '' },
}

export function labelFor(key) {
  return FIELD_LABELS[key] || key
}
