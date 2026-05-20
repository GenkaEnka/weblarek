/* Base URL for all API and CDN requests */
export const BASE_URL = import.meta.env.VITE_API_ORIGIN;

/* Full path to API server. Add only endpoint to this URL */
export const API_URL = `${BASE_URL}/api/weblarek`; 

/* Full path to CDN for card images. Add only image filename to this URL */
export const CDN_URL = `${BASE_URL}/content/weblarek`;

/* Константа соответствий категорий товара модификаторам, используемым для отображения фона категории. */
export const categoryMap = {
  'софт-скил': 'soft',
  'хард-скил': 'hard',
  'кнопка': 'button',
  'дополнительное': 'additional',
  'другое': 'other',
};

export const settings = {

};

