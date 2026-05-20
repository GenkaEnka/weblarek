import { CategoryMapping } from '../types';

export const API_URL = `/api/weblarek`;
export const CDN_URL = `/content/weblarek`;

export const settings = {};

export const categoryMapping: CategoryMapping = {
  другое: 'card__category_other',
  'софт-скил': 'card__category_soft',
  дополнительное: 'card__category_additional',
  кнопка: 'card__category_button',
  'хард-скил': 'card__category_hard',
};
