import * as VoucherAPI from 'lib/api/voucher';
import { handleActions } from 'redux-actions';

const POST_ORDER_VOUCHER_SUCCESS = 'voucher/POST_ORDER_VOUCHER_SUCCESS';
const POST_ORDER_VOUCHER_FAILURE = 'voucher/POST_ORDER_VOUCHER_FAILURE';
const PATCH_VOUCHER_SUCCESS = 'voucher/PATCH_VOUCHER_SUCCESS';
const PATCH_VOUCHER_FAILURE = 'voucher/PATCH_VOUCHER_FAILURE';

export const orderVoucher = (
  companyName,
  applicantName,
  depositorName,
  phone,
  email,
  plId,
  amount,
) => dispatch => VoucherAPI.orderVoucher(
  companyName,
  applicantName,
  depositorName,
  phone,
  email,
  plId,
  amount,
).then(
  (res) => {
    console.log(res);
    dispatch({
      type: POST_ORDER_VOUCHER_SUCCESS,
      payload: res,
    });
  },
).catch((err) => {
  dispatch({
    type: POST_ORDER_VOUCHER_FAILURE,
    payload: err,
  });
});

export const patchVoucher = (
  company,
  companyRegistNum,
  email,
  vId,
  amount,
) => dispatch => VoucherAPI.patchVoucher(
  company,
  companyRegistNum,
  email,
  vId,
  amount,
).then(
  (res) => {
    dispatch({
      type: PATCH_VOUCHER_SUCCESS,
      payload: res,
    });
  },
).catch(
  (err) => {
    dispatch({
      type: PATCH_VOUCHER_FAILURE,
      payload: err,
    });
  },
);

const initialState = {
  getVoucherListSuccess: false,
  getVoucherListFailure: false,
  getVoucherSuccess: false,
  getVoucherFailure: false,
  postVoucherSuccess: false,
  postVoucherFailure: false,
  voucher: {},
};

export default handleActions({
  [POST_ORDER_VOUCHER_SUCCESS]: (state, action) => ({
    ...state,
    postVoucherSuccess: true,
    voucher: action.payload.data,
  }),
  [POST_ORDER_VOUCHER_FAILURE]: state => ({
    ...state,
    postVoucherFailure: true,
  }),
  [PATCH_VOUCHER_SUCCESS]: (state, action) => ({
    ...state,
    postVoucherSuccess: true,
    voucher: action.payload.data,
  }),
  [PATCH_VOUCHER_FAILURE]: state => ({
    ...state,
    postVoucherFailure: true,
  }),
}, initialState);
