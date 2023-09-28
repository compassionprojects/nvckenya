import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import classnames from 'classnames';
import { marked } from 'marked';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import styled from 'styled-components';
import format from 'date-fns/format';
import Footer from '../components/Footer';

// get the latest retreat by sorting latest
export const query = graphql`
  query {
    allRetreatsYaml(sort: { start_date: ASC }) {
      edges {
        node {
          intro
          title
          contact_email
          start_date
          end_date
          city
          hero_image {
            publicURL
          }
          program {
            introduction
            goals
            pricing
            cancellation_policy
            accommodation_details
            accommodation_photo {
              publicURL
            }
            facilities
            location
            trainers_intro
            trainers
            organisers
            travel
          }
        }
      }
    }
    allTeamYaml {
      edges {
        node {
          user_id
          title
          bio
          role
          photo {
            publicURL
          }
        }
      }
    }
  }
`;

export default function Home({ data }) {
  // display the latest retreat
  const {
    title,
    intro,
    contact_email,
    hero_image,
    program,
    start_date,
    end_date,
    city,
  } = data.allRetreatsYaml.edges[0].node;
  const people = data.allTeamYaml.edges.map((e) => e.node);
  const trainers = people.filter((p) => program.trainers.includes(p.user_id));
  const organisers = people.filter((p) =>
    program.organisers.includes(p.user_id),
  );

  const dates = getDates(start_date, end_date);

  return (
    <>
      <div className="px-2 py-5 mt-5 text-center border-bottom">
        <div className="col-lg-6 mx-auto">
          <h1 className="display-4 fw-bold text-body-emphasis">{title}</h1>
          <p className="lead my-4">{intro}</p>
          <div className="my-4">
            <strong>
              {dates}, {city}
            </strong>
          </div>
          <div className="mb-5 mt-3">
            <Register />
          </div>
        </div>
        <div style={{ maxHeight: '30vh' }}>
          <div className="container px-lg-5 mb-4">
            <img
              src={hero_image.publicURL}
              className="img-fluid rounded-3 shadow-lg mb-4"
              alt="Hero Image"
              width={800}
              loading="lazy"
            />
          </div>
        </div>
      </div>
      <nav
        id="navbar"
        className="sticky-top bg-body navbar-expand overflow-x-scroll hide-scrollbars border-bottom">
        <ul className="nav nav-underline nav-fill flex-nowrap">
          <li className="nav-item pt-3">
            <a className="nav-link pb-3" href="#program">
              Program
            </a>
          </li>
          <li className="nav-item pt-3">
            <a className="nav-link pb-3" href="#team">
              Team
            </a>
          </li>
          <li className="nav-item pt-3">
            <a className="nav-link pb-3" href="#pricing">
              Pricing
            </a>
          </li>
          <li className="nav-item pt-3">
            <a className="nav-link pb-3" href="#cancellations">
              Cancellations
            </a>
          </li>
          <li className="nav-item pt-3">
            <a className="nav-link pb-3" href="#accommodation">
              Accommodation
            </a>
          </li>
          <li className="nav-item pt-3 flex-shrink-0">
            <a className="nav-link pb-3" href="#travel">
              Getting there
            </a>
          </li>
          <li className="nav-item pt-3">
            <a className="nav-link pb-3" href="#registrations">
              Registrations
            </a>
          </li>
        </ul>
      </nav>
      <div
        data-bs-spy="scroll"
        data-bs-target="#navbar"
        data-bs-root-margin="0px 0px -40%"
        data-bs-smooth-scroll="false">
        <Section id="program">
          <h1 className="text-center fw-bold">Program</h1>
          <div className="col-lg-6 mx-auto my-3">
            <div
              dangerouslySetInnerHTML={{
                __html: marked.parse(program.introduction),
              }}
            />
          </div>
          <div className="col-lg-6 mx-auto my-5">
            <h2 className="text-center">Goals</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: marked.parse(program.goals),
              }}
            />
          </div>
          <div className="text-center mt-5 mb-4">
            <Register />
          </div>
        </Section>

        {/* Team */}
        <Section id="team">
          <h1 className="text-center fw-bold">Team</h1>
          <div className="col-lg-5 mx-auto text-center mt-3 mb-4">
            <p>{program.trainers_intro}</p>
          </div>
          <div className="col-lg-8 mx-auto my-3">
            <div className="row">
              {trainers.map((trainer) => (
                <Person key={trainer.user_id} data={trainer} />
              ))}
            </div>
          </div>

          <div className="col-lg-8 mx-auto my-5">
            <h2 className="text-center">Organisers team</h2>
            <div className="row mt-3">
              {organisers.map((organiser) => (
                <Person key={organiser.user_id} data={organiser} />
              ))}
            </div>
          </div>
          <div className="text-center mt-5 mb-4">
            <Register />
          </div>
        </Section>

        {/* Pricing */}
        <Section id="pricing">
          <h1 className="text-center fw-bold">Pricing</h1>
          <div
            className="col-lg-6 mx-auto my-3"
            dangerouslySetInnerHTML={{ __html: marked.parse(program.pricing) }}
          />
          <div className="text-center mt-5 mb-4">
            <Register />
          </div>
        </Section>

        {/* Cancellations */}
        <Section id="cancellations">
          <h1 className="text-center fw-bold">
            Cancellation and refund policy
          </h1>
          <div
            className="col-lg-6 mx-auto my-3"
            dangerouslySetInnerHTML={{
              __html: marked.parse(program.cancellation_policy),
            }}
          />
          <div className="text-center mt-5 mb-4">
            <Register />
          </div>
        </Section>

        {/* Accommodation */}
        <Section id="accommodation">
          <h1 className="text-center fw-bold">Accommodation</h1>
          <div className="col-lg-6 mx-auto my-3">
            <div
              dangerouslySetInnerHTML={{
                __html: marked.parse(program.accommodation_details),
              }}
            />
          </div>
          <div className="container px-lg-5 text-center">
            <img
              src={program.accommodation_photo.publicURL}
              className="img-fluid rounded-3 shadow-lg mb-4 my-3"
              alt="Hero Image"
              width={700}
              loading="lazy"
            />
          </div>
          <div className="container">
            <div className="row">
              <div className="col-lg-5 col-md-6 mx-md-auto my-5">
                <h2>Facilities</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(program.facilities),
                  }}
                />
              </div>
              <div className="col-lg-5 col-md-6 mx-lg-auto my-5">
                <h2>Location</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(program.location),
                  }}
                />
              </div>
            </div>
          </div>
          <div className="text-center mt-5 mb-4">
            <Register />
          </div>
        </Section>

        {/* Travel */}
        <Section id="travel">
          <h1 className="text-center fw-bold">Getting there</h1>
          <div className="col-lg-6 mx-auto my-3">
            <div
              dangerouslySetInnerHTML={{
                __html: marked.parse(program.travel),
              }}
            />
          </div>
        </Section>

        {/* Registrations */}
        <Section id="registrations">
          <h1 className="text-center fw-bold">Register</h1>
          <div className="col-lg-6 mx-auto my-3 text-center">
            <p>
              Registrations will soon be open, in the meantime if you have
              questions, you may contact us
            </p>
            <a href={`mailto:${contact_email}`} className="btn btn-secondary">
              Contact us
            </a>
          </div>
        </Section>

        <Footer />
      </div>
    </>
  );
}

Home.propTypes = {
  data: PropTypes.object,
};

export const Head = () => <title>NVC Kenya</title>;

function Section({ center, prewrap, ...props }) {
  return (
    <section
      style={{ whiteSpace: prewrap ? 'pre-wrap' : 'normal' }}
      className={classnames('px-2 py-5 my-5 border-bottom', {
        'text-center': center,
      })}
      {...props}
    />
  );
}

Section.propTypes = {
  center: PropTypes.bool,
  prewrap: PropTypes.bool,
};

function Person({ data }) {
  const [modal, setModal] = useState(false);

  const toggle = () => setModal(!modal);

  return (
    <div className="col-xl-3 col-md-4 col-6 my-3 text-center" key={data.id}>
      <div className="px-3">
        <Avatar bg={data.photo.publicURL} onClick={toggle} />
      </div>
      <div className="fw-bold my-2 cursor-pointer" onClick={toggle}>
        {data.title}
      </div>

      <Modal isOpen={modal} toggle={toggle} centered size="lg">
        <ModalHeader toggle={toggle}>{data.title}</ModalHeader>
        <ModalBody>
          <p>
            <em>{data.role}</em>
          </p>
          <div
            dangerouslySetInnerHTML={{
              __html: marked.parse(data.bio),
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

Person.propTypes = {
  data: PropTypes.object,
};

function Register() {
  return (
    <a href="#registrations" className="btn btn-primary btn-lg">
      Register
    </a>
  );
}

const Avatar = styled.div.attrs({
  className: 'cursor-pointer rounded-circle mx-auto',
})`
  background: url(${(props) => props.bg}) no-repeat;
  background-position: center center;
  background-size: cover;
  resize: both;
  height: 150px;
  width: 150px;
`;

function getDates(start_date, end_date) {
  const start_day = format(new Date(start_date), 'do');
  const start_month = format(new Date(start_date), 'MMMM');
  const start_year = format(new Date(start_date), 'yyyy');

  const end_day = format(new Date(end_date), 'do');
  const end_month = format(new Date(end_date), 'MMMM');
  const end_year = format(new Date(end_date), 'yyyy');

  if (start_month === end_month && start_year === end_year) {
    return `${start_day} - ${end_day} ${end_month} ${end_year}`;
  } else if (start_year === end_year && start_month !== end_month) {
    return `${start_day} ${start_month} - ${end_day} ${end_month} ${end_year}`;
  } else {
    return `${start_day} ${start_month} ${start_year} - ${end_day} ${end_month} ${end_year}`;
  }
}
