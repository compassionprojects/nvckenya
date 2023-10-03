import React from 'react';
import PropTypes from 'prop-types';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { countries, countryCodes, isAfrica } from '../lib/countries';
import { FormGroup, Label, Button } from 'reactstrap';
import { object, string, boolean } from 'yup';
import classnames from 'classnames';
import axios from 'axios';

const FORM_NAME = 'registration';

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
};

export default function RegistrationForm({ terms_url, price, order_item }) {
  const handleSubmit = async (values, { setSubmitting }) => {
    const formData = {
      ...values,
      price,
      order_item,
    };

    // @todo: submit the form to netlify first, use form-name attribute
    await axios.post(
      '/',
      { ...formData, 'form-name': FORM_NAME },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    // @todo: if african countries,
    if (isAfrica(values.country)) {
      // display payment options with parity rates
    } else {
      // @todo: otherwise create order
      const { data } = await axios.post('/api/create_order', formData);
      alert(JSON.stringify(data, null, 2));
      // redirect user to data.paymentUrl
    }

    setSubmitting(false);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={paymentSchema}
      onSubmit={handleSubmit}>
      {({ isSubmitting, errors, touched, isValid }) => (
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
            <FormGroup>
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

            <Button
              size="lg"
              color="primary"
              type="submit"
              disabled={isSubmitting || !isValid}>
              Register
            </Button>
            <div className="mt-2 small text-body-tertiary">
              You will be redirected to make payment
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}

RegistrationForm.propTypes = {
  terms_url: PropTypes.string,
  price: PropTypes.number,
  order_item: PropTypes.string,
};
