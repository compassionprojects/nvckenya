import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik';
import { FormGroup, Label, Button } from 'reactstrap';
import { object, string, boolean, number } from 'yup';
import classnames from 'classnames';
import axios from 'axios';
import isBefore from 'date-fns/isBefore';
import isAfter from 'date-fns/isAfter';
import format from 'date-fns/format';
import { countries, countryCodes, isAfrica } from '../lib/countries';

const FORM_NAME = 'registration';
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
  price_slided: number().optional(),
  need_scholarship: boolean().required(),
  need_accommodation: boolean().required(),
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
  payment_method: DEFAULT_PAYMENT_METHOD,
  need_scholarship: false,
  need_accommodation: false,
  price_slided: 0,
};

export default function RegistrationForm({
  terms_url,
  order_item,
  onSubmit,
  tiers,
  sliding_scale,
  scholarship_info,
  payment_options,
  currency,
}) {
  // we give discounts through parity pricing and sliding scale for african countries
  const [isAfricanCountry, setIsAfricanCountry] = useState(false);

  // to show the actual price or the parity price
  // - price is the default field which displays actual price
  // - parity_price is the field which displays parity prices for discounted countries
  const [pricingField, setPricingField] = useState('price');
  const onCountrySelect = (c) => {
    const _isAfrica = isAfrica(c);
    if (_isAfrica) {
      setPricingField('parity_price');
    } else setPricingField('price');
    setIsAfricanCountry(_isAfrica);
  };

  // transform the data properly in order to display
  const _tiers = tiers.map(transformTier);

  // through above transformation, find out which tier is active
  const [activeTier] = _tiers.filter((t) => t.isActive);

  const handleSubmit = async (values, { setSubmitting }) => {
    // @todo: calculate total price, consider sliding scale, donation amount and accommodation price
    const totalPrice = activeTier[pricingField];

    const formData = {
      ...values,
      price: totalPrice,
      order_item: `${order_item} - ${activeTier.title}`,
      'form-name': FORM_NAME,
    };

    console.log(formData);

    // skip for development or if last name is testing
    /* if (
      process.env.NODE_ENV !== 'development' &&
      !values.last_name.toLowerCase().includes('testing')
    ) {
      await axios.post('/', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
    } else {
      console.log(formData);
    } */

    // if not bank_transfer or mobile_money_transfer create order
    // const { data } = await axios.post('/api/create_order', formData);
    // alert(JSON.stringify(data, null, 2));
    // redirect user to data.paymentUrl

    setSubmitting(false);
    onSubmit && onSubmit(formData);
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
              {currency.symbol}
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
          values: { can_pay, payment_method, need_scholarship, price_slided },
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
                    setFieldValue('need_scholarship', false);
                    if (isAfrica(code)) {
                      setFieldValue('price_slided', sliding_scale.max);
                    } else setFieldValue('price_slided', 0);
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

            <FieldCountryDefault onCountrySelect={onCountrySelect} />

            <div className="col-12">
              <FormGroup check>
                <Field
                  type="checkbox"
                  name="can_pay"
                  id="can_pay"
                  className="form-check-input"
                />{' '}
                <Label for="can_pay">
                  Yes, I am able to contribute and pay{' '}
                  {activeTier[pricingField]}
                  {currency.symbol}
                </Label>
                {isAfricanCountry && !can_pay && (
                  <div className="my-2">
                    <Label for="price_slided">{sliding_scale.intro}</Label>
                    <div className="d-flex justify-content-between">
                      <small className="text-body-tertiary">
                        {sliding_scale.min}
                        {currency.symbol}
                      </small>
                      <small className="text-body-tertiary">
                        {sliding_scale.max}
                        {currency.symbol}
                      </small>
                    </div>
                    <div className="col-12">
                      <Field
                        type="range"
                        name="price_slided"
                        className="form-range"
                        id="price_slided"
                        min={sliding_scale.min}
                        max={sliding_scale.max}
                        step={sliding_scale.step}
                      />
                      <div className="mb-3">
                        You have chosen{' '}
                        <strong>
                          {price_slided}
                          {currency.symbol}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
                {!can_pay && (
                  <div className="col-12">
                    <FormGroup check>
                      <Field
                        type="checkbox"
                        name="need_scholarship"
                        id="need_scholarship"
                        className="form-check-input"
                      />{' '}
                      <Label for="need_scholarship">
                        I need support with a scholarship
                      </Label>
                      {need_scholarship && (
                        <div
                          className="my-1"
                          dangerouslySetInnerHTML={{
                            __html: scholarship_info,
                          }}
                        />
                      )}
                    </FormGroup>
                  </div>
                )}
              </FormGroup>
            </div>

            {isAfricanCountry && (
              <>
                <div className="col-12 mt-2">
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

            <div className="col-12">
              <FormGroup check>
                <Field
                  type="checkbox"
                  name="need_accommodation"
                  id="need_accommodation"
                  className="form-check-input"
                />{' '}
                <Label for="need_accommodation">
                  I need accommodation for {activeTier.price_accommodation}
                  {currency.symbol}{' '}
                  <span className="text-muted">(optional)</span>
                </Label>
              </FormGroup>
            </div>

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
  currency: PropTypes.object,
};

function FieldCountryDefault({ onCountrySelect }) {
  const { setFieldValue } = useFormikContext();
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') return;

    async function getCountryData() {
      const {
        data: { countryCode },
      } = await axios.get('/api/get_country');
      return countryCode;
    }

    getCountryData().then((c) => {
      setFieldValue('country', c);
      onCountrySelect(c);
    });
  }, []);
  return null;
}

FieldCountryDefault.propTypes = {
  onCountrySelect: PropTypes.func,
};

function transformTier(t) {
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
}
