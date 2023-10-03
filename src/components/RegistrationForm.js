import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { FormGroup, Label, Button } from 'reactstrap';
import { object, string, boolean, number } from 'yup';
import classnames from 'classnames';
import axios from 'axios';
import isBefore from 'date-fns/isBefore';
import isAfter from 'date-fns/isAfter';
import format from 'date-fns/format';
import { countries, countryCodes, isAfrica } from '../lib/countries';

const FORM_NAME = 'registration';
const CURRENCY = '€'; // EUR
const DEFAULT_PAYMENT_METHOD = 'mollie';

const payment_methods = [
  { name: 'Credit or debit card', method: DEFAULT_PAYMENT_METHOD },
  { name: 'Direct Bank transfer', method: 'bank_transfer' },
  { name: 'Mobile money transfer', method: 'mobile_money_transfer' },
];

let paymentSchema = object({
  first_name: string().required(),
  last_name: string().required(),
  email: string().email().required(),
  address: string().required(),
  city: string().required(),
  post_code: string().required(),
  country: string().oneOf(countryCodes).required(),
  terms: boolean()
    .oneOf([true], 'You must read and accept the Participants Agreement')
    .required(),
  can_pay: boolean().required(),
  slided_price: number().optional(),
  scholarship_support: boolean().required(),
  payment_method: string()
    .oneOf(payment_methods.map((t) => t.method))
    .optional(),
});

const initialValues = {
  first_name: '',
  last_name: '',
  email: '',
  address: '',
  city: '',
  post_code: '',
  country: '',
  terms: false,
  can_pay: true,
  slided_price: 0,
  payment_method: DEFAULT_PAYMENT_METHOD,
  scholarship_support: false,
};

export default function RegistrationForm({
  terms_url,
  order_item,
  onSubmit,
  tiers,
  sliding_scale,
  scholarship_info,
  payment_options,
}) {
  const [isAfricanCountry, setIsAfricanCountry] = useState(false);
  const [pricingField, setPricingField] = useState('price');
  const onCountrySelect = (c) => {
    const _isAfrica = isAfrica(c);
    if (_isAfrica) {
      setPricingField('parity_price');
    } else setPricingField('price');
    setIsAfricanCountry(_isAfrica);
  };

  const slidingRange = createNumberArray(
    parseInt(sliding_scale.min, 10),
    parseInt(sliding_scale.max, 10),
    parseInt(sliding_scale.step, 10),
  );

  const _tiers = tiers.map((t) => {
    const is_after = isAfter(new Date(), new Date(t.start_date));
    const is_before = isBefore(new Date(), new Date(t.end_date));
    const has_passed = isBefore(new Date(t.end_date), new Date());
    const is_in_future = isAfter(new Date(t.start_date), new Date());
    return {
      ...t,
      isActive: is_after && is_before,
      displayDate: has_passed
        ? `Until ${format(new Date(t.end_date), 'dd MMM yyyy')}`
        : is_in_future
        ? `From ${format(new Date(t.start_date), 'dd MMM yyyy')}`
        : `Until ${format(new Date(t.end_date), 'dd MMM yyyy')}`, // present
    };
  });

  const [activeTier] = _tiers.filter((t) => t.isActive);

  const handleSubmit = async (values, { setSubmitting }) => {
    // @todo: calculate total price, consider sliding scale and donation amount
    const totalPrice = activeTier[pricingField];

    const formData = {
      ...values,
      price: totalPrice,
      order_item: `${order_item} - ${activeTier.title}`,
      'form-name': FORM_NAME,
    };

    // skip for development or if last name is testing
    if (
      process.env.NODE_ENV !== 'development' &&
      !values.last_name.toLowerCase().includes('testing')
    ) {
      await axios.post('/', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
    } else {
      console.log(formData);
    }

    // if not bank_transfer or mobile_money_transfer create order
    // const { data } = await axios.post('/api/create_order', formData);
    // alert(JSON.stringify(data, null, 2));
    // redirect user to data.paymentUrl

    setSubmitting(false);
    onSubmit(formData);
  };

  return (
    <>
      <div className="d-flex gap-3 my-4 justify-content-center">
        {_tiers.map((t) => (
          <div
            key={t.price}
            className={classnames('p-4 rounded', {
              'border-success border': t.isActive,
              'border-secondary-subtle text-body-tertiary': !t.isActive,
            })}>
            <strong>{t.title}</strong> <br />
            <span className={classnames('lead', { 'fw-bold': t.isActive })}>
              {t[pricingField]}
            </span>{' '}
            <br />
            <small className="text-body-tertiary">{t.displayDate}</small>
          </div>
        ))}
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={paymentSchema}
        onSubmit={handleSubmit}>
        {({
          isSubmitting,
          errors,
          touched,
          isValid,
          setFieldTouched,
          setFieldValue,
          values: { can_pay, payment_method, scholarship_support },
        }) => (
          <Form
            method="post"
            className="row"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
            name={FORM_NAME}>
            {/* The `form-name` hidden field is required to support form submissions without JavaScript */}
            <input type="hidden" name="form-name" value={FORM_NAME} />
            <div className="col-md-6">
              <FormGroup floating>
                <Field
                  placeholder="First Name"
                  name="first_name"
                  className={classnames('form-control', {
                    'is-invalid': errors.first_name && touched.first_name,
                  })}
                />
                <Label for="first_name">First name</Label>
              </FormGroup>
            </div>

            <div className="col-md-6">
              <FormGroup floating>
                <Field
                  placeholder="Last Name"
                  name="last_name"
                  className={classnames('form-control', {
                    'is-invalid': errors.last_name && touched.last_name,
                  })}
                />
                <Label for="last_name">Last name</Label>
              </FormGroup>
            </div>

            <div className="col-12">
              <FormGroup floating>
                <Field
                  placeholder="Email"
                  type="email"
                  name="email"
                  className={classnames('form-control', {
                    'is-invalid': errors.email && touched.email,
                  })}
                />
                <Label for="email">Email</Label>
              </FormGroup>
            </div>

            <div className="col-md-6">
              <FormGroup floating>
                <Field
                  placeholder="Address"
                  type="text"
                  name="address"
                  className={classnames('form-control', {
                    'is-invalid': errors.address && touched.address,
                  })}
                />
                <Label for="address">Address</Label>
              </FormGroup>
            </div>

            <div className="col-md-6">
              <FormGroup floating>
                <Field
                  placeholder="City"
                  name="city"
                  className={classnames('form-control', {
                    'is-invalid': errors.city && touched.city,
                  })}
                />
                <Label for="city">City</Label>
              </FormGroup>
            </div>

            <div className="col-md-6">
              <FormGroup floating>
                <Field
                  placeholder="Post code"
                  name="post_code"
                  className={classnames('form-control', {
                    'is-invalid': errors.post_code && touched.post_code,
                  })}
                />
                <Label for="post_code">Post code</Label>
              </FormGroup>
            </div>

            <div className="col-md-6">
              <FormGroup floating>
                <Field
                  placeholder="Country"
                  as="select"
                  name="country"
                  onChange={(e) => {
                    const code = e.target.value;
                    setFieldTouched('country', true);
                    setFieldValue('country', code);
                    setFieldValue('can_pay', true);
                    setFieldValue('scholarship_support', false);
                    if (isAfrica(code)) {
                      setFieldValue(
                        'slided_price',
                        slidingRange[slidingRange.length - 1].toString(),
                      );
                    } else setFieldValue('slided_price', 0);
                    onCountrySelect(code);
                  }}
                  className={classnames('form-control', {
                    'is-invalid': errors.country && touched.country,
                  })}>
                  <option>-- Please select --</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </Field>
                <Label for="country">Country</Label>
              </FormGroup>
            </div>

            <div className="col-12">
              <FormGroup check>
                <Field
                  type="checkbox"
                  name="can_pay"
                  id="can_pay"
                  className="form-check-input"
                />{' '}
                <Label for="can_pay">
                  Yes, I can pay {activeTier[pricingField]}
                </Label>
              </FormGroup>
            </div>

            {isAfricanCountry && (
              <>
                {!can_pay && (
                  <div className="my-2">
                    <strong>Sliding scale pricing</strong>
                    <p>{sliding_scale.intro}</p>
                    <div className="col-12">
                      {slidingRange.map((n) => (
                        <FormGroup check inline key={n}>
                          <Field
                            type="radio"
                            name="slided_price"
                            value={n.toString()}
                            className="form-check-input"
                            id={`slided_price_${n}`}
                          />
                          <Label for={`slided_price_${n}`}>
                            {n}
                            {CURRENCY}
                          </Label>
                        </FormGroup>
                      ))}
                    </div>
                  </div>
                )}

                <div className="col-12">
                  <FormGroup floating>
                    <Field
                      placeholder="Payment method"
                      as="select"
                      name="payment_method"
                      className="form-control">
                      {payment_methods.map((t) => (
                        <option value={t.method} key={t.method}>
                          {t.name}
                        </option>
                      ))}
                    </Field>
                    <Label for="payment_method">Payment method</Label>
                  </FormGroup>
                </div>

                {payment_method !== DEFAULT_PAYMENT_METHOD && (
                  <div className="mt-2 mb-3 respect-newlines">
                    {payment_options[payment_method]}
                  </div>
                )}
              </>
            )}

            {!can_pay && (
              <>
                <div className="col-12">
                  <FormGroup check>
                    <Field
                      type="checkbox"
                      name="scholarship_support"
                      id="scholarship_support"
                      className="form-check-input"
                    />{' '}
                    <Label for="scholarship_support">
                      I need scholarship support
                    </Label>
                  </FormGroup>
                </div>
                {scholarship_support && (
                  <div
                    className="my-2"
                    dangerouslySetInnerHTML={{
                      __html: scholarship_info,
                    }}
                  />
                )}
              </>
            )}

            {/*

          - if country is african
            - show checkbox "yes, I can pay activeTier[pricingField]"
              - if not show sliding scale
            - show payment method choices [credit_card, bank_transfer, mobile_money_transfer]
              - if credit_card then do nothing
              - if bank_transfer then display info
              - if mobile_money_transfer display info

          - show checkbox "I'd like to support the retreat by donating a little more"
            - if yes, display input with number

          - show checkbox "I don't need scholarship support"
            - if yes, display scholarship info

            */}

            <div className="col-12">
              <FormGroup check>
                <Field
                  type="checkbox"
                  name="terms"
                  id="terms"
                  className={classnames('form-check-input', {
                    'is-invalid': errors.terms && touched.terms,
                  })}
                />{' '}
                <Label for="terms">
                  I accept the{' '}
                  <a href={terms_url} target="_blank" rel="noreferrer">
                    Participants Agreements
                  </a>{' '}
                  of the retreat
                </Label>
                <ErrorMessage
                  name="terms"
                  component="div"
                  className="invalid-feedback"
                />
              </FormGroup>
            </div>

            <div className="mt-3">
              <Button
                size="lg"
                block
                color="primary"
                type="submit"
                disabled={isSubmitting || !isValid}>
                Register
              </Button>
              {payment_method === DEFAULT_PAYMENT_METHOD && (
                <div className="mt-2 small text-body-tertiary text-center">
                  You will be redirected to make payment
                </div>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
}

RegistrationForm.propTypes = {
  terms_url: PropTypes.string,
  order_item: PropTypes.string,
  onSubmit: PropTypes.func,
  tiers: PropTypes.array,
  sliding_scale: PropTypes.object,
  scholarship_info: PropTypes.string,
  payment_options: PropTypes.object,
};

function createNumberArray(min, max, step) {
  const result = [];
  for (let i = min; i <= max; i += step) {
    result.push(i);
  }
  return result;
}
