/* eslint-disable camelcase */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-shadow */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Field,
  reduxForm,
  getFormMeta,
  getFormValues,
  change,
  submit,
  SubmissionError,
  formValueSelector,
} from 'redux-form';
import PopupTemplate from 'components/PopupTemplate';
import { togglePopup } from 'modules/popup';
import { getPlanList, getPlanPrice } from 'modules/plan';
import { orderVoucher } from 'modules/order';
import PageTemplate from 'containers/PageTemplate';
import PayAccountInfo from 'components/PayAccountInfo';
import FormInput from 'components/FormInput';
import Checkbox from 'components/Checkbox';
import './NewPlanForm.scss';

const companyNameRequried = value => (value ? undefined : '기업명을 입력해주세요');
const applicantNameRequired = value => (value ? undefined : '이름을 입력해주세요');
const depositorNameRequired = value => (value ? undefined : '입금자명을 입력해주세요');
const emailRequired = value => (value ? undefined : '이메일을 입력해주세요');
const emailRegexp = value => (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
  ? '이메일 형식을 다시 확인해주세요' : undefined);
const phoneRequired = value => (value ? undefined : '연락처를 입력해주세요');
const asyncValidate = async (values) => {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  return sleep(100).then(() => {
    if (values.plan === 'PLAN 01') {
      if (values.plan01Amount < 1 || values.plan01Amount === undefined) {
        const error = { plan01Amount: '1개 이상 입력하셔야 합니다' };
        throw error;
      } else if (values.plan01Amount > 99) {
        const error = { plan01Amount: '그렇게나 많이...?(왈칵)' };
        throw error;
      }
    } else if (values.plan === 'PLAN 02') {
      if (values.plan02Amount < 1 || values.plan02Amount === undefined) {
        const error = { plan02Amount: '1개 이상 입력하셔야 합니다' };
        throw error;
      } else if (values.plan02Amount > 99) {
        const error = { plan02Amount: '그렇게나 많이...?(왈칵)' };
        throw error;
      }
    }
  });
};
const onSubmit = (values, dispatch, props) => {
  const { plans, togglePopup } = props;

  if (values.plan === undefined) {
    throw new SubmissionError({
      plan: '플랜을 선택하셔야 합니다',
      _error: 'must',
    });
  } else if (values.plan === 'PLAN 01') {
    if (values.plan01Amount < 1 || values.plan01Amount === undefined) {
      throw new SubmissionError({
        plan01Amount: '1개 이상 입력하셔야 합니다',
        _error: 'too short',
      });
    } else if (values.plan01Amount > 99) {
      throw new SubmissionError({
        plan01Amount: '그렇게나 많이...?(왈칵)',
        _error: 'too long',
      });
    } else {
      const {
        companyName,
        applicantName,
        depositorName,
        phone,
        email,
      } = values;
      const amount = values.plan01Amount || values.plan02Amount;
      const plId = plans.find(p => p.name === values.plan).id;

      props.orderVoucher(
        companyName,
        applicantName,
        depositorName,
        phone,
        email,
        plId,
        amount,
      ).then(() => {
        console.log('Plan1 ordered successfully');
        togglePopup(false);
      }).catch((err) => {
        console.log(err);
        console.log(err.response);
        console.log(err.message);
        togglePopup(false);
      });
    }
  } else if (values.plan === 'PLAN 02') {
    if (values.plan02Amount < 1 || values.plan02Amount === undefined) {
      throw new SubmissionError({
        plan02Amount: '1개 이상 입력하셔야 합니다',
        _error: 'too short',
      });
    } else if (values.plan02Amount > 99) {
      throw new SubmissionError({
        plan02Amount: '그렇게나 많이...?(왈칵)',
        _error: 'too long',
      });
    } else {
      const {
        companyName,
        applicantName,
        depositorName,
        phone,
        email,
      } = values;
      const amount = values.plan01Amount || values.plan02Amount;
      const plId = plans.find(p => p.name === values.plan).id;

      props.orderVoucher(
        companyName,
        applicantName,
        depositorName,
        phone,
        email,
        plId,
        amount,
      ).then(() => {
        console.log('Plan2 ordered successfully');
        togglePopup(false);
      })
        .catch((err) => {
          console.log(err);
          console.log(err.response);
          console.log(err.message);
          togglePopup(false);
        });
    }
  }
};

class NewPlanForm extends Component {
  state={
    isPlan: null,
    totalPrice: 0,
    isConfirmPopup: false,
  }

  componentDidMount() {
    const { props } = this;
    const { change, sameName, applicantName } = props;
    props.getPlanList();
    if (sameName) change('depositorName', applicantName);
  }

  componentDidUpdate() {
    const { change, sameName, applicantName } = this.props;
    if (sameName) change('depositorName', applicantName);
  }

  getExpiredDate = (days) => {
    const today = new Date();
    today.setDate(today.getDate() + days);

    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const expired = `${String(year).substring(2, 5)}.${`0${month}`.slice(-2)}.${`0${day}`.slice(-2)}`;

    return expired;
  };

  getRadioValue = (e, idx) => {
    const planName = e.target.value;
    const inputElem = idx === 0 ? this.inputEl01 : this.inputEl02;
    const handleInputFocus = () => { if (planName.includes('PLAN')) inputElem.focus(); };

    handleInputFocus();
  };

  handleRadioValue = (e, idx) => {
    const { change } = this.props;
    const initValue = '';

    if (e.type === 'focus') {
      console.log('Focus!');
      change('plan', `PLAN 0${idx + 1}`);
      change(`plan0${!idx + 1}Amount`, initValue);
    }
  };

  handleInputChange = (e, idx) => {
    const { value, name } = e.target;
    const { getPlanPrice } = this.props;
    const amount = value === undefined ? 0 : parseInt(value, 10);
    const hasAmount = isNaN(amount) || parseInt(value, 10) === 0;
    const planName = `PLAN ${name.substring(4, 6)}`;

    if (value === undefined || hasAmount) {
      this.setState({
        isPlan: null,
      });
    } else {
      this.setState({ isPlan: idx });

      if (parseInt(value, 10) !== 0 && parseInt(value, 10) < 100 && value !== '') {
        getPlanPrice(planName, value).then((res) => {
          const { calculated_price_total } = res.data;
          this.setState({
            totalPrice: calculated_price_total,
          });
        }).catch((err) => {
          console.log(err);
          console.log(err.response);
          this.setState({
            totalPrice: 0,
          });
        });
      }
    }
  };

  handleNameValue = () => {
    const { change, sameName, applicantName } = this.props;
    if (sameName) change('depositorName', applicantName);
  };

  handleCheckboxValue = () => {
    const { change } = this.props;
    change('sameName', false);
  }

  handlePrice = (e) => {
    const { value, name } = e.target;
    const { getPlanPrice } = this.props;
    const planName = `PLAN ${name.substring(4, 6)}`;

    if (parseInt(value, 10) !== 0 && parseInt(value, 10) < 100 && value !== '') {
      getPlanPrice(planName, value).then((res) => {
        const { calculated_price_total } = res.data;
        this.setState({
          totalPrice: calculated_price_total,
        });
      }).catch((err) => {
        console.log(err);
        console.log(err.response);
        this.setState({
          totalPrice: 0,
        });
      });
    }
  };

  handleCancleBtn = (e) => {
    e.preventDefault();
    const { togglePopup } = this.props;

    togglePopup(false);
    this.setState({
      isConfirmPopup: false,
    });
  }

  handleConfirmPopup = (e) => {
    e.preventDefault();
    const { togglePopup } = this.props;

    togglePopup(true);
    this.setState({
      isConfirmPopup: true,
    });
  }

  render() {
    const {
      plans,
      dispatch,
      postVoucherSuccess,
      companyName,
      applicantName,
      sameName,
      depositorName,
      email,
      phone,
      plan,
      plan01Amount,
      plan02Amount,
      voucherId,
      voucherAmount,
    } = this.props;
    const hasValues = !!companyName
      && !!applicantName && !!depositorName && !!email && !!phone
      && !!plan && (!!plan01Amount || !!plan02Amount);
    const {
      isPlan,
      totalPrice,
      isConfirmPopup,
    } = this.state;
    const {
      getRadioValue,
      handleRadioValue,
      handleNameValue,
      handleInputChange,
      handleCheckboxValue,
      handlePrice,
      handleCancleBtn,
      handleConfirmPopup,
      getExpiredDate,
    } = this;
    const sameNameValue = sameName !== undefined ? sameName : false;

    return (
      <PageTemplate>
        <div className="contents__plan">
          <div className="contents-inner">
            <>
              <form className="form">
                <section className="field__section">
                  <div className="field">
                    <span className="field__title">
                      <strong className="title">기업명*</strong>
                    </span>
                    <Field
                      name="companyName"
                      type="text"
                      label="companyName"
                      placeholder="텍스트 입력"
                      component={FormInput}
                      validate={companyNameRequried}
                      disabled={postVoucherSuccess}
                    />
                  </div>
                  <div className="field">
                    <span className="field__title">
                      <strong className="title">이름*</strong>
                    </span>
                    <Field
                      name="applicantName"
                      type="text"
                      label="applicantName"
                      placeholder="텍스트 입력"
                      component={FormInput}
                      validate={applicantNameRequired}
                      disabled={postVoucherSuccess}
                    />
                  </div>
                  <div className="field">
                    <span className="field__title">
                      <strong className="title">입금자명*</strong>
                      <Field
                        name="sameName"
                        label="동일합니다"
                        isChecked={sameNameValue}
                        component={Checkbox}
                        onChange={() => handleNameValue()}
                        disabled={postVoucherSuccess}
                      />
                    </span>
                    <Field
                      name="depositorName"
                      type="text"
                      label="depositorName"
                      placeholder="텍스트 입력"
                      component={FormInput}
                      onChange={() => handleCheckboxValue()}
                      validate={depositorNameRequired}
                      value={sameName ? applicantName : undefined}
                      disabled={postVoucherSuccess}
                    />
                  </div>
                  <div className="field">
                    <span className="field__title">
                      <strong className="title">연락처*</strong>
                    </span>
                    <Field
                      name="phone"
                      type="tel"
                      label="phone"
                      placeholder="‘-’ 제외하고 입력"
                      component={FormInput}
                      validate={phoneRequired}
                      disabled={postVoucherSuccess}
                    />
                  </div>
                  <div className="field">
                    <span className="field__title">
                      <strong className="title">시리얼 넘버 받을 이메일*</strong>
                    </span>
                    <Field
                      name="email"
                      type="email"
                      label="email"
                      placeholder="텍스트 입력"
                      component={FormInput}
                      validate={[emailRequired, emailRegexp]}
                      disabled={postVoucherSuccess}
                    />
                  </div>
                  <span className="field__info">
                          ※ 이메일로 시리얼 넘버를 전송해드리기 때문에
                    <br />
                          반드시 정확한 이메일 주소를 입력해주세요!
                  </span>
                </section>
                <section className="field__section">
                  <div className="field">
                    <span className="field__title">
                      <strong className="title">어떤 플랜을 구매하실 건가요?</strong>
                    </span>
                    {/* eslint-disable-next-line jsx-a11y/label-has-for */}
                    <label htmlFor="plan">
                      {plans.map((p, idx) => (
                        <span className="box-input__radio" key={p.name}>
                          <Field
                            name="plan"
                            component="input"
                            type="radio"
                            value={p.name}
                            onChange={e => getRadioValue(e, idx)}
                            disabled={postVoucherSuccess}
                          />
                          <button
                            type="button"
                            name="plan"
                            className="btn__radio"
                            onClick={e => getRadioValue(e, idx)}
                            disabled={postVoucherSuccess}
                            value={p.name}
                          />
                          <strong className="plan__name">{p.name}</strong>
                          <span className="plan__desc">{p.description}</span>
                          <Field
                            name={`plan0${idx + 1}Amount`}
                            type="number"
                            component={FormInput}
                            label={`plan0${idx + 1}Amount`}
                            placeholder=""
                            onFocus={e => handleRadioValue(e, idx)}
                            onChange={e => handleInputChange(e, idx)}
                            onBlur={e => handlePrice(e)}
                            setRef={idx === 0
                              ? (input) => { this.inputEl01 = input; }
                              : (input) => { this.inputEl02 = input; }
                                  }
                            disabled={postVoucherSuccess}
                          />
                          <span className="input__placeholder">개</span>
                          <span className="plan__date">
                                  유효기간 :
                            {isPlan === idx
                              ? <strong>{getExpiredDate(90)}</strong>
                              : <strong>{getExpiredDate(30)}</strong>
                                  }
                          </span>
                        </span>
                      ))}
                    </label>
                  </div>
                  <p className="receipt__total">
                    <strong className="total__price">
                      <span>Total</span>
                      <strong>
                        {totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        <i>원</i>
                        <span className="price__desc-text">VAT 포함</span>
                      </strong>
                    </strong>
                  </p>
                  <div className="box-btn">
                    <button type="button" className={`btn-purchase${hasValues ? '--active' : ''}`} disabled={postVoucherSuccess} onClick={e => handleConfirmPopup(e)}>구매하기</button>
                  </div>
                </section>
              </form>
              {isConfirmPopup && !postVoucherSuccess && (
              <PopupTemplate isShow={isConfirmPopup} title="PLAN을 구매하시겠어요?">
                <p className="contents__confirm">
                            등록 후엔 수정이 되지 않으니, 꼼꼼히 확인해 주세요.
                </p>
                <div className="box-btn">
                  <button type="button" className="btn-cancle" onClick={e => handleCancleBtn(e)}>취소</button>
                  <button
                    type="submit"
                    className="btn-confirm"
                    onClick={() => dispatch(submit('planForm'))}
                  >
                              확인
                  </button>
                </div>
              </PopupTemplate>
              )}
              {postVoucherSuccess && (
              <PopupTemplate isShow={postVoucherSuccess}>
                <PayAccountInfo
                  voucherOrder={{
                    voucherId,
                    plans,
                    voucherAmount,
                    totalPrice,
                  }}
                />
              </PopupTemplate>
              )}
            </>
          </div>
        </div>
      </PageTemplate>
    );
  }
}

const selector = formValueSelector('planForm');

const getPlanValues = state => ({
  fieldMeta: getFormMeta('planForm')(state),
  fieldValue: getFormValues('planForm')(state),
  companyName: selector(state, 'companyName'),
  applicantName: selector(state, 'applicantName'),
  sameName: selector(state, 'sameName'),
  depositorName: selector(state, 'depositorName'),
  email: selector(state, 'email'),
  phone: selector(state, 'phone'),
  plan: selector(state, 'plan'),
  plan01Amount: selector(state, 'plan01Amount'),
  plan02Amount: selector(state, 'plan02Amount'),
  plans: state.plan.planList,
  planPrice: state.plan.planPrice,
  voucherId: state.order.voucher.id,
  voucherAmount: state.order.voucher.amount,
  postVoucherSuccess: state.order.postVoucherSuccess,
  postVoucherFailure: state.order.postVoucherFailure,
});

const mapDispatchToProps = dispatch => ({
  change: () => dispatch(change()),
  togglePopup: isOpen => dispatch(togglePopup(isOpen)),
  getPlanList: () => dispatch(getPlanList()),
  getPlanPrice: (pName, cNum) => dispatch(getPlanPrice(pName, cNum)),
  orderVoucher: (
    companyName,
    applicantName,
    depositorName,
    phone,
    email,
    plId,
    amount,
  ) => dispatch(orderVoucher(
    companyName,
    applicantName,
    depositorName,
    phone,
    email,
    plId,
    amount,
  )),
});

export default connect(
  getPlanValues,
  mapDispatchToProps,
)(reduxForm({
  form: 'planForm',
  asyncValidate,
  asyncChangeFields: ['plan01Amount', 'plan02Amount'],
  onSubmit: (values, dispatch, props) => onSubmit(values, dispatch, props),
  onSubmitFail: (errors, dispatch, submitError, props) => {
    console.log(errors, dispatch, submitError, props);
  },
  onSubmitSuccess: () => {
    console.log('success');
  },
})(NewPlanForm));
