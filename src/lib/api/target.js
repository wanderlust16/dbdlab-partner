import axios from 'axios';

const hasTokenCookie = document.cookie.split(';').map(c => c).find(x => x.indexOf('token=') > 0);
const AUTH_TOKEN = hasTokenCookie !== undefined ? hasTokenCookie.replace(/\s/gi, '').substring(6) : null;
const baseURL = 'https://qa-server.realdopt.com/api';
// const baseURL = '';
const headers = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `token ${AUTH_TOKEN}`,
  },
};

export const getTargetList = tId => axios.get(`${baseURL}/targets/?test__id=${tId}/`, headers);
export const getTarget = tgId => axios.get(`${baseURL}/targets/${tgId}/`, headers);
export const postTarget = (tId, genderValue, minAge, maxAge) => axios.post(`${baseURL}/targets/`, {
  test_id: tId,
  age_minimum: minAge,
  age_maximum: maxAge,
  gender: genderValue,
}, headers);
export const patchTarget = (tgId, tId, gender, minAge, maxAge) => axios.patch(`${baseURL}/targets/${tgId}/`, {
  id: tgId,
  test_id: tId,
  age_minimum: minAge,
  age_maximum: maxAge,
  gender,
}, headers);
export const postTargetExtra = (tgId, cId, cValue) => axios.post(`${baseURL}/targets/${tgId}/extras/`, {
  target_id: tgId,
  category_item_id: cId,
  value: cValue,
}, headers);
export const patchTargetExtra = (tgEx1Id, tgId, exCate1Id, extraInfoDesc1) => axios.patch(`${baseURL}/targets/${tgId}/extras/${tgEx1Id}/`, {
  target_id: tgId,
  category_item_id: exCate1Id,
  value: extraInfoDesc1,
}, headers);
