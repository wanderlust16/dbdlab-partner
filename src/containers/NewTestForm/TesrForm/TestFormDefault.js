/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { connect } from 'react-redux';
import FormInput from 'components/FormInput';
import FormSelect from 'components/FormSelect';
// import Checkbox from 'components/Checkbox';
import { Field, blur } from 'redux-form';

const mediaRequired = value => (value ? undefined : '카테고리를 선택해주세요');
const seriveInfoRequired = value => (value ? undefined : 'URL 또는 어플리케이션 명을 입력해주세요');
const serviceStatusRequired = value => (value ? undefined : '서비스 단계를 선택해주세요');
const clientNameRequired = value => (value ? undefined : '이름을 입력해주세요');
const clientNameRegexp = value => (value && /^[^a-zA-Zㄱ-힣]/.test(value) ? '이름을 명확하게 입력해주세요' : undefined);
const clientContactRequired = value => (value ? undefined : '연락처를 입력해주세요');
const clientContactRegexp = value => (value && !/^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?[0-9]{3,4}-?[0-9]{4}$/.test(value) ? '연락처 형식을 다시 확인해주세요' : undefined);
const emailRequired = value => (value ? undefined : '이메일을 입력해주세요');
const emailRegexp = value => (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
  ? '이메일 형식을 다시 확인해주세요' : undefined);
const valueRegExp = value => (value && value.replace(/(^\s*)|(\s*$)/g, '').length < 2 ? '형식에 맞게 입력해 주세요' : undefined);
const valueNumberRegExp = value => (value && value.replace(/^[0-9]/, '').length < 1 ? '정확하게 입력해주세요' : undefined);

const serviceStatus = [
  { value: 'PLANNING', text: '기획' },
  { value: 'DESIGN', text: '디자인' },
  { value: 'DEVELOPING', text: '개발 중' },
  { value: 'OPERATING', text: '운영 중' },
  { value: 'RENEWAL', text: '리뉴얼' },
];

const FormRadio = (valueProps) => {
  const {
    input,
    meta,
    steps,
    disabled,
    handleBlurSave,
  } = valueProps;
  const hasError = meta.touched && meta.error;

  return (
    <>
      {steps.map(step => (
        <span className={`box-input__radio${!disabled && hasError ? '--error' : ''}`} key={step.value}>
          <input
            type="radio"
            name={input.name}
            onFocus={(e) => { input.onFocus(e, input.onChange(step.value)); }}
            onChange={(e) => {
              input.onChange(e, step.value);
              handleBlurSave();
            }}
            onBlur={e => handleBlurSave()}
            value={step.value}
            checked={step.value === input.value}
            disabled={disabled}
          />
          <button
            type="button"
            className={`btn__radio${step.value === input.value ? '--checked' : ''}`}
            onFocus={(e) => { input.onFocus(e, input.onChange(step.value)); }}
            onChange={(e) => {
              input.onChange(e, step.value);
              handleBlurSave();
            }}
            onBlur={e => handleBlurSave()}
            disabled={disabled}
          />
          <span className="text">{step.text}</span>
        </span>
      ))}
      {!disabled && hasError && <span className="msg--error">{meta.error}</span>}
    </>
  );
};

const TestFormDefault = (props) => {
  const handleContactValue = (e, newValue, preValue, name) => {
    const { dispatch } = props;
    e.preventDefault();
    if (newValue && newValue.indexOf('-') > 0) {
      const replaceTxt = newValue.replace(/-/g, '');
      dispatch(blur('testForm', name, replaceTxt));
    }
  };

  const {
    isDisabled,
    media1Category,
    media2Category,
    service1Category,
    service2Category,
    funnelCategory,
    handleBlurSave,
  } = props;

  return (
    <div className="field-wrapper--default">
      <section className="field__section">
        <div className="field">
          <span className="field__title">
            <strong className="title">테스트 매체*</strong>
          </span>
          <Field
            name="media1"
            type="select"
            component={FormSelect}
            validate={mediaRequired}
            disabled={isDisabled}
            onBlur={handleBlurSave}
            defaultValue="카테고리 선택"
          >
            <option value="카테고리 선택" disabled>카테고리 선택</option>
            {media1Category.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Field>
          <Field
            name="media2"
            type="select"
            component={FormSelect}
            validate={mediaRequired}
            disabled={isDisabled}
            onBlur={handleBlurSave}
            defaultValue="카테고리 선택"
          >
            <option value="카테고리 선택" disabled>카테고리 선택</option>
            {media2Category.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Field>
        </div>
        <div className="field">
          <span className="field__title">
            <strong className="title">서비스 URL 또는 어플리케이션 명*</strong>
          </span>
          <Field
            name="serviceInfo"
            type="text"
            label="default.serviceInfo"
            placeholder="서비스 URL 또는 어플리케이션 명 입력"
            component={FormInput}
            onBlur={handleBlurSave}
            disabled={isDisabled}
            validate={[
              seriveInfoRequired,
              valueNumberRegExp,
            ]}
          />
        </div>
        <div className="field-column">
          <span className="field__title">
            <strong className="title">서비스 분야*</strong>
          </span>
          <Field
            name="serviceCategory"
            type="select"
            component={FormSelect}
            disabled={isDisabled}
            validate={mediaRequired}
            onBlur={handleBlurSave}
            defaultValue="카테고리 선택"
          >
            <option value="카테고리 선택" disabled>카테고리 선택</option>
            {service1Category.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Field>
        </div>
        <div className="field-column">
          <span className="field__title">
            <strong className="title">서비스 형태*</strong>
          </span>
          <Field
            name="serviceFormat"
            type="select"
            component={FormSelect}
            disabled={isDisabled}
            validate={mediaRequired}
            onBlur={handleBlurSave}
            defaultValue="카테고리 선택"
          >
            <option value="카테고리 선택" disabled>카테고리 선택</option>
            {service2Category.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Field>
        </div>
        <div className="field">
          <span className="field__title">
            <strong className="title">서비스 소개</strong>
          </span>
          <Field
            name="serviceDesc"
            type="text"
            label="default.serviceDesc"
            placeholder="100자 내외 텍스트 입력"
            component={FormInput}
            onBlur={handleBlurSave}
            disabled={isDisabled}
          />
        </div>
        <div className="field">
          <span className="field__title">
            <strong className="title">서비스 단계*</strong>
          </span>
          <label htmlFor="default.serviceStatus">
            <Field
              component={FormRadio}
              name="serviceStatus"
              steps={serviceStatus}
              handleBlurSave={handleBlurSave}
              disabled={isDisabled}
              validate={serviceStatusRequired}
            />
          </label>
        </div>
      </section>
      <section className="field__section">
        <div className="field-halfblock">
          <span className="field__title">
            <strong className="title">담당자 이름*</strong>
          </span>
          <Field
            name="clientName"
            type="text"
            label="default.clientName"
            placeholder="텍스트 입력"
            component={FormInput}
            onBlur={handleBlurSave}
            disabled={isDisabled}
            validate={[
              clientNameRequired,
              clientNameRegexp,
              valueRegExp,
              valueNumberRegExp,
            ]}
          />
        </div>
        <div className="field-halfblock">
          <span className="field__title">
            <strong className="title">담당자 연락처*</strong>
          </span>
          <Field
            name="clientContact"
            type="tel"
            label="default.clientContact"
            placeholder="‘-’ 제외하고 입력"
            component={FormInput}
            isContact
            disabled={isDisabled}
            onBlur={
              (e, newValue, preValue, name) => {
                handleContactValue(e, newValue, preValue, name);
                handleBlurSave(e);
              }
            }
            validate={[clientContactRequired, clientContactRegexp]}
          />
        </div>
        <div className="field">
          <span className="field__title">
            <strong className="title">담당자 이메일*</strong>
          </span>
          <Field
            name="email"
            type="email"
            label="default.email"
            placeholder="텍스트 입력"
            component={FormInput}
            onBlur={handleBlurSave}
            disabled={isDisabled}
            validate={[emailRequired, emailRegexp]}
          />
        </div>
        <div className="field">
          <span className="field__title">
            <strong className="title">리얼답을 어떻게 알게 되셨나요?</strong>
          </span>
          <Field
            name="funnel"
            type="select"
            defaultValue="경로 선택"
            component={FormSelect}
            onBlur={handleBlurSave}
            disabled={isDisabled}
          >
            <option value="경로 선택" disabled>경로 선택</option>
            {funnelCategory.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Field>
        </div>
        {/* <div className="field-filled">
          <Field
            name="save"
            label="다음에도 이 정보를 그대로 사용할게요"
            component={Checkbox}
            disabled={isDisabled}
            isChecked={false}
            onChange={() => alert('클릭해도 소용 없다구..후훟..')}
          />
        </div> */}
      </section>
    </div>
  );
};

export default connect()(TestFormDefault);
