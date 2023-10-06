import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  useFormikContext,
  getIn,
} from 'formik';
import {
  FormGroup,
  Label,
  Button,
  InputGroup,
  InputGroupText,
  Alert,
} from 'reactstrap';
import { object, string, boolean, number } from 'yup';
import classnames from 'classnames';
import axios from 'axios';
import isBefore from 'date-fns/isBefore';
import isAfter from 'date-fns/isAfter';
import format from 'date-fns/format';
import { countries, countryCodes, isAfrica } from '../lib/countries';
import { createOrderItems } from '../lib/order';

const FORM_NAME = 'registration';
const DEFAULT_PAYMENT_METHOD = 'mollie';

const payment_methods = [
  { name: 'Credit or debit card', method: DEFAULT_PAYMENT_METHOD },
  { name: 'Direct Bank transfer', method: 'bank_transfer' },
  { name: 'Mobile money transfer (Mpesa)', method: 'mobile_money_transfer' },
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
  cannot_pay: boolean().required(),
  can_donate: boolean().optional(),
  price_slided: number().optional(),
  donation_amount: number().optional(),
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
  cannot_pay: false,
  can_donate: false,
  payment_method: DEFAULT_PAYMENT_METHOD,
  need_scholarship: false,
  need_accommodation: false,
  price_slided: 0,
  donation_amount: 5,
};

export default function RegistrationForm({
  registration_info,
  terms_url,
  onSubmit,
  tiers,
  sliding_scale,
  scholarship_info,
  payment_options,
  currency,
  contact_email,
}) {
  // @todo change naming from isAfrica to hasParity or hasDiscount
  // we give discounts through parity pricing and sliding scale for african countries
  const [isAfricanCountry, setIsAfricanCountry] = useState(false);

  const [failure, setFailure] = useState([]);

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

  // Registration process
  // - we are going to create all orders in Mollie
  //  - if order creation in Mollie fails then we post to netlify forms
  //  - if payment_method is bank_transfer or mobile_money_transfer then
  //    also we post to netlify forms

  const handleSubmit = async (values, { setSubmitting }) => {
    setFailure([]);

    // create order items, there can be only two 1) accommodation 2) tuition
    const items = createOrderItems(activeTier, values);

    // create the final form data
    const formData = {
      ...values,
      activeTier,
      totalPrice: items.reduce((sum, x) => sum + x.amount, 0),
      items,
      'form-name': FORM_NAME,
    };

    const errors = [];
    const shouldPayNow =
      ((isAfricanCountry && values.payment_method === DEFAULT_PAYMENT_METHOD) ||
        !isAfricanCountry) &&
      !values.need_scholarship;
    // skip for development or if last name is testing
    const canSaveToNetlify =
      process.env.NODE_ENV !== 'development' &&
      !values.last_name.toLowerCase().includes('testing');
    const confirmationUrl = `/confirmation?need_scholarship=${values.need_scholarship}&payment_method=${values.payment_method}`;
    let paymentUrl;

    // create order in Mollie and get the payment url
    try {
      const { data } = await axios.post('/api/create_order', formData);
      paymentUrl = data.paymentUrl.href;
    } catch (error) {
      console.log(error);
      errors.push('Creating your order failed');
    }

    // save all registrations in netlify forms for easy export
    if (canSaveToNetlify) {
      try {
        await axios.post('/', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
      } catch (e) {
        console.log(e);
        errors.push('Registration failed');
      }
    }

    if (errors.length === 0) {
      window.location = shouldPayNow ? paymentUrl : confirmationUrl;
    } else {
      console.log(formData);
    }

    if (errors.length > 0) {
      setFailure(errors.concat('Please consider trying again in some time'));
    }

    setSubmitting(false);
    onSubmit && onSubmit(formData);
  };

  // if there's no active tier, close the registration form
  if (!activeTier) {
    return (
      <div className="text-center">
        The registration for this event is closed. Please contact us if you have
        any questions
        <div className="my-5">
          <a href={`mailto:${contact_email}`} className="btn btn-primary">
            Contact us
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: registration_info }} />
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
          values: {
            cannot_pay,
            payment_method,
            need_scholarship,
            price_slided,
          },
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

                    setFieldValue('cannot_pay', false);
                    setFieldValue('need_scholarship', false);
                    if (isAfrica(code)) {
                      setFieldValue('price_slided', sliding_scale.max);
                      // @todo remove once credit card payments are accepted
                      setFieldValue('payment_method', 'bank_transfer');
                    } else {
                      setFieldValue('price_slided', 0);
                      // @todo remove once credit card payments are accepted
                      setFieldValue('payment_method', DEFAULT_PAYMENT_METHOD);
                    }
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
                <FieldCannotPay />{' '}
                <Label for="cannot_pay">
                  No, I am not able to contribute and pay{' '}
                  {activeTier[pricingField]}
                  {currency.symbol}
                </Label>
                {isAfricanCountry && cannot_pay && (
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
                      <div className="mb-3 text-center">
                        <strong>
                          {price_slided}
                          {currency.symbol}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
                {cannot_pay && (
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

            {isAfricanCountry && !need_scholarship && (
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
                    <Label for="payment_method">Chosen payment method</Label>
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
                  I would like to pay {activeTier.price_accommodation}
                  {currency.symbol} for the accommodation now{' '}
                  <span className="text-muted">
                    (or you may also pay on arrival)
                  </span>
                </Label>
              </FormGroup>
            </div>

            <FieldDonation currency={currency} />

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

            {!need_scholarship && (
              <TotalPayable activeTier={activeTier} currency={currency} />
            )}

            <div className="mt-3">
              <Button
                size="lg"
                block
                color="primary"
                type="submit"
                disabled={isSubmitting || !isValid}>
                Register
              </Button>
              {payment_method === DEFAULT_PAYMENT_METHOD &&
                !need_scholarship && (
                  <div className="mt-2 small text-body-tertiary text-center">
                    You will be redirected to make payment
                  </div>
                )}
            </div>

            {failure.length > 0 && (
              <Alert color="danger" className="mt-4">
                <ul className="m-0">
                  {failure.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              </Alert>
            )}
          </Form>
        )}
      </Formik>
    </>
  );
}

RegistrationForm.propTypes = {
  registration_info: PropTypes.string,
  terms_url: PropTypes.string,
  onSubmit: PropTypes.func,
  tiers: PropTypes.array,
  sliding_scale: PropTypes.object,
  scholarship_info: PropTypes.string,
  payment_options: PropTypes.object,
  currency: PropTypes.object,
  contact_email: PropTypes.string,
};

function FieldCountryDefault({ onCountrySelect }) {
  const { setFieldValue } = useFormikContext();
  useEffect(() => {
    async function getCountryData() {
      const { data } = await axios.get('/api/get_country');
      return data.country;
    }

    getCountryData()
      .then((c) => {
        setFieldValue('country', c);
        onCountrySelect(c);
      })
      .catch((e) => console.log(e));
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

function TotalPayable({ activeTier, currency }) {
  const [items, setItems] = useState([]);
  const { values } = useFormikContext();

  const cannot_pay = getIn(values, 'cannot_pay');
  const country = getIn(values, 'country');
  const need_accommodation = getIn(values, 'need_accommodation');
  const price_slided = getIn(values, 'price_slided');
  const can_donate = getIn(values, 'can_donate');
  const donation_amount = getIn(values, 'donation_amount');

  useEffect(() => {
    setItems(createOrderItems(activeTier, values));
  }, [
    cannot_pay,
    country,
    need_accommodation,
    price_slided,
    can_donate,
    donation_amount,
  ]);

  return (
    <div className=" my-4">
      {items.map((item, idx) => (
        <div className="d-flex justify-content-between text-muted" key={idx}>
          <span>{item.name}</span>
          <span>
            {item.amount}
            {currency.symbol}
          </span>
        </div>
      ))}
      <div className="d-flex justify-content-between border-top mt-2 pt-2">
        <strong>Total payable</strong>
        <strong>
          {items.reduce((sum, x) => sum + x.amount, 0)}
          {currency.symbol}
        </strong>
      </div>
    </div>
  );
}

TotalPayable.propTypes = {
  activeTier: PropTypes.object,
  currency: PropTypes.object,
};

function FieldDonation({ currency }) {
  const {
    errors,
    touched,
    setFieldValue,
    values: { can_donate },
  } = useFormikContext();

  const validate = (value) => {
    if (!can_donate) return;
    if (parseInt(value, 10) > 0) return;
    return 'Please enter a valid donation amount';
  };

  // if can_donate is unset, set donation amount to 0 otherwise set it to
  // the initial value
  useEffect(() => {
    setFieldValue(
      'donation_amount',
      !can_donate ? 0 : initialValues.donation_amount,
    );
  }, [can_donate]);

  return (
    <div className="col-12">
      <FormGroup check>
        <Field
          type="checkbox"
          name="can_donate"
          id="can_donate"
          className="form-check-input"
        />{' '}
        <Label for="can_donate">
          I would enjoy supporting the scholarship funds by donating{' '}
          <span className="text-body-tertiary">(optional)</span>
        </Label>
        {can_donate && (
          <div className="col-6 mb-2">
            <InputGroup>
              <InputGroupText>{currency.symbol}</InputGroupText>
              <Field
                placeholder="Enter an amount"
                name="donation_amount"
                type="number"
                min={1}
                className={classnames('form-control money', {
                  'is-invalid':
                    errors.donation_amount && touched.donation_amount,
                })}
                validate={validate}
              />
            </InputGroup>
          </div>
        )}
      </FormGroup>
    </div>
  );
}

FieldDonation.propTypes = {
  currency: PropTypes.object,
};

function FieldCannotPay() {
  const {
    values: { cannot_pay },
    setFieldValue,
  } = useFormikContext();

  useEffect(() => {
    setFieldValue('need_scholarship', false);
  }, [cannot_pay]);

  return (
    <Field
      type="checkbox"
      name="cannot_pay"
      id="cannot_pay"
      className="form-check-input"
    />
  );
}
