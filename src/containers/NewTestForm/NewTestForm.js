/* eslint-disable no-shadow */
/* eslint-disable camelcase */
/* eslint-disable-next-line no-shadow */
import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import {
  Field,
  FormSection,
  reduxForm,
  getFormValues,
  getFormMeta,
  getFormSyncErrors,
} from 'redux-form';
import {
  Prompt,
} from 'react-router-dom';
import PopupTemplate from 'components/PopupTemplate';
import PayAccountInfo from 'components/PayAccountInfo';
import LoadingIndicator from 'components/LoadingIndicator';
import ToastAlert from 'components/ToastAlert';
import config from 'modules/config';
import { togglePopup } from 'modules/popup';
import { getAuthSelf } from 'modules/auth';
import { getProject } from 'modules/project';
import {
  setTestInit,
  getTest,
  postTest,
  patchTest,
} from 'modules/test';
import {
  getTarget,
  patchTarget,
  postTargetExtra,
  patchTargetExtra,
} from 'modules/target';
import { patchQuest } from 'modules/quest';
import { getCategories } from 'modules/category';
import { getPlanList } from 'modules/plan';
import { orderTest, getTestOrder } from 'modules/order';
import RightSidebar from './RightSidebar';
import validate from './validate';
import {
  TestFormDefault,
  TestFormTarget,
  TestFormQuest,
  TestFormPay,
  TestFormReport,
} from './TesrForm';
import './NewTestForm.scss';

const DisabledLayer = () => (
  <div className="layer--disabled">아직은 입력하실 수 없어요!</div>
);

class NewTestForm extends Component {
  state = {
    isLeader: false,
    isLoading: false,
    isPayLoading: false,
    isBackConfirmPopup: false,
    isRegisterInfoPopup: false,
    isPayInfoPopup: false,
    isDefaultRendered: true,
    isTargetRendered: false,
    isQuestRendered: false,
    isPayRendered: false,
    isAllRendered: false,
    isReportRendered: false,
    isDefaultPassed: false,
    isTargetPassed: false,
    isQuestPassed: false,
    isPayPassed: false,
    isAllPassed: false,
    isCompleteStep: false,
    isTestStep: false,
    isRegisterStep: false,
    isBlurSaved: false,
    hasDefaultError: false,
    hasTargetError: false,
    hasExTargetError: false,
    hasQuestError: false,
    justRegistered: false,
    test: {},
    asyncErrorMsg: '',
    shouldBlockNavigation: true,
    inSaving: false,
    inPostTest: false,
    lastSavedTime: new Date(),
  }

  componentDidMount() {
    const {
      route,
      getAuthSelf,
      getProject,
      getTest,
      getCategories,
      getPlanList,
      getTarget,
    } = this.props;
    const { match } = route;
    const { pId, tId } = match.params;

    this.setState({ isLoading: true });

    getAuthSelf()
      .then((res) => {
        const { id } = res.data;
        getProject(pId)
          .then((res) => {
            const isLeader = res.data.members.find(x => x.is_manager).id === id;

            this.setState({ isLeader });
          })
          .catch((err) => {
            console.log(err);
            console.log(err.response);
            console.log(err.message);
          });
      })
      .catch((err) => {
        console.log(err);
        console.log(err.response);
        console.log(err.message);
      });

    getCategories()
      .then(getPlanList())
      .then(() => {
        if (tId) {
          getTest(tId)
            .then(
              (res) => {
                const {
                  targets,
                  quests,
                } = res.data;
                const { order } = this.props;
                const {
                  id,
                  title,
                  step,
                  client_name,
                  client_phone_number,
                  client_email,
                  media_category_1,
                  media_category_2,
                  service_extra_info,
                  service_category,
                  service_format,
                  service_description,
                  service_status,
                  funnel,
                  staff,
                  project_id,
                  create_user_id,
                  created_at,
                  is_register_required,
                } = res.data;
                const { report_url } = res.data;
                const tgId = targets[0].id !== null && targets[0].id !== undefined
                  ? targets[0].id : null;

                getTarget(tgId)
                  .then((res) => {
                    this.setState(prevState => _.merge(prevState, {
                      test: {
                        default: {
                          tId: id,
                          title,
                          step,
                          client_name,
                          client_phone_number,
                          client_email,
                          media_category_1,
                          media_category_2,
                          service_extra_info,
                          service_category,
                          service_format,
                          service_description,
                          service_status,
                          funnel,
                          staff,
                          project_id,
                          create_user_id,
                          created_at,
                          is_register_required,
                        },
                        target: res.data,
                        quests,
                        order,
                        report_url,
                      },
                    }));
                  })
                  .then(() => {
                    const { test } = this.state;
                    const { target } = test;
                    const ageMax = target !== undefined ? test.target.age_maximum : undefined;
                    const ageMin = target !== undefined ? test.target.age_minimum : undefined;
                    const genderValue = target !== undefined ? test.target.gender : undefined;
                    // const { age_maximum, age_minimum, gender } = test.target;
                    const hasTargetValue = (ageMax && ageMin) !== null
                      && (ageMax && ageMin) !== undefined;
                    const hasGenderValue = genderValue !== '' && genderValue !== undefined;
                    const hasExtraTargetCate = target !== undefined
                      && target.extras !== undefined
                      ? target.extras.filter(x => x.name.length > 0).length : 0;
                    const hasExtraTargetValue = target !== undefined
                      && target.extras !== undefined
                      ? target.extras.filter(x => x.value.length > 0).length : 0;
                    const isExtraCorrect = hasExtraTargetCate === hasExtraTargetValue;
                    const issues = test.quests !== undefined
                      ? test.quests.map(q => q.issue) : undefined;
                    const issuePurposes = test.quests !== undefined
                      ? test.quests.map(q => q.issue_purpose) : undefined;
                    const issueDetails = test.quests !== undefined
                      ? test.quests.map(q => q.issue_detail) : undefined;
                    const hasIssue1Value = issues !== undefined ? issues[0] !== '' : false;
                    const hasIssuePurpose1Value = issuePurposes !== undefined ? issuePurposes[0] !== '' : false;
                    const hasIssueDetail1Value = issueDetails !== undefined ? issueDetails[0] !== '' : false;
                    const hasPayValue = test.order !== null
                      && test.order !== undefined
                      && test.order.plan.name !== undefined;
                    const hasCompleted = test.default !== undefined ? test.default.step === 'COMPLETED' : false;
                    const isTestStep = test.default !== undefined ? test.default.step === 'TESTING' : false;
                    const isPaymentStep = test.default !== undefined ? test.default.step === 'PAYMENT' : false;
                    // const isRegisterStep = test.default !== undefined
                    // ? test.default.step === 'REGISTER' : false;
                    const isApply = test.default !== undefined ? test.default.step === 'APPLY' : false;
                    const hasDefaultPassed = Object.values(test.default).filter(x => x === '').length < 3;
                    const hasTargetPassed = Object.values(test.target).filter(x => x === null).length === 0 && Object.values(test.target).filter(x => x === '').length < 2 && isExtraCorrect;

                    if (isApply && !hasDefaultPassed) {
                      this.setState({
                        isLoading: false,
                        isDefaultRendered: true,
                        isDefaultPassed: false,
                        isTargetRendered: false,
                        isQuestRendered: false,
                        isPayRendered: false,
                      });
                    }

                    if (hasDefaultPassed) {
                      this.setState({
                        isLoading: false,
                        isDefaultRendered: false,
                        isDefaultPassed: true,
                        isTargetRendered: true,
                        isQuestRendered: false,
                        isPayRendered: false,
                      });
                    }

                    if (hasDefaultPassed && hasTargetValue && hasGenderValue && hasTargetPassed) {
                      this.setState({
                        isLoading: false,
                        isDefaultRendered: false,
                        isTargetRendered: false,
                        isTargetPassed: true,
                        isQuestRendered: true,
                        isPayRendered: false,
                      });
                    }

                    if (isApply
                      && hasDefaultPassed
                      && hasTargetPassed
                      && hasIssue1Value
                      && hasIssuePurpose1Value
                      && hasIssueDetail1Value) {
                      this.setState({
                        isLoading: false,
                        isDefaultRendered: false,
                        isTargetRendered: false,
                        isTargetPassed: true,
                        isPayRendered: false,
                        isQuestRendered: true,
                        isQuestPassed: false,
                      });
                    }

                    if (!isApply
                      && hasIssue1Value
                      && hasIssuePurpose1Value
                      && hasIssueDetail1Value) {
                      this.setState({
                        isLoading: false,
                        isDefaultRendered: false,
                        isTargetRendered: false,
                        isTargetPassed: true,
                        isQuestRendered: false,
                        isQuestPassed: true,
                        isPayRendered: true,
                        isReportRendered: false,
                      });
                    }

                    if (hasPayValue) {
                      this.setState({
                        isLoading: false,
                        isDefaultRendered: false,
                        isTargetRendered: false,
                        isQuestRendered: false,
                        isReportRendered: false,
                        isPayPassed: true,
                        isAllRendered: false,
                        isCompleteStep: false,
                      });
                    }

                    if (hasPayValue && isPaymentStep) {
                      this.setState({
                        isLoading: false,
                        isDefaultRendered: false,
                        isTargetRendered: false,
                        isQuestRendered: false,
                        isReportRendered: false,
                        isPayPassed: true,
                        isAllRendered: false,
                        isCompleteStep: false,
                      });
                    }

                    if (hasPayValue && isTestStep) {
                      this.setState({
                        isLoading: false,
                        isDefaultRendered: false,
                        isTargetRendered: false,
                        isQuestRendered: false,
                        isPayRendered: false,
                        isReportRendered: true,
                        isPayPassed: false,
                        isAllRendered: false,
                        isCompleteStep: false,
                        isTestStep: true,
                      });
                    }

                    if (hasCompleted) {
                      this.setState({
                        isLoading: false,
                        isPayRendered: false,
                        isReportRendered: true,
                        isCompleteStep: true,
                        isTestStep: false,
                      });
                    }
                  })
                  .catch(err => console.log(err.response));
              },
            )
            .catch((err) => {
              console.log(err);
              console.log(err.message);
              console.log(err.reponse);
            });
        }

        if (!tId) {
          this.setState({ isLoading: false });
          this.titleInput.getRenderedComponent().focus();
          // this.handleBlurSave();
        }
      });
  }

  componentDidUpdate = () => {
    const { route } = this.props;
    const { match } = route;
    const { tId } = match.params;
    const { shouldBlockNavigation } = this.state;

    if (shouldBlockNavigation && tId) {
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = undefined;
    }
  }


  componentWillUnmount() {
    // eslint-disable-next-line no-shadow
    const { setTestInit } = this.props;
    window.onbeforeunload = undefined;
    setTestInit();
  }


  goBack = (e) => {
    e.preventDefault();
    const { route } = this.props;
    const { match } = route;

    if (!match.params.tId) window.location.reload();
    window.location.assign(`/project/${match.params.pId}`);
  };

  handleBackBtn = () => {
    const { route } = this.props;
    const { match } = route;

    if (match.params.tId) {
      window.location.assign(`/project/${match.params.pId}`);
    } else {
      window.location.assign('/project/');
    }
  }

  handleCancleBtn = (e) => {
    e.preventDefault();
    const { togglePopup } = this.props;

    togglePopup(false);
    this.setState({
      isBackConfirmPopup: false,
      isRegisterInfoPopup: false,
      isPayInfoPopup: false,
    });
  }

  handleFormRender = (id) => {
    const renderDefault = id === 0
      ? this.setState({ isDefaultRendered: true })
      : this.setState({ isDefaultRendered: false });
    const renderTarget = id === 1
      ? this.setState({ isTargetRendered: true })
      : this.setState({ isTargetRendered: false });
    const renderQuest = id === 2
      ? this.setState({ isQuestRendered: true })
      : this.setState({ isQuestRendered: false });
    const renderPay = id === 3
      ? this.setState({ isPayRendered: true })
      : this.setState({ isPayRendered: false });
    const renderReport = id === 4
      ? this.setState({ isReportRendered: true })
      : this.setState({ isReportRendered: false });

    return {
      renderDefault, renderTarget, renderQuest, renderPay, renderReport,
    };
  };

  handleBlurSave = async () => {
    const { fieldsValues, fieldError } = this.props;
    const { isDefaultRendered, isTargetRendered, isQuestRendered } = this.state;
    // eslint-disable-next-line max-len
    const hasDefaultError = fieldError.default !== undefined ? Object.values(fieldError.default).filter(x => Object.values(x).length > 0).length > 0 : false;
    // eslint-disable-next-line max-len
    const hasTargetError = fieldError.target !== undefined ? Object.values(fieldError.target).filter(x => Object.values(x).length > 0).length > 0 : false;
    const hasExTargetError = fieldError.target !== undefined
      ? (fieldError.target.extraInfoCategory1 !== undefined
        || fieldError.target.extraInfoDesc1 !== undefined
        || fieldError.target.extraInfoCategory2 !== undefined
        || fieldError.target.extraInfoDesc2 !== undefined
        || fieldError.target.extraInfoCategory3 !== undefined
        || fieldError.target.extraInfoDesc3 !== undefined)
      : false;

    // eslint-disable-next-line max-len
    const hasQuestError = fieldError.quest !== undefined ? Object.values(fieldError.quest).filter(y => Object.values(y).length > 0).length > 0 : false;
    const titleValue = fieldsValues !== undefined && fieldsValues.title !== undefined
      ? fieldsValues.title : undefined;
    const media1Value = fieldsValues !== undefined && fieldsValues.default.media1 !== undefined
      ? fieldsValues.default.media1 : undefined;
    const media2Value = fieldsValues !== undefined && fieldsValues.default.media2 !== undefined
      ? fieldsValues.default.media2 : undefined;
    const serviceInfoValue = fieldsValues !== undefined
      && fieldsValues.default.serviceInfo !== undefined
      ? fieldsValues.default.serviceInfo : undefined;
    const serviceCategoryValue = fieldsValues !== undefined
      && fieldsValues.default.serviceCategory !== undefined
      ? fieldsValues.default.serviceCategory : undefined;
    const serviceFormatValue = fieldsValues !== undefined
      && fieldsValues.default.serviceFormat !== undefined
      ? fieldsValues.default.serviceFormat : undefined;
    const serviceDescValue = fieldsValues !== undefined
      && fieldsValues.default.serviceDesc !== undefined
      ? fieldsValues.default.serviceDesc : undefined;
    const serviceStatusValue = fieldsValues !== undefined
      && fieldsValues.default.serviceStatus !== undefined
      ? fieldsValues.default.serviceStatus : undefined;
    const clientNameValue = fieldsValues !== undefined
      && fieldsValues.default.clientName !== undefined
      ? fieldsValues.default.clientName : undefined;
    const clientContactValue = fieldsValues !== undefined
      && fieldsValues.default.clientContact !== undefined
      ? fieldsValues.default.clientContact : undefined;
    const emailValue = fieldsValues !== undefined && fieldsValues.default.email !== undefined
      ? fieldsValues.default.email : undefined;
    const funnelValue = fieldsValues !== undefined && fieldsValues.default.funnel !== undefined
      ? fieldsValues.default.funnel : undefined;

    // target
    const minAgeValue = fieldsValues !== undefined ? fieldsValues.target.minAge : undefined;
    const maxAgeValue = fieldsValues !== undefined ? fieldsValues.target.maxAge : undefined;
    const getGenderValue = fieldsValues !== undefined ? fieldsValues.target.gender : undefined;
    const extraInfoDesc1 = fieldsValues !== undefined
      ? fieldsValues.target.extraInfoDesc1 : undefined;
    const extraInfoDesc2 = fieldsValues !== undefined
      ? fieldsValues.target.extraInfoDesc2 : undefined;
    const extraInfoDesc3 = fieldsValues !== undefined
      ? fieldsValues.target.extraInfoDesc3 : undefined;
    const extraInfoCategory1 = fieldsValues !== undefined
      ? fieldsValues.target.extraInfoCategory1 : undefined;
    const extraInfoCategory2 = fieldsValues !== undefined
      ? fieldsValues.target.extraInfoCategory2 : undefined;
    const extraInfoCategory3 = fieldsValues !== undefined
      ? fieldsValues.target.extraInfoCategory3 : undefined;
    const interestValue = fieldsValues !== undefined ? fieldsValues.target.interest : undefined;

    // quest
    const registerRequire = fieldsValues !== undefined
      ? fieldsValues.quest.registerRequire : undefined;
    const issue1Value = fieldsValues !== undefined && Object.values(fieldsValues.quest.issue)[0] !== '' ? Object.values(fieldsValues.quest.issue)[0] : undefined;
    const issue2Value = fieldsValues !== undefined && Object.values(fieldsValues.quest.issue)[1] !== '' ? Object.values(fieldsValues.quest.issue)[1] : undefined;
    const issue3Value = fieldsValues !== undefined && Object.values(fieldsValues.quest.issue)[2] !== '' ? Object.values(fieldsValues.quest.issue)[2] : undefined;
    const issueDetail1Value = fieldsValues !== undefined
      ? Object.values(fieldsValues.quest.issueDetail)[0] : undefined;
    const issueDetail2Value = fieldsValues !== undefined
      ? Object.values(fieldsValues.quest.issueDetail)[1] : undefined;
    const issueDetail3Value = fieldsValues !== undefined
      ? Object.values(fieldsValues.quest.issueDetail)[2] : undefined;
    const issueissuePurpose1Value = fieldsValues !== undefined && Object.values(fieldsValues.quest.issuePurpose)[0] !== '' ? Object.values(fieldsValues.quest.issuePurpose)[0] : undefined;
    const issueissuePurpose2Value = fieldsValues !== undefined && Object.values(fieldsValues.quest.issuePurpose)[1] !== '' ? Object.values(fieldsValues.quest.issuePurpose)[1] : undefined;
    const issueissuePurpose3Value = fieldsValues !== undefined && Object.values(fieldsValues.quest.issuePurpose)[2] !== '' ? Object.values(fieldsValues.quest.issuePurpose)[2] : undefined;
    const {
      route,
      postTest,
      patchTest,
      patchTarget,
      postTargetExtra,
      patchTargetExtra,
      patchQuest,
      getTest,
      getTarget,
      categoryList,
      extras,
    } = this.props;
    const { match, history } = route;
    const { pId, tId } = match.params;
    const { test } = this.state;
    const { target } = test;
    const tgId = target !== undefined ? target.id : null;
    const titleReg = titleValue !== undefined ? titleValue.replace(/(^\s*)|(\s*$)/g, '') : undefined;
    const clientNameReg = clientNameValue !== undefined ? clientNameValue.replace(/(^\s*)|(\s*$)/g, '') : undefined;
    const clientContactReg = clientContactValue !== undefined ? clientContactValue.replace(/(^\s*)|(\s*$)/g, '').replace(/-/g, '') : undefined;
    const emailReg = emailValue !== undefined ? emailValue.replace(/(^\s*)|(\s*$)/g, '') : undefined;
    const serviceInfoReg = serviceInfoValue !== undefined ? serviceInfoValue.replace(/(^\s*)|(\s*$)/g, '') : undefined;
    const defaultValueArr = [
      titleReg,
      media1Value,
      media2Value,
      serviceInfoReg,
      serviceCategoryValue,
      serviceFormatValue,
      serviceDescValue,
      serviceStatusValue,
      clientNameReg,
      clientContactReg,
      emailReg,
      funnelValue,
    ];
    const targetValueArr = [
      minAgeValue,
      maxAgeValue,
      getGenderValue,
      extraInfoDesc1,
      extraInfoDesc2,
      extraInfoDesc3,
      extraInfoCategory1,
      extraInfoCategory2,
      extraInfoCategory3,
    ];
    const questValueArr = [
      registerRequire,
      issue1Value,
      issue2Value,
      issue3Value,
      issueDetail1Value,
      issueDetail2Value,
      issueDetail3Value,
      issueissuePurpose1Value,
      issueissuePurpose2Value,
      issueissuePurpose3Value,
    ];
    const hasDefaultPassed = () => {
      const hasDefaultValue = defaultValueArr.length > 0;
      return !!hasDefaultValue;
    };
    const hasTargetPassed = () => {
      const hasTargetValue = targetValueArr.length > 0;
      return !!hasTargetValue;
    };
    const hasQuestPassed = () => {
      const hasQuestValue = questValueArr.length > 0;
      return !!hasQuestValue;
    };

    if (hasDefaultError) this.setState({ hasDefaultError: true });

    if (hasTargetError || hasExTargetError) this.setState({ hasTargetError: true });

    if (hasExTargetError) this.setState({ hasExTargetError: true });

    if (hasQuestError) this.setState({ hasQuestError: true });

    const defaultBlurSave = async () => {
      if (this.state.inSaving) {
        return;
      }
      this.setState({ inSaving: true });

      if (isDefaultRendered && hasDefaultPassed()) {
        const step = 'APPLY';

        if (tId) {
          if (!hasDefaultError) {
            this.setState({
              hasDefaultError: false,
              isDefaultPassed: true,
            });
          }

          if (this.state.isBlurSaved) {
            this.setState({ inSaving: false });
            return;
          }
          await patchTest(
            tId,
            pId,
            step,
            titleReg,
            clientNameReg,
            clientContactReg,
            media2Value,
            emailReg,
            media1Value,
            serviceFormatValue,
            serviceInfoReg,
            serviceCategoryValue,
            serviceStatusValue,
            serviceDescValue,
            funnelValue,
          );

          this.setState({
            isBlurSaved: true,
          }, () => setTimeout(() => this.setState({ isBlurSaved: false }), 30000));
        } else {
          if (this.state.isBlurSaved) {
            this.setState({ inSaving: false });
            return;
          }
          this.setState({ inPostTest: `"${fieldsValues.title}" 테스트 슬롯을 생성 중입니다` });
          const res = await postTest(
            pId,
            step,
            titleReg,
            clientNameReg,
            clientContactReg,
            media2Value,
            emailReg,
            media1Value,
            serviceFormatValue,
            serviceInfoReg,
            serviceCategoryValue,
            serviceStatusValue,
            serviceDescValue,
            funnelValue,
          );
          history.push(`/project/${match.params.pId}/test/${res.data.id}`);
          this.setState(prevState => _.merge(prevState, {
            inPostTest: false,
            isBlurSaved: true,
            test: {
              target: { id: res.data.targets[0].id },
              quests: [
                { id: res.data.quests[0].id },
                { id: res.data.quests[1].id },
                { id: res.data.quests[2].id },
              ],
            },
          }), () => setTimeout(() => this.setState({ isBlurSaved: false }), 30000));
        }
      } else if (isTargetRendered && hasTargetPassed()) {
        // eslint-disable-next-line no-nested-ternary
        const setGenderValue = () => {
          let genderValueTxt;

          if (getGenderValue !== undefined) {
            switch (getGenderValue) {
              case '여자':
                genderValueTxt = 'female';
                break;
              case '남자':
                genderValueTxt = 'male';
                break;
              case '무관':
                genderValueTxt = 'both';
                break;
              default:
                genderValueTxt = undefined;
                break;
            }
          }

          return genderValueTxt;
        };
        const genderValue = setGenderValue();
        const categoryListArr = Object.keys(categoryList).length > 0
          ? Object.keys(categoryList).map(c => categoryList[c].category_items)
          : undefined;
        // submit values 값 확인
        const exCate1Id = extraInfoCategory1 !== undefined
          ? categoryListArr[6].find(e => e.name === extraInfoCategory1).id : undefined;
        const exCate2Id = extraInfoCategory2 !== undefined
          ? categoryListArr[6].find(e => e.name === extraInfoCategory2).id : undefined;
        const exCate3Id = extraInfoCategory3 !== undefined
          ? categoryListArr[6].find(e => e.name === extraInfoCategory3).id : undefined;

        const exValue1Id = extraInfoDesc1 !== undefined && extraInfoDesc1 !== '' ? extraInfoDesc1 : undefined;
        const exValue2Id = extraInfoDesc2 !== undefined && extraInfoDesc2 !== '' ? extraInfoDesc2 : undefined;
        const exValue3Id = extraInfoDesc3 !== undefined && extraInfoDesc3 !== '' ? extraInfoDesc3 : undefined;

        const res = await getTarget(tgId);
        const tgEx1Id = extras.length > 0 ? res.data.extras[0].id : undefined;
        const tgEx2Id = extras.length > 1 ? res.data.extras[1].id : undefined;
        const tgEx3Id = extras.length > 2 ? res.data.extras[2].id : undefined;

        if ((exCate1Id !== undefined && exValue1Id === undefined)
              || (exCate1Id === undefined && exValue1Id !== undefined)) {
          console.log('set true 1');
          this.setState({
            hasExTargetError: true,
          });
        }

        if ((exCate2Id !== undefined && exValue2Id === undefined)
            || (exCate2Id === undefined && exValue2Id !== undefined)) {
          console.log('set true 2');
          this.setState({
            hasExTargetError: true,
          });
        }

        if ((exCate3Id !== undefined && exValue3Id === undefined)
            || (exCate3Id === undefined && exValue3Id !== undefined)) {
          console.log('set true 3');
          this.setState({
            hasExTargetError: true,
          });
        }

        if (!hasTargetError && !hasExTargetError) {
          this.setState({
            hasTargetError: false,
          });
        }

        if (!hasExTargetError) {
          console.log('set false 1');
          this.setState({
            hasExTargetError: false,
          });
        }

        if (!!tgEx1Id
              && !hasExTargetError
              && exCate1Id !== undefined
              && exValue1Id !== undefined) {
          if (this.state.isBlurSaved) {
            this.setState({ inSaving: false });
            return;
          }
          await patchTargetExtra(tgEx1Id, tgId, exCate1Id, extraInfoDesc1);
          await getTarget(tgId);
          console.log('set false 2');
          this.setState({
            isBlurSaved: true,
            hasExTargetError: false,
          }, () => setTimeout(() => this.setState({ isBlurSaved: false }), 30000));
        } else if (!hasExTargetError && exCate1Id !== undefined && exValue1Id !== undefined) {
          if (this.state.isBlurSaved) {
            this.setState({ inSaving: false });
            return;
          }
          await getTest(tId);
          await postTargetExtra(tgId, exCate1Id, extraInfoDesc1);
          await getTarget(tgId);
          console.log('set false 3');
          this.setState({
            isBlurSaved: true,
            hasExTargetError: false,
          }, () => setTimeout(() => this.setState({ isBlurSaved: false }), 30000));
        }

        if (!!tgEx2Id
              && !hasExTargetError
              && exCate2Id !== undefined
              && exValue2Id !== undefined) {
          if (this.state.isBlurSaved) {
            this.setState({ inSaving: false });
            return;
          }
          await patchTargetExtra(tgEx2Id, tgId, exCate2Id, extraInfoDesc2);
          await getTarget(tgId);
          console.log('set false 4');
          this.setState({
            isBlurSaved: true,
            hasExTargetError: false,
          }, () => setTimeout(() => this.setState({ isBlurSaved: false }), 30000));
        } else if (!hasExTargetError && exCate2Id !== undefined && exValue2Id !== undefined) {
          if (this.state.isBlurSaved) {
            this.setState({ inSaving: false });
            return;
          }
          await getTest(tId);
          await postTargetExtra(tgId, exCate2Id, extraInfoDesc2);
          await getTarget(tgId);
          console.log('set false 5');
          this.setState({
            isBlurSaved: true,
            hasExTargetError: false,
          }, () => setTimeout(() => this.setState({ isBlurSaved: false }), 30000));
        }

        if (!!tgEx3Id
              && !hasExTargetError
              && exCate3Id !== undefined
              && exValue3Id !== undefined) {
          if (this.state.isBlurSaved) {
            this.setState({ inSaving: false });
            return;
          }
          await patchTargetExtra(tgEx3Id, tgId, exCate3Id, extraInfoDesc3);
          await getTarget(tgId);
          console.log('set false 6');
          this.setState({
            isBlurSaved: true,
            hasExTargetError: false,
          }, () => setTimeout(() => this.setState({ isBlurSaved: false }), 30000));
        } else if (!hasExTargetError && exCate3Id !== undefined && exValue3Id !== undefined) {
          if (this.state.isBlurSaved) {
            this.setState({ inSaving: false });
            return;
          }
          await getTest(tId);
          await postTargetExtra(tgId, exCate3Id, extraInfoDesc3);
          await getTarget(tgId);
          console.log('set false 7');
          this.setState({
            isBlurSaved: true,
            hasExTargetError: false,
          }, () => setTimeout(() => this.setState({ isBlurSaved: false }), 30000));
        }

        if (hasTargetError
          || genderValue === undefined || genderValue === null
          || minAgeValue === undefined || minAgeValue === null
          || maxAgeValue === undefined || maxAgeValue === null
        ) {
          console.log('error');
        } else {
          if (!hasTargetError) {
            this.setState({
              hasTargetError: false,
            });
          }
          if (this.state.isBlurSaved) {
            this.setState({ inSaving: false });
            return;
          }

          await patchTarget(
            tgId,
            tId,
            genderValue,
            minAgeValue,
            maxAgeValue,
            interestValue,
          );
          await getTest(tId);
          this.setState({
            isBlurSaved: true,
            hasTargetError: false,
          }, () => setTimeout(() => this.setState({ isBlurSaved: false }), 30000));
        }
      } else if (isQuestRendered && hasQuestPassed()) {
        const qId = test.quests.map(q => q.id);
        const issueDetail1ValueReg = issueDetail1Value !== undefined ? issueDetail1Value.replace(/(^\s*)|(\s*$)/g, '') : undefined;
        const issueDetail2ValueReg = issueDetail2Value !== undefined ? issueDetail2Value.replace(/(^\s*)|(\s*$)/g, '') : undefined;
        const issueDetail3ValueReg = issueDetail3Value !== undefined ? issueDetail3Value.replace(/(^\s*)|(\s*$)/g, '') : undefined;
        const issueissuePurpose1ValueReg = issueissuePurpose1Value !== undefined ? issueissuePurpose1Value.replace(/(^\s*)|(\s*$)/g, '') : undefined;
        const issueissuePurpose2ValueReg = issueissuePurpose2Value !== undefined ? issueissuePurpose2Value.replace(/(^\s*)|(\s*$)/g, '') : undefined;
        const issueissuePurpose3ValueReg = issueissuePurpose3Value !== undefined ? issueissuePurpose3Value.replace(/(^\s*)|(\s*$)/g, '') : undefined;
        const registerValue = registerRequire !== '아니오';
        const step = 'APPLY';

        if (issue1Value === undefined
          || issueDetail1ValueReg === undefined
          || issueissuePurpose1ValueReg === undefined) {
          this.setState({
            hasQuestError: true,
          });
        }

        if ((issue2Value !== undefined && issueDetail2ValueReg === undefined)
          || (issue2Value !== undefined && issueissuePurpose2ValueReg === undefined)
          || (issue2Value === undefined && issueDetail2ValueReg !== undefined)
          || (issue2Value === undefined && issueissuePurpose2ValueReg !== undefined)) {
          this.setState({
            hasQuestError: true,
          });
        }

        if ((issue3Value !== undefined && issueDetail3ValueReg === undefined)
          || (issue3Value !== undefined && issueissuePurpose3ValueReg === undefined)
          || (issue3Value === undefined && issueDetail3ValueReg !== undefined)
          || (issue3Value === undefined && issueissuePurpose3ValueReg !== undefined)) {
          this.setState({
            hasQuestError: true,
          });
        }

        if (issue1Value === undefined
          || issueDetail1ValueReg === undefined
          || issueissuePurpose1ValueReg === undefined) {
          this.setState({
            hasQuestError: true,
          });
        }

        if (!hasQuestError) {
          this.setState({
            hasQuestError: false,
            isQuestPassed: true,
          });
        }

        if (registerRequire) {
          if (this.state.isBlurSaved) {
            this.setState({ inSaving: false });
            return;
          }
          await patchTest(
            tId,
            pId,
            step,
            titleReg,
            clientNameReg,
            clientContactReg,
            media2Value,
            emailReg,
            media1Value,
            serviceFormatValue,
            serviceInfoReg,
            serviceCategoryValue,
            serviceStatusValue,
            serviceDescValue,
            funnelValue,
            registerValue,
          );
          this.setState({
            isBlurSaved: true,
          }, () => setTimeout(() => this.setState({ isBlurSaved: false }), 30000));
        }

        if (!hasQuestError
          && issue1Value && issueDetail1ValueReg && issueissuePurpose1ValueReg) {
          if (this.state.isBlurSaved) {
            this.setState({ inSaving: false });
            return;
          }
          await patchTest(
            tId,
            pId,
            step,
            titleReg,
            clientNameReg,
            clientContactReg,
            media2Value,
            emailReg,
            media1Value,
            serviceFormatValue,
            serviceInfoReg,
            serviceCategoryValue,
            serviceStatusValue,
            serviceDescValue,
            funnelValue,
            registerValue,
          );
          this.setState({
            isBlurSaved: true,
          }, () => setTimeout(() => this.setState({ isBlurSaved: false }), 30000));

          await patchQuest(
            qId[0],
            tId,
            issue1Value,
            issueDetail1ValueReg,
            issueissuePurpose1ValueReg,
          );
          await getTest(tId);

          this.setState({
            isBlurSaved: true,
            hasQuestError: false,
          }, () => setTimeout(() => this.setState({ isBlurSaved: false }), 30000));
          console.log(this.state);
        }

        if (!hasQuestError
          && issue2Value && issueDetail2ValueReg && issueissuePurpose2ValueReg) {
          if (this.state.isBlurSaved) {
            this.setState({ inSaving: false });
            return;
          }
          await patchTest(
            tId,
            pId,
            step,
            titleReg,
            clientNameReg,
            clientContactReg,
            media2Value,
            emailReg,
            media1Value,
            serviceFormatValue,
            serviceInfoReg,
            serviceCategoryValue,
            serviceStatusValue,
            serviceDescValue,
            funnelValue,
            registerValue,
          );
          this.setState({
            isBlurSaved: true,
          }, () => setTimeout(() => this.setState({ isBlurSaved: false }), 30000));

          await patchQuest(
            qId[1],
            tId,
            issue2Value,
            issueDetail2ValueReg,
            issueissuePurpose2ValueReg,
          );
          await getTest(tId);

          this.setState({
            isBlurSaved: true,
            hasQuestError: false,
          }, () => setTimeout(() => this.setState({ isBlurSaved: false }), 30000));
        }

        if (!hasQuestError
          && issue3Value && issueDetail3ValueReg && issueissuePurpose3ValueReg) {
          if (this.state.isBlurSaved) {
            this.setState({ inSaving: false });
            return;
          }
          await patchTest(
            tId,
            pId,
            step,
            titleReg,
            clientNameReg,
            clientContactReg,
            media2Value,
            emailReg,
            media1Value,
            serviceFormatValue,
            serviceInfoReg,
            serviceCategoryValue,
            serviceStatusValue,
            serviceDescValue,
            funnelValue,
            registerValue,
          );
          this.setState({
            isBlurSaved: true,
          }, () => setTimeout(() => this.setState({ isBlurSaved: false }), 30000));
          await patchQuest(
            qId[2],
            tId,
            issue3Value,
            issueDetail3ValueReg,
            issueissuePurpose3ValueReg,
          );
          await getTest(tId);

          this.setState({
            isBlurSaved: true,
            hasQuestError: false,
          }, () => setTimeout(() => this.setState({ isBlurSaved: false }), 30000));
        }
      }
      this.setState({ lastSavedTime: new Date(), inSaving: false });
    };

    return defaultBlurSave();
  }

  getTime = () => {
    const getValue = this.state.lastSavedTime;
    const day = getValue.getDate();
    const month = getValue.getMonth() + 1;
    const year = getValue.getFullYear();
    const hour = getValue.getHours();
    const minute = getValue.getMinutes();
    const seconds = getValue.getSeconds();
    const date = `${year}. ${month} .${day} ${hour}시 ${minute}분 ${seconds}초`;

    return date;
  }

  onSubmit = async (values) => {
    const {
      route,
      postTest,
      postTargetExtra,
      patchTest,
      patchTarget,
      patchTargetExtra,
      patchQuest,
      getTest,
      getTarget,
      categoryList,
      extras,
      orderTest,
      planList,
      togglePopup,
    } = this.props;
    const { match, history } = route;
    const { pId, tId } = match.params;
    const { protocol } = window.location;
    const {
      test,
      isDefaultRendered,
      isTargetRendered,
      isQuestRendered,
      isPayRendered,
      hasDefaultError,
      hasTargetError,
      hasExTargetError,
      hasQuestError,
    } = this.state;
    const { target } = test;
    const tgId = target !== undefined ? target.id : null;
    const { title } = values;
    const {
      clientName,
      clientContact,
      media2,
      email,
      media1,
      serviceFormat,
      serviceInfo,
      serviceCategory,
      serviceStatus,
      serviceDesc,
      funnel,
    } = values.default;
    const titleReg = title.replace(/(^\s*)|(\s*$)/g, '');
    const clientNameReg = clientName.replace(/(^\s*)|(\s*$)/g, '');
    const clientContactReg = clientContact.replace(/(^\s*)|(\s*$)/g, '');
    const emailReg = email.replace(/(^\s*)|(\s*$)/g, '');
    const serviceInfoReg = serviceInfo.replace(/(^\s*)|(\s*$)/g, '');
    const hasDefaultPassed = () => {
      const hasDefaultValue = Object.keys(values.default).length > 0;
      return !!hasDefaultValue;
    };
    const hasTargetPassed = () => {
      const hasTargetValue = Object.keys(values.target).length > 0;
      return !!hasTargetValue;
    };
    const hasQuestPassed = () => {
      const hasQuestValue = Object.keys(values.quest).length > 0;
      return !!hasQuestValue;
    };
    const hasPayPassed = () => {
      const hasPayValue = Object.keys(values.pay).length > 0;
      return !!hasPayValue;
    };

    if (tId) {
      if (isDefaultRendered && hasDefaultPassed()) {
        const step = 'APPLY';

        await patchTest(
          tId,
          pId,
          step,
          titleReg,
          clientNameReg,
          clientContactReg,
          media2,
          emailReg,
          media1,
          serviceFormat,
          serviceInfoReg,
          serviceCategory,
          serviceStatus,
          serviceDesc,
          funnel,
        );
        this.setState({
          hasDefaultError: false,
          isDefaultRendered: false,
          isDefaultPassed: true,
          isTargetRendered: true,
        });
      } else if (isTargetRendered && hasTargetPassed()) {
        const {
          gender,
          minAge,
          maxAge,
          extraInfoCategory1,
          extraInfoCategory2,
          extraInfoCategory3,
          extraInfoDesc1,
          extraInfoDesc2,
          extraInfoDesc3,
          interest,
        } = values.target;
        // eslint-disable-next-line no-nested-ternary
        const genderValue = gender === '여자' ? 'female' : (gender === '남자' ? 'male' : 'both');
        const categoryListArr = Object.keys(categoryList).length > 0
          ? Object.keys(categoryList).map(c => categoryList[c].category_items)
          : undefined;
        // submit values 값 확인
        const exCate1Id = extraInfoCategory1 !== undefined
          ? categoryListArr[6].find(e => e.name === extraInfoCategory1).id : undefined;
        const exCate2Id = extraInfoCategory2 !== undefined
          ? categoryListArr[6].find(e => e.name === extraInfoCategory2).id : undefined;
        const exCate3Id = extraInfoCategory3 !== undefined
          ? categoryListArr[6].find(e => e.name === extraInfoCategory3).id : undefined;

        const exValue1Id = extraInfoDesc1 !== undefined && extraInfoDesc1 !== '' ? extraInfoDesc1 : undefined;
        const exValue2Id = extraInfoDesc2 !== undefined && extraInfoDesc2 !== '' ? extraInfoDesc2 : undefined;
        const exValue3Id = extraInfoDesc3 !== undefined && extraInfoDesc3 !== '' ? extraInfoDesc3 : undefined;

        const res = await getTarget(tgId);
        const tgEx1Id = extras.length > 0 ? res.data.extras[0].id : undefined;
        const tgEx2Id = extras.length > 1 ? res.data.extras[1].id : undefined;
        const tgEx3Id = extras.length > 2 ? res.data.extras[2].id : undefined;

        if ((exCate1Id !== undefined && exValue1Id === undefined)
              || (exCate1Id === undefined && exValue1Id !== undefined)) {
          console.log('set true 4');
          this.setState({
            hasExTargetError: true,
          });
        }

        if ((exCate2Id !== undefined && exValue2Id === undefined)
            || (exCate2Id === undefined && exValue2Id !== undefined)) {
          console.log('set true 5');
          this.setState({
            hasExTargetError: true,
          });
        }

        if ((exCate3Id !== undefined && exValue3Id === undefined)
            || (exCate3Id === undefined && exValue3Id !== undefined)) {
          console.log('set true 6');
          this.setState({
            hasExTargetError: true,
          });
        }

        console.log('berry1', hasExTargetError, tgEx1Id, exCate1Id, exValue1Id);
        if (exCate1Id !== undefined
              && exValue1Id !== undefined) {
          if (!tgEx1Id) {
            await postTargetExtra(tgId, exCate1Id, extraInfoDesc1);
          } else {
            await patchTargetExtra(tgEx1Id, tgId, exCate1Id, extraInfoDesc1);
          }
          await getTarget(tgId);
          console.log('set false 8');
          this.setState({
            hasExTargetError: false,
          });
        }

        console.log('berry2', hasExTargetError, tgEx2Id, exCate2Id, exValue2Id);
        if (exCate2Id !== undefined
              && exValue2Id !== undefined) {
          if (!tgEx2Id) {
            await postTargetExtra(tgId, exCate2Id, extraInfoDesc2);
          } else {
            await patchTargetExtra(tgEx2Id, tgId, exCate2Id, extraInfoDesc2);
          }
          await getTarget(tgId);
          console.log('set false 10');
          this.setState({
            hasExTargetError: false,
          });
        }

        console.log('berry3', hasExTargetError, tgEx3Id, exCate3Id, exValue3Id);
        if (exCate3Id !== undefined
              && exValue3Id !== undefined) {
          if (!tgEx3Id) {
            await postTargetExtra(tgId, exCate3Id, extraInfoDesc3);
          } else {
            await patchTargetExtra(tgEx3Id, tgId, exCate3Id, extraInfoDesc3);
          }
          await getTarget(tgId);
          console.log('set false 11');
          this.setState({
            hasExTargetError: false,
          });
        }

        if (genderValue !== undefined && genderValue !== null
          && minAge !== undefined && minAge !== null
          && maxAge !== undefined && maxAge !== null) {
          await patchTarget(
            tgId,
            tId,
            genderValue,
            minAge,
            maxAge,
            interest,
          );
          await getTest(tId);
          console.log('set false 12');
          this.setState({
            hasTargetError: false,
            hasExTargetError: false,
            isTargetRendered: false,
            isTargetPassed: true,
            isQuestRendered: true,
          });
        } else {
          console.log('error');
          alert('Oops! :(\n오류가 발생했습니다. 새로고침하여 테스트를 다시 불러와야 합니다.');
          window.location.assign(`${protocol}//${config.REACT_APP_PARTNER_URL}/project/${pId}/test/${tId}`);
        }
      } else if (isQuestRendered && hasQuestPassed()) {
        const submitCheck = window.confirm('테스트를 등록하시겠어요?\n등록 후엔 수정이 되지 않으니, 꼼꼼히 확인해 주세요:)');

        if (submitCheck && !hasDefaultError && !hasTargetError && !hasQuestError) {
          this.setState({ inPostTest: '테스트를 제출하고 있습니다' });
          const qId = test.quests.map(q => q.id);
          const {
            registerRequire,
            issue,
            issueDetail,
            issuePurpose,
          } = values.quest;
          const registerValue = registerRequire !== '아니오';
          const step = 'REGISTER';

          if (registerRequire) {
            await patchTest(
              tId,
              pId,
              step,
              titleReg,
              clientNameReg,
              clientContactReg,
              media2,
              emailReg,
              media1,
              serviceFormat,
              serviceInfoReg,
              serviceCategory,
              serviceStatus,
              serviceDesc,
              funnel,
              registerValue,
            );
          }

          if (issue[`q${qId[0]}`]) {
            await patchTest(
              tId,
              pId,
              step,
              titleReg,
              clientNameReg,
              clientContactReg,
              media2,
              emailReg,
              media1,
              serviceFormat,
              serviceInfoReg,
              serviceCategory,
              serviceStatus,
              serviceDesc,
              funnel,
              registerValue,
            );
            await patchQuest(
              qId[0],
              tId,
              issue[`q${qId[0]}`],
              issueDetail[`q${qId[0]}`].replace(/(^\s*)|(\s*$)/g, ''),
              issuePurpose[`q${qId[0]}`].replace(/(^\s*)|(\s*$)/g, ''),
            );
            await getTest(tId);
            togglePopup(true);
            this.setState({
              hasQuestError: false,
              isQuestRendered: false,
              isQuestPassed: true,
              isPayRendered: true,
              justRegistered: true,
              isRegisterInfoPopup: true,
            });
          }

          if (issue[`q${qId[1]}`]) {
            await patchTest(
              tId,
              pId,
              step,
              titleReg,
              clientNameReg,
              clientContactReg,
              media2,
              emailReg,
              media1,
              serviceFormat,
              serviceInfoReg,
              serviceCategory,
              serviceStatus,
              serviceDesc,
              funnel,
              registerValue,
            );
            await patchQuest(
              qId[1],
              tId,
              issue[`q${qId[1]}`],
              issueDetail[`q${qId[1]}`].replace(/(^\s*)|(\s*$)/g, ''),
              issuePurpose[`q${qId[1]}`].replace(/(^\s*)|(\s*$)/g, ''),
            );
            await getTest(tId);
            togglePopup(true);
            this.setState({
              hasQuestError: false,
              isQuestRendered: false,
              isQuestPassed: true,
              isPayRendered: true,
              justRegistered: true,
              isRegisterInfoPopup: true,
            });
          }

          if (issue[`q${qId[2]}`]) {
            await patchTest(
              tId,
              pId,
              step,
              titleReg,
              clientNameReg,
              clientContactReg,
              media2,
              emailReg,
              media1,
              serviceFormat,
              serviceInfoReg,
              serviceCategory,
              serviceStatus,
              serviceDesc,
              funnel,
              registerValue,
            );
            await patchQuest(
              qId[2],
              tId,
              issue[`q${qId[2]}`],
              issueDetail[`q${qId[2]}`].replace(/(^\s*)|(\s*$)/g, ''),
              issuePurpose[`q${qId[2]}`].replace(/(^\s*)|(\s*$)/g, ''),
            );
            await getTest(tId);
            togglePopup(true);
            this.setState({
              hasQuestError: false,
              isQuestRendered: false,
              isQuestPassed: true,
              isPayRendered: true,
              justRegistered: true,
              isRegisterInfoPopup: true,
            });
          }

          this.setState({ inPostTest: false });
        }
      } else if (isPayRendered && hasPayPassed) {
        const selectedPlan = planList.find(p => p.name === values.pay.plan);
        const cType = values.pay.coupon !== undefined ? values.pay.coupon : undefined;
        // eslint-disable-next-line no-nested-ternary
        const cCode = cType === 'WELCOME_BACK' || cType === undefined ? undefined : (values.pay.couponNum !== undefined ? values.pay.couponNum : undefined);

        const submitCheck = window.confirm('PLAN을 선택하셨나요?\n등록 후엔 수정이 되지 않으니, 꼼꼼히 확인해 주세요.');

        if (submitCheck) {
          this.setState({ isPayLoading: true });
          await orderTest(
            selectedPlan.id,
            tId,
            cType,
            cCode,
          ).then((res) => {
            this.setState(prevState => _.merge(prevState, {
              isPayLoading: false,
              isPayInfoPopup: true,
              isPayRendered: true,
              isPayPassed: true,
              test: {
                order: res.data,
              },
            }));
          })
            .catch((err) => {
              console.log(err);
              console.log(err.response);
              console.log(err.message);
              this.setState({
                isPayLoading: false,
                asyncErrorMsg: err.response.data.coupon_code,
              });
            });
        }
      }
    } else {
      this.setState({ inPostTest: true });
      const res = await postTest(
        pId,
        titleReg,
        clientNameReg,
        clientContactReg,
        media2,
        emailReg,
        media1,
        serviceFormat,
        serviceInfoReg,
        serviceCategory,
        serviceStatus,
        serviceDesc,
        funnel,
      );
      history.push(`/project/${match.params.pId}/test/${res.data.id}`);
      this.setState(prevState => _.merge(prevState, {
        test: { default: { step: res.data.step } },
      }));
      if (hasDefaultPassed()) {
        this.setState(prevState => _.merge(prevState, {
          inPostTest: false,
          isDefaultRendered: false,
          isDefaultPassed: true,
          isTargetRendered: true,
          test: {
            target: { id: res.data.targets[0].id },
            quests: [
              { id: res.data.quests[0].id },
              { id: res.data.quests[1].id },
              { id: res.data.quests[2].id },
            ],
          },
        }));
      } else if (hasTargetPassed) {
        this.setState(prevState => _.merge(prevState, {
          isTargetRendered: false,
          isTargetPassed: true,
          isQuestRendered: true,
          test: {
            target: { id: res.data.targets[0].id },
            quests: [
              { id: res.data.quests[0].id },
              { id: res.data.quests[1].id },
              { id: res.data.quests[2].id },
            ],
          },
        }));
      } else if (hasQuestPassed) {
        this.setState(prevState => _.merge(prevState, {
          isQuestRendered: false,
          isQuestPassed: true,
          isPayRendered: true,
          test: {
            target: { id: res.data.targets[0].id },
            quests: [
              { id: res.data.quests[0].id },
              { id: res.data.quests[1].id },
              { id: res.data.quests[2].id },
            ],
          },
        }));
      } else if (hasPayPassed) {
        this.setState(prevState => _.merge(prevState, {
          isPayRendered: true,
          isPayPassed: true,
          isAllRendered: false,
          test: {
            target: { id: res.data.targets[0].id },
            quests: [
              { id: res.data.quests[0].id },
              { id: res.data.quests[1].id },
              { id: res.data.quests[2].id },
            ],
          },
        }));
      }
    }

    return null;
  };

  render() {
    const {
      isLeader,
      isLoading,
      isPayLoading,
      isBackConfirmPopup,
      isRegisterInfoPopup,
      isPayInfoPopup,
      isDefaultRendered,
      isTargetRendered,
      isQuestRendered,
      isPayRendered,
      isAllRendered,
      isReportRendered,
      isDefaultPassed,
      isTargetPassed,
      isQuestPassed,
      isPayPassed,
      isAllPassed,
      isCompleteStep,
      isTestStep,
      isBlurSaved,
      test,
      asyncErrorMsg,
      hasDefaultError,
      hasTargetError,
      hasExTargetError,
      justRegistered,
      shouldBlockNavigation,
      inPostTest,
      inSaving,
    } = this.state;
    const {
      route,
      change,
      fieldsValues,
      fieldsMeta,
      submitFailed,
      submitSucceeded,
      handleSubmit,
      categoryList,
      extras,
      isOpen,
      invalid,
    } = this.props;
    const {
      goBack,
      handleBackBtn,
      handleCancleBtn,
      handleFormRender,
      handleBlurSave,
      getTime,
      onSubmit,
    } = this;
    const { tId } = route.match.params;
    const step = test.default !== undefined && Object.keys(test.default).length > 0
      ? test.default.step.toLowerCase() : undefined;
    const tgId = test.target ? test.target.id : undefined;
    // eslint-disable-next-line no-nested-ternary
    const qId = test.quests
      ? test.quests.map(q => q.id)
      : (fieldsValues && fieldsValues !== undefined
        ? Object.keys(fieldsValues.quest.issue).map(q => q.slice(1))
        : [1, 2, 3]);
    const isNoNamed = fieldsValues === undefined ? true : (fieldsValues.title === undefined || fieldsValues.title === '');
    const isSpacedTitle = fieldsValues === undefined ? true : (fieldsValues.title === undefined || fieldsValues.title.replace(/(^\s*)|(\s*$)/g, '').length < 1);
    const categoryListArr = Object.keys(categoryList).length > 0
      ? Object.keys(categoryList).map(c => categoryList[c].category_items)
      : undefined;
    const media1Category = categoryListArr !== undefined ? categoryListArr[3].map(c => c.name) : [];
    const media2Category = categoryListArr !== undefined ? categoryListArr[4].map(c => c.name) : [];
    const service1Category = categoryListArr !== undefined
      ? categoryListArr[1].map(c => c.name)
      : [];
    const service2Category = categoryListArr !== undefined
      ? categoryListArr[2].map(c => c.name)
      : [];
    const funnelCategory = categoryListArr !== undefined ? categoryListArr[5].map(c => c.name) : [];
    const extraInfoCategory = categoryListArr !== undefined
      ? categoryListArr[6].map(c => c.name)
      : [];
    const issueCategory = categoryListArr !== undefined ? categoryListArr[7].map(c => c.name) : [];
    const issueCategory2 = categoryListArr !== undefined ? categoryListArr[7] : [];
    const hasIssueValues = fieldsValues && fieldsValues !== undefined
      ? fieldsValues.quest.issue : undefined;
    const hasIssue1Value = hasIssueValues !== undefined ? hasIssueValues[`q${qId[0]}`] : undefined;
    const hasIssue2Value = hasIssueValues !== undefined ? hasIssueValues[`q${qId[1]}`] : undefined;
    const hasIssue3Value = hasIssueValues !== undefined ? hasIssueValues[`q${qId[2]}`] : undefined;
    const hasReport = test !== undefined ? test.report_url : undefined;
    const nav = [
      {
        title: '기본 정보',
        class: `default${isDefaultRendered ? '--active' : ''}`,
      },
      {
        title: '타겟 설정',
        class: `target${isTargetRendered ? '--active' : ''}`,
      },
      {
        title: '문제점&가설입력',
        class: `quest${isQuestRendered ? '--active' : ''}`,
        subnav: ['문제점 1', '문제점 2', '문제점 3'],
      },
      {
        title: '테스트 결제',
        class: `pay${isPayRendered ? '--active' : ''}`,
      },
      {
        title: '결과 리포트',
        class: `report${isReportRendered ? '--active' : ''}`,
      },
    ];

    return (
      isLoading ? <LoadingIndicator /> : (
        <form className="contents__form">
          <Prompt
            when={shouldBlockNavigation && !!tId}
            message="떠나시겠습니까? 변경사항이 저장되지 않을 수 있습니다."
          />
          { inPostTest && (
            <div style={{
              position: 'absolute',
              zIndex: 500,
              background: 'rgba(0, 0, 0, 0.2)',
              width: '100%',
              height: '100%',
            }}
            >
              <LoadingIndicator />
              <span style={{
                position: 'absolute',
                width: '300px',
                height: '100px',
                top: '50%',
                left: '50%',
                margin: '50px 0 0 -130px',
                textAlign: 'center',
                color: 'black',
                fontWeight: 'bold',
              }}
              >
                { inPostTest }
              </span>
            </div>
          )}
          <div className="form__nav">
            <span className="box-btn">
              <button type="button" className="btn-back" onClick={() => handleBackBtn()}>뒤로 가기</button>
            </span>
            <nav className="nav">
              <ol className="nav-list">
                {nav.map((n, idx) => (
                  idx === 2
                    ? (
                      <li className={`nav-list__item--quest${isQuestRendered ? '--active' : ''}`} key={n.title}>
                        <button
                          className="btn-nav"
                          type="button"
                          onClick={() => handleFormRender(idx)}
                          disabled={idx === 4 && (!isCompleteStep && !isTestStep)}
                        >
                          {n.title}
                        </button>
                        {((hasIssue1Value || hasIssue2Value || hasIssue3Value)
                          && isQuestRendered)
                          || (isDefaultRendered && isTargetPassed)
                          || (isTargetRendered && isTargetPassed)
                          || (isTargetRendered
                            && (hasIssue1Value || hasIssue2Value || hasIssue3Value))
                          || (isQuestRendered && isTargetPassed
                            && (hasIssue1Value || hasIssue2Value || hasIssue3Value))
                          || (isPayRendered && isQuestPassed
                            && (hasIssue1Value || hasIssue2Value || hasIssue3Value))
                          || (isPayRendered && isTargetPassed
                            && (hasIssue1Value || hasIssue2Value || hasIssue3Value))
                          || (isPayRendered && isPayPassed
                            && (hasIssue1Value || hasIssue2Value || hasIssue3Value))
                          || isQuestPassed
                          || isPayPassed
                          || isAllPassed
                          || isAllRendered
                          ? (
                            <>
                              {hasIssue1Value || hasIssue2Value || hasIssue3Value
                                ? (
                                  <ol className="nav-sub">
                                    <li className={`sub__item${hasIssue1Value ? '--active' : ''}`}>{n.subnav[0]}</li>
                                    <li className={`sub__item${hasIssue2Value ? '--active' : ''}`}>{n.subnav[1]}</li>
                                    <li className={`sub__item${hasIssue3Value ? '--active' : ''}`}>{n.subnav[2]}</li>
                                  </ol>
                                )
                                : (
                                  <div className="item-info">
                                    어떤 가설을
                                    <br />
                                    검증할까요?
                                  </div>
                                )
                              }
                            </>
                          )
                          : (
                            <div className="item-info">
                              어떤 가설을
                              <br />
                              검증할까요?
                            </div>
                          )
                        }
                      </li>
                    )
                    : (
                      <li className={`nav-list__item--${n.class}`} key={n.title}>
                        <button
                          className="btn-nav"
                          type="button"
                          onClick={() => handleFormRender(idx)}
                          disabled={idx === 4 && (!isCompleteStep && !isTestStep)}
                        >
                          {n.title}
                        </button>
                      </li>
                    )
                ))}
              </ol>
            </nav>
          </div>
          <div className={`form__field${isReportRendered ? ' form__report' : ''}`}>
            <Field
              type="text"
              name="title"
              placeholder="Untitled"
              component="input"
              maxLength="22"
              ref={(ref) => { this.titleInput = ref; }}
              forwardRef
              disabled={isAllPassed}
            />
            { isDefaultRendered
              ? (
                <>
                  { step === 'register'
                  || step === 'payment'
                  || step === 'testing'
                  || step === 'completed'
                    ? <DisabledLayer />
                    : null}
                  <FormSection name="default">
                    <TestFormDefault
                      isDisabled={isNoNamed || isSpacedTitle
                        || (isDefaultPassed
                        && isTargetPassed
                        && isQuestPassed
                        && isPayPassed)
                        || justRegistered
                        || isAllPassed
                        || (isQuestPassed && step === 'register')
                        || step === 'payment'
                        || step === 'testing'
                        || step === 'completed'
                        || !isLeader
                      }
                      test={test}
                      handleBlurSave={handleBlurSave}
                      media1Category={media1Category}
                      media2Category={media2Category}
                      service1Category={service1Category}
                      service2Category={service2Category}
                      funnelCategory={funnelCategory}
                    />
                  </FormSection>
                </>
              )
              : null
            }
            { isTargetRendered
              ? (
                <>
                  { !isDefaultPassed
                  || step === 'register'
                  || step === 'payment'
                  || step === 'testing'
                  || step === 'completed'
                  || hasDefaultError
                    ? <DisabledLayer />
                    : null}
                  { !isDefaultPassed ? (
                    <ToastAlert
                      title="아직은 작성하실 수 없어요!"
                      subtitle="이전 단계 진행 후 작성하실 수 있습니다"
                      isShow
                    />
                  ) : null}
                  { hasDefaultError ? (
                    <ToastAlert
                      title="기본 정보 탭을 확인해 주세요"
                      subtitle="이전 단계에서 정확하지 않은 정보가 있어요!"
                      isShow
                    />
                  ) : null}
                  <FormSection name="target">
                    <TestFormTarget
                      isDisabled={isNoNamed || isSpacedTitle
                          || (isDefaultPassed
                          && isTargetPassed
                          && isQuestPassed
                          && isPayPassed)
                          || justRegistered
                          || isAllPassed
                          || (isQuestPassed && step === 'register')
                          || step === 'payment'
                          || step === 'testing'
                          || step === 'completed'
                          || !isLeader
                        }
                      tgId={tgId}
                      onChange={change}
                      extraInfoCategory={extraInfoCategory}
                      extraValue={extras}
                      fieldsValues={fieldsValues}
                      handleBlurSave={handleBlurSave}
                    />
                  </FormSection>
                </>
              )
              : null
            }
            { isQuestRendered
              ? (
                <>
                  { !isTargetPassed
                  || step === 'register'
                  || step === 'payment'
                  || step === 'testing'
                  || step === 'completed'
                  || hasDefaultError
                  || hasTargetError
                  || hasExTargetError
                    ? <DisabledLayer />
                    : null}
                  { !isTargetPassed ? (
                    <ToastAlert
                      title="아직은 작성하실 수 없어요!"
                      subtitle="이전 단계 진행 후 작성하실 수 있습니다"
                      isShow
                    />
                  ) : null}
                  { hasTargetError || hasExTargetError ? (
                    <ToastAlert
                      title="타겟 설정 탭을 확인해 주세요"
                      subtitle="이전 단계에서 정확하지 않은 정보가 있어요!"
                      isShow
                    />
                  ) : null }
                  { hasDefaultError ? (
                    <ToastAlert
                      title="기본 정보 탭을 확인해 주세요"
                      subtitle="이전 단계에서 정확하지 않은 정보가 있어요!"
                      isShow
                    />
                  ) : null }
                  <FormSection name="quest">
                    <TestFormQuest
                      isDisabled={isNoNamed || isSpacedTitle
                        || (isDefaultPassed
                        && isTargetPassed
                        && isQuestPassed
                        && isPayPassed)
                        || justRegistered
                        || isAllPassed
                        || (isQuestPassed && step === 'register')
                        || step === 'payment'
                        || step === 'testing'
                        || step === 'completed'
                        || !isLeader
                      }
                      qId={qId}
                      issueCategory={issueCategory}
                      issueCategory2={issueCategory2}
                      fieldsValues={fieldsValues}
                      handleBlurSave={handleBlurSave}
                    />
                  </FormSection>
                </>
              )
              : null
            }
            { isPayRendered
              ? (
                <>
                  {/* { isQuestPassed && step !== 'register' ? null : <DisabledLayer />} */}
                  { !isQuestPassed
                    || (step === 'register' || step === 'testing' || step === 'completed')
                    ? <DisabledLayer />
                    : null}
                  { justRegistered || step === 'register' ? (
                    <ToastAlert
                      title="테스트가 신청되었습니다!"
                      subtitle="매니저 검토 후 이후 진행이 가능합니다:)"
                      isShow
                    />
                  )
                    : null }
                  { !isQuestPassed && step === 'apply' ? (
                    <ToastAlert
                      title="아직은 작성하실 수 없어요!"
                      subtitle="이전 단계 진행 후 작성하실 수 있습니다"
                      isShow
                    />
                  ) : null }
                  { isPayPassed
                    ? (
                      <>
                        {(
                          <FormSection name="pay">
                            <TestFormPay
                              isDisabled={isNoNamed || isSpacedTitle
                                  || (isDefaultPassed
                                  && isTargetPassed
                                  && isQuestPassed
                                  && isPayPassed)
                                  || justRegistered
                                  || isAllPassed
                                  || !isQuestPassed
                                  || step === undefined
                                  || step === 'payment'
                                  || step === 'testing'
                                  || step === 'completed'
                                  || !isLeader
                                }
                              testId={tId}
                              extraValues={extras}
                              extraInfoCategory={extraInfoCategory}
                              isRegisterReq={fieldsValues !== undefined && fieldsValues.quest !== undefined ? fieldsValues.quest.registerRequire : '아니오'}
                            />
                          </FormSection>
                          )
                        }
                      </>
                    )
                    : (
                      <>
                        {isPayLoading ? (
                          <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            zIndex: 500,
                            background: 'rgba(0, 0, 0, 0.2)',
                            width: '100%',
                            height: '100%',
                          }}
                          >
                            <LoadingIndicator />
                            <span style={{
                              position: 'absolute',
                              width: '300px',
                              height: '100px',
                              top: '50%',
                              left: '50%',
                              margin: '50px 0 0 -130px',
                              textAlign: 'center',
                              color: 'black',
                              fontWeight: 'bold',
                            }}
                            >
                              결제 정보를 작성하고 있습니다
                            </span>
                          </div>
                        ) : null}
                        <FormSection name="pay">
                          <TestFormPay
                            isDisabled={isNoNamed || isSpacedTitle
                              || (isDefaultPassed
                              && isTargetPassed
                              && isQuestPassed
                              && isPayPassed)
                              || justRegistered
                              || isAllPassed
                              || step === undefined
                              || (isQuestPassed && step === 'register')
                              || step === 'apply'
                              || step === 'testing'
                              || step === 'completed'
                              || !isLeader
                            }
                            testId={tId}
                            extraValues={extras}
                            extraInfoCategory={extraInfoCategory}
                            isRegisterReq={fieldsValues !== undefined && fieldsValues.quest !== undefined ? fieldsValues.quest.registerRequire : '아니오'}
                            submitErrorMsg={asyncErrorMsg}
                            handleBlurSave={handleBlurSave}
                          />
                        </FormSection>
                      </>
                    )
                  }
                </>
              )
              : null
            }
            { isReportRendered
              ? (
                <>
                  {isCompleteStep
                    ? <TestFormReport report={hasReport} />
                    : (
                      <div className="field-wrapper--testing">
                        데이터 수집중입니다.
                        <br />
                        며칠만 말미를 주시면 어떻게든 결과를 보여주겠읍니다.
                        <br />
                        딩가딩가 으쌰라 으쌰 에오에오
                      </div>
                    )
                  }
                </>
              )
              : null
            }
            <span className={`box-alert--autosave${isBlurSaved ? '--active' : ''}`}>
              { `Last Checkpoint: ${getTime()} (autosaved)` }
            </span>
          </div>
          <RightSidebar
            test={test}
            step={step}
            submitErrorMsg={asyncErrorMsg}
            isDisabled={isNoNamed || isSpacedTitle || !isLeader}
            isDefaultRendered={isDefaultRendered}
            isTargetRendered={isTargetRendered}
            isQuestRendered={isQuestRendered}
            isPayRendered={isPayRendered}
            isReportRendered={isReportRendered}
            isAllRendered={isAllRendered}
            isDefaultPassed={isDefaultPassed}
            isTargetPassed={isTargetPassed}
            isQuestPassed={isQuestPassed}
            isPayPassed={isPayPassed}
            isCompleteStep={isCompleteStep}
            isTestStep={isTestStep}
            justRegistered={justRegistered}
            isAllPassed={isAllPassed}
            fieldsMeta={fieldsMeta}
            fieldsValues={fieldsValues}
            submitFailed={submitFailed}
            invalid={invalid}
            submitSucceeded={submitSucceeded}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            handleBlurSave={handleBlurSave}
          />
          {/* 생성된 테스트 페이지 수정 시에도 안 보이게 하려면 아래 주석 삭제 */}
          {/* { isNoNamed && tId === undefined */}
          { isNoNamed || isSpacedTitle
            ? (
              <div className="layer--guide">
                <i className={`layer__bubble${isNoNamed || isSpacedTitle ? '--active' : ''}`}>테스트명을 입력해주세요</i>
              </div>
            )
            : null
          }
          {isBackConfirmPopup
            ? (
              <PopupTemplate isShow={isBackConfirmPopup} title="테스트 목록으로 이동하시겠어요?">
                <p className="contents__back">
                  [확인]을 누르시면 테스트 목록으로 이동합니다.
                </p>
                <div className="box-btn" style={{ paddingTop: '100px' }}>
                  <button type="button" className="btn-cancle" onClick={e => handleCancleBtn(e)}>취소</button>
                  <button type="button" className="btn-confirm" onClick={e => goBack(e)}>확인</button>
                </div>
              </PopupTemplate>
            )
            : null
          }
          {isPayInfoPopup && test.order
            ? (
              <PopupTemplate isShow={isPayInfoPopup}>
                <PayAccountInfo
                  testOrder={test.order}
                  submit={() => this.setState({
                    isPayInfoPopup: false,
                    isAllRendered: false,
                  })}
                />
              </PopupTemplate>
            )
            : null
          }
          {isRegisterInfoPopup
            ? (
              <PopupTemplate isShow={isOpen} title="테스트 신청이 완료되었습니다">
                <p className="contents__register">
                  <strong className="contents__subtitle">리얼답 매니저가 입력하신 정보를 검토한 후, 테스트 결제를 도와드립니다.</strong>
                  Test 신청 정보에 따라 테스트를 설계하기 때문에,
                  <br />
                  정보 수정 혹은 확인이 필요할 수 있습니다.
                  <br />
                  결제는 테스트 설계가 끝난 후 진행됩니다.
                  <br />
                  궁금하신 내용이 있다면 언제든지 문의해주세요!
                </p>
                <div className="box-btn">
                  <button type="button" className="btn-cancle" onClick={e => goBack(e)}>테스트 목록으로 이동</button>
                  <button type="button" className="btn-confirm" onClick={e => handleCancleBtn(e)}>닫기</button>
                </div>
              </PopupTemplate>
            )
            : null
          }
        </form>
      )
    );
  }
}

const mapStateToProps = (state) => {
  const { isOpen } = state.popup;
  const { test } = state.test;
  const { target } = state.target;
  const { extras } = state.target.target;
  const { quests } = state.test.quests;
  const { categoryList } = state.category;
  const { planList } = state.plan;
  const { order } = state.test.test;
  const titleValue = test.title ? test.title : undefined;
  const media1Value = test.media_category_1 ? test.media_category_1 : undefined;
  const media2Value = test.media_category_2 ? test.media_category_2 : undefined;
  const serviceInfoValue = test.service_extra_info ? test.service_extra_info : undefined;
  const serviceCategoryValue = test.service_category ? test.service_category : undefined;
  const serviceFormatValue = test.service_format ? test.service_format : undefined;
  const serviceDescValue = test.service_description ? test.service_description : undefined;
  const serviceStatusValue = test.service_status ? test.service_status : undefined;
  const clientNameValue = test.client_name ? test.client_name : undefined;
  const clientContactValue = test.client_phone_number ? test.client_phone_number : undefined;
  const emailValue = test.client_email ? test.client_email : undefined;
  const funnelValue = test.funnel ? test.funnel : undefined;
  const minAgeValue = target !== undefined ? target.age_minimum : undefined;
  const maxAgeValue = target !== undefined ? target.age_maximum : undefined;
  const getGenderValue = target !== undefined && target.gender !== null ? target.gender : undefined;
  const tagValue = target !== undefined ? target.tags : undefined;
  // eslint-disable-next-line no-nested-ternary
  const setGenderValue = getGenderValue !== undefined && getGenderValue !== '' ? (getGenderValue === 'female' ? '여자' : (getGenderValue === 'male' ? '남자' : '무관')) : undefined;
  const getExtraInfo1Value = extras !== undefined && extras !== []
    ? extras.sort((a, b) => a.id - b.id)[0] : undefined;
  const getExtraInfo2Value = extras !== undefined && extras !== []
    ? extras.sort((a, b) => a.id - b.id)[1] : undefined;
  const getExtraInfo3Value = extras !== undefined && extras !== []
    ? extras.sort((a, b) => a.id - b.id)[2] : undefined;
  const extraInfoCategory1 = getExtraInfo1Value !== undefined ? getExtraInfo1Value.name : undefined;
  const extraInfoCategory2 = getExtraInfo2Value !== undefined ? getExtraInfo2Value.name : undefined;
  const extraInfoCategory3 = getExtraInfo3Value !== undefined ? getExtraInfo3Value.name : undefined;
  const extraInfoDesc1 = getExtraInfo1Value !== undefined ? getExtraInfo1Value.value : undefined;
  const extraInfoDesc2 = getExtraInfo2Value !== undefined ? getExtraInfo2Value.value : undefined;
  const extraInfoDesc3 = getExtraInfo3Value !== undefined ? getExtraInfo3Value.value : undefined;
  const registerRequire = (test !== undefined && test.is_register_required !== null)
    ? test.is_register_required : undefined;
  // eslint-disable-next-line no-nested-ternary
  const registerValue = registerRequire !== undefined ? (registerRequire !== false ? '네(+3,000원/명)' : '아니오') : undefined;
  const issue1qId = quests !== undefined ? quests[0].id : '';
  const issue2qId = quests !== undefined ? quests[1].id : '';
  const issue3qId = quests !== undefined ? quests[2].id : '';
  const issue1Value = quests !== undefined && quests[0].issue !== '' ? quests[0].issue : undefined;
  const issue2Value = quests !== undefined && quests[1].issue !== '' ? quests[1].issue : undefined;
  const issue3Value = quests !== undefined && quests[2].issue !== '' ? quests[2].issue : undefined;
  const issueDetail1Value = quests !== undefined && quests[0].issue_detail !== '' ? quests[0].issue_detail : undefined;
  const issueDetail2Value = quests !== undefined && quests[1].issue_detail !== '' ? quests[1].issue_detail : undefined;
  const issueDetail3Value = quests !== undefined && quests[2].issue_detail !== '' ? quests[2].issue_detail : undefined;
  const issueissuePurpose1Value = quests !== undefined && quests[0].issue_purpose !== '' ? quests[0].issue_purpose : undefined;
  const issueissuePurpose2Value = quests !== undefined && quests[1].issue_purpose !== '' ? quests[1].issue_purpose : undefined;
  const issueissuePurpose3Value = quests !== undefined && quests[2].issue_purpose !== '' ? quests[2].issue_purpose : undefined;
  const planValue = order !== null && order !== undefined && order.plan !== undefined
    ? order.plan.name : 'PLAN 01';
  const codeValue = order !== null && order !== undefined && order.coupon_type !== null
    ? order.coupon_type : undefined;
  const orderId = order !== null && order !== undefined ? order.id : undefined;
  const couponNumValue = order !== null && order !== undefined && order.coupon !== null
    ? order.coupon.code : undefined;

  const initData = {
    title: titleValue,
    default: {
      clientName: clientNameValue,
      clientContact: clientContactValue,
      media2: media2Value,
      email: emailValue,
      media1: media1Value,
      serviceFormat: serviceFormatValue,
      serviceInfo: serviceInfoValue,
      serviceCategory: serviceCategoryValue,
      serviceStatus: serviceStatusValue,
      serviceDesc: serviceDescValue,
      funnel: funnelValue,
    },
    target: {
      minAge: minAgeValue,
      maxAge: maxAgeValue,
      gender: setGenderValue,
      extraInfoCategory1,
      extraInfoCategory2,
      extraInfoCategory3,
      extraInfoDesc1,
      extraInfoDesc2,
      extraInfoDesc3,
      interest: tagValue,
    },
    quest: {
      registerRequire: registerValue,
      issue: {
        [`q${issue1qId}`]: issue1Value,
        [`q${issue2qId}`]: issue2Value,
        [`q${issue3qId}`]: issue3Value,
      },
      issueDetail: {
        [`q${issue1qId}`]: issueDetail1Value,
        [`q${issue2qId}`]: issueDetail2Value,
        [`q${issue3qId}`]: issueDetail3Value,
      },
      issuePurpose: {
        [`q${issue1qId}`]: issueissuePurpose1Value,
        [`q${issue2qId}`]: issueissuePurpose2Value,
        [`q${issue3qId}`]: issueissuePurpose3Value,
      },
    },
    pay: {
      plan: planValue,
      coupon: codeValue,
      couponNum: couponNumValue,
    },
  };

  return ({
    fieldsValues: getFormValues('testForm')(state),
    fieldsMeta: getFormMeta('testForm')(state),
    fieldError: getFormSyncErrors('testForm')(state),
    isOpen,
    test,
    target,
    extras,
    quests,
    order,
    orderId,
    categoryList,
    planList,
    initialValues: initData,
  });
};
const mapDispatchToProps = dispatch => ({
  togglePopup: isOpen => dispatch(togglePopup(isOpen)),
  getAuthSelf: () => dispatch(getAuthSelf()),
  getProject: id => dispatch(getProject(id)),
  postTest: (
    id,
    step,
    title,
    clientName,
    clientContact,
    media2,
    email,
    media1,
    serviceFormat,
    serviceInfo,
    serviceCategory,
    serviceStatus,
    serviceDesc,
    funnel,
  ) => dispatch(postTest(
    id,
    step,
    title,
    clientName,
    clientContact,
    media2,
    email,
    media1,
    serviceFormat,
    serviceInfo,
    serviceCategory,
    serviceStatus,
    serviceDesc,
    funnel,
  )),
  getTest: tId => dispatch(getTest(tId)),
  setTestInit: () => dispatch(setTestInit()),
  patchTest: (
    tId,
    pId,
    step,
    title,
    clientName,
    clientContact,
    media2,
    email,
    media1,
    serviceFormat,
    serviceInfo,
    serviceCategory,
    serviceStatus,
    serviceDesc,
    funnel,
    registerValue,
  ) => dispatch(patchTest(
    tId,
    pId,
    step,
    title,
    clientName,
    clientContact,
    media2,
    email,
    media1,
    serviceFormat,
    serviceInfo,
    serviceCategory,
    serviceStatus,
    serviceDesc,
    funnel,
    registerValue,
  )),
  getTarget: tId => dispatch(getTarget(tId)),
  postTargetExtra: (tgId, cId, cValue) => dispatch(postTargetExtra(tgId, cId, cValue)),
  patchTargetExtra: (
    tgEx1Id,
    tgId,
    exCate1Id,
    extraInfoDesc1,
  ) => dispatch(patchTargetExtra(
    tgEx1Id,
    tgId,
    exCate1Id,
    extraInfoDesc1,
  )),
  patchTarget: (
    tgId,
    tId,
    gender,
    minAge,
    maxAge,
    tags,
  ) => dispatch(patchTarget(
    tgId,
    tId,
    gender,
    minAge,
    maxAge,
    tags,
  )),
  patchQuest: (
    qId,
    tId,
    issue,
    issueDetail,
    issuePurpose,
  ) => dispatch(patchQuest(
    qId,
    tId,
    issue,
    issueDetail,
    issuePurpose,
  )),
  getCategories: () => dispatch(getCategories()),
  getPlanList: () => dispatch(getPlanList()),
  orderTest: (
    pId,
    tId,
    cType,
    cCode,
  ) => dispatch(orderTest(
    pId,
    tId,
    cType,
    cCode,
  )),
  getTestOrder: oId => dispatch(getTestOrder(oId)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(reduxForm({
  form: 'testForm',
  enableReinitialize: true,
  validate,
  onSubmitFail: (errors, dispatch, submitError) => {
    console.log(errors);
    console.log(submitError);
  },
})(NewTestForm));
