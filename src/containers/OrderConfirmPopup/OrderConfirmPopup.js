/* eslint-disable no-shadow */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, getFormValues } from 'redux-form';
import PopupTemplate from 'components/PopupTemplate';
import ToastAlert from 'components/ToastAlert';
import { togglePopup } from 'modules/popup';
import {
  getTestOrder,
  getVoucherOrder,
  patchTestTaxBill,
  patchVoucherTaxBill,
} from 'modules/order';
import TaxBillForm from './TaxBillForm';
import './OrderConfirmPopup.scss';

class OrderConfirmPopup extends Component {
  state = {
    isLoading: false,
    taxOpen: false,
    hasComplete: false,
  }

  componentDidMount() {
    const { getVoucherOrder, getTestOrder, voucherId } = this.props;
    getVoucherOrder(voucherId);
    getTestOrder(voucherId);
  }

  handleStep = (step) => {
    let stepTxt;
    switch (step) {
      case true:
        stepTxt = '입금 완료';
        break;
      case false:
        stepTxt = '입금 대기 중';
        break;
      case 'APPLY':
        stepTxt = '테스트 작성중';
        break;
      case 'REGISTER':
        stepTxt = '신청 대기중';
        break;
      case 'PAYMENT':
        stepTxt = '입금 대기중';
        break;
      case 'TESTING':
        stepTxt = '테스트 진행중';
        break;
      case 'COMPLETED':
        stepTxt = '테스트 완료';
        break;
      default:
        stepTxt = '입금 완료';
        break;
    }

    return stepTxt;
  }

  onReset = (e) => {
    e.preventDefault();
    const { reset, togglePopup } = this.props;

    reset();
    togglePopup(false);
  }


  onToggleTax =() => {
    this.setState(prevState => ({
      taxOpen: !prevState.taxOpen,
    }));
  }

  onSubmit = (values) => {
    const {
      isVoucher,
      voucherId,
      patchVoucherTaxBill,
      patchTestTaxBill,
      togglePopup,
      reset,
      onSubmit,
    } = this.props;
    const { company, companyRegistNum, email } = values.order;
    const hasAllValues = !!company && !!companyRegistNum && !!email;

    if (hasAllValues) {
      this.setState({ isLoading: true });
      if (isVoucher) {
        patchVoucherTaxBill(
          voucherId,
          true,
          email,
          company,
          companyRegistNum,
        )
          .then(() => {
            getVoucherOrder(voucherId);
            this.setState({
              hasComplete: true,
            }, () => {
              setTimeout(() => {
                this.setState({ hasComplete: false });
                onSubmit(email, company, companyRegistNum);
                reset();
                togglePopup(false);
              }, 2000);
            });
            this.setState({ isLoading: false });
          })
          .catch((err) => {
            console.log(err);
            console.log(err.response);
            console.log(err.message);
            this.setState({ isLoading: false });
          });
      } else {
        patchTestTaxBill(
          voucherId,
          true,
          email,
          company,
          companyRegistNum,
        )
          .then(() => {
            getTestOrder(voucherId);
            this.setState({
              hasComplete: true,
            }, () => {
              setTimeout(() => {
                this.setState({ hasComplete: false });
                onSubmit(email, company, companyRegistNum);
                reset();
                togglePopup(false);
              }, 2000);
            });
          });
      }
    }
  }

  render() {
    const { handleStep, onReset, isLoading } = this;
    const {
      isOpen,
      isTaxBillReq,
      testName,
      planName,
      planAmount,
      paidDate,
      step,
      price,
      isVoucher,
      fieldValue,
      handleSubmit,
      initVoucherData,
      initTestData,
      isVoucherTaxReq,
      isTestTaxReq,
    } = this.props;
    const { taxOpen, hasComplete } = this.state;
    const amount = planAmount === undefined ? '1개' : `${planAmount}개`;
    const hasFieldValue = fieldValue !== undefined
      ? Object.keys(fieldValue.order).length : undefined;

    return (
      <PopupTemplate isShow={isOpen}>
        <div className="popup__contents--confirm">
          <h2 className="popup__subtitle">이용해주셔서 감사합니다</h2>
          <section className="contents__section">
            <article className="section__info">
              {isVoucher
                ? (
                  <>
                    <strong className="info__title">구매목록</strong>
                    <span className="info__desc">{planName}</span>
                  </>
                )
                : (
                  <>
                    <strong className="info__title">테스트명</strong>
                    <span className="info__desc">{testName}</span>
                  </>
                )
              }
              <strong className="info__title">구매개수</strong>
              <span className="info__desc">{amount}</span>
              <strong className="info__title">구매일자</strong>
              <span className="info__desc">{paidDate}</span>
            </article>
            <article className="section__info">
              <strong className="info__title">입금정보</strong>
              <span className="info__desc">
                디비디랩주식회사
                <br />
                국민은행 098901-04-101303
              </span>
              <strong className="info__title">입금액</strong>
              <span className="info__desc--price">
                {price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                <i>원</i>
                <span className="info__desc-text">VAT 포함</span>
              </span>
            </article>
            <article className="section__info">
              <strong className="info__title">상태</strong>
              <span className="info__desc--step">{handleStep(step)}</span>
            </article>
            <article className={`section__info${taxOpen ? ' no-border' : ''}`}>
              <strong className="info__title">세금계산서</strong>
              <button
                className={`info__button info__desc${isTaxBillReq ? '--bill' : ''}`}
                type="button"
                onClick={this.onToggleTax}
              >
                {isTaxBillReq ? '신청완료' : '신청하기'}
              </button>
            </article>
            {taxOpen && (isVoucher
              ? (
                <TaxBillForm
                  initialValues={initVoucherData}
                  isTaxBillReq={isTaxBillReq}
                  isLoading={isLoading}
                  onSubmit={handleSubmit(values => this.onSubmit(values))}
                />
              )
              : (
                <TaxBillForm
                  initialValues={initTestData}
                  isTaxBillReq={isTaxBillReq}
                  isLoading={isLoading}
                  onSubmit={handleSubmit(values => this.onSubmit(values))}
                />
              ))
            }
          </section>
        </div>
        <div className="box-btn-order">
          <button type="button" className="btn-cancel" onClick={e => onReset(e)}>닫기</button>

        </div>
        {hasComplete
          ? (
            <ToastAlert
              title="신청이 완료되었어요 :)"
              subtitle="빠른 안내 드리도록 하겠습니다"
              isShow={hasComplete}
            />
          )
          : null}
      </PopupTemplate>
    );
  }
}

const getFormData = (state) => {
  const fieldValue = getFormValues('orderConfirmForm')(state);
  const { voucher } = state.order;
  const { test } = state.order;
  const voucherTaxBillCompany = voucher.tax_bill_company_name !== undefined
    ? voucher.tax_bill_company_name : undefined;
  const voucherTaxBillCompanyNum = voucher.company_registration_number !== undefined
    ? voucher.company_registration_number : undefined;
  const voucherTaxBillEmail = voucher.tax_bill_receive_email !== undefined
    ? voucher.tax_bill_receive_email : undefined;
  const testTaxBillCompany = test.tax_bill_company_name !== undefined
    ? test.tax_bill_company_name : undefined;
  const testTaxBillCompanyNum = test.company_registration_number !== undefined
    ? test.company_registration_number : undefined;
  const testTaxBillEmail = test.tax_bill_receive_email !== undefined
    ? test.tax_bill_receive_email : undefined;
  const isVoucherTaxReq = voucher !== undefined ? voucher.is_tax_bill_requested : false;
  const isTestTaxReq = test !== undefined ? test.is_tax_bill_requested : false;
  const initVoucherData = {
    order: {
      company: voucherTaxBillCompany,
      companyRegistNum: voucherTaxBillCompanyNum,
      email: voucherTaxBillEmail,
    },
  };

  const initTestData = {
    order: {
      company: testTaxBillCompany,
      companyRegistNum: testTaxBillCompanyNum,
      email: testTaxBillEmail,
    },
  };

  return {
    fieldValue,
    voucher,
    test,
    initVoucherData,
    initTestData,
    isVoucherTaxReq,
    isTestTaxReq,
  };
};

const mapDispatchToProps = dispatch => ({
  togglePopup: isOpen => dispatch(togglePopup(isOpen)),
  getTestOrder: oId => dispatch(getTestOrder(oId)),
  getVoucherOrder: oId => dispatch(getVoucherOrder(oId)),
  patchVoucherTaxBill: (
    oId,
    hasTaxBillReq,
    taxEmail,
    taxCompany,
    taxCompanyRegistNum,
  ) => dispatch(patchVoucherTaxBill(
    oId,
    hasTaxBillReq,
    taxEmail,
    taxCompany,
    taxCompanyRegistNum,
  )),
  patchTestTaxBill: (
    oId,
    hasTaxBillReq,
    taxEmail,
    taxCompany,
    taxCompanyRegistNum,
  ) => dispatch(patchTestTaxBill(
    oId,
    hasTaxBillReq,
    taxEmail,
    taxCompany,
    taxCompanyRegistNum,
  )),
});

export default connect(
  getFormData,
  mapDispatchToProps,
)(reduxForm({
  form: 'orderConfirmForm',
})(OrderConfirmPopup));
