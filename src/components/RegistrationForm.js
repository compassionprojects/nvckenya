import React from 'react';
import PropTypes from 'prop-types';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { FormGroup, Label, Button } from 'reactstrap';
import { object, string, boolean } from 'yup';
import classnames from 'classnames';
import axios from 'axios';

let paymentSchema = object({
  name: string().required(),
  email: string().email().required(),
  terms: boolean()
    .oneOf([true], 'You must read and accept the Participants Agreement')
    .required(),
});

export default function RegistrationForm({ terms_url, price }) {
  const handleSubmit = async (values, { setSubmitting }) => {
    const { data } = await axios.post('/api/payment', { price });
    alert(JSON.stringify(data, null, 2));
    // todo: redirect user to data.paymentUrl
    setSubmitting(false);
  };

  return (
    <Formik
      initialValues={{ email: '', name: '', terms: false }}
      validationSchema={paymentSchema}
      onSubmit={handleSubmit}>
      {({ isSubmitting, errors, touched, isValid }) => (
        <Form data-netlify="true" name="registration" method="post">
          <FormGroup floating>
            <Field
              placeholder="Name"
              type="text"
              name="name"
              className={classnames('form-control', {
                'is-invalid': errors.name && touched.name,
              })}
            />
            <Label for="name">Name</Label>
          </FormGroup>

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
        </Form>
      )}
    </Formik>
  );
}

RegistrationForm.propTypes = {
  terms_url: PropTypes.string,
  price: PropTypes.number,
};
